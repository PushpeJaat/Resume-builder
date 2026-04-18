import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  createCashfreeOrderId,
  getCashfreeBaseUrl,
  getCashfreeConfig,
  getCashfreeErrorMessage,
  getCashfreeOrderStatus,
  mapCashfreeOrderStatus,
} from "@/lib/cashfree";
import { prisma } from "@/lib/prisma";
import { assertResumeOwner } from "@/lib/resume-access";
import { getPlanDownloadAccess } from "@/lib/server/plan-access";

export const runtime = "nodejs";

const createOrderSchema = z.object({
  resumeId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { resumeId } = parsed.data;
  const { error, resume } = await assertResumeOwner(resumeId, session.user.id);

  if (error || !resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const planAccess = await getPlanDownloadAccess(session.user.id);

  if (planAccess.status === "ACTIVE") {
    return NextResponse.json({
      alreadyPaid: true,
      planActive: true,
      downloadsUsed: planAccess.downloadsUsed,
      downloadLimit: planAccess.downloadLimit,
      downloadsRemaining: planAccess.downloadsRemaining,
    });
  }

  if (planAccess.status === "LIMIT_REACHED") {
    return NextResponse.json(
      {
        error: `Download limit reached. You can download up to ${planAccess.downloadLimit} resumes per plan period.`,
        code: "DOWNLOAD_LIMIT_REACHED",
        redirectTo: "/pricing",
        downloadsUsed: planAccess.downloadsUsed,
        downloadLimit: planAccess.downloadLimit,
      },
      { status: 403 },
    );
  }

  const config = getCashfreeConfig();

  if (!config) {
    return NextResponse.json(
      {
        error: "Cashfree is not configured. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY.",
      },
      { status: 500 },
    );
  }

  const orderId = createCashfreeOrderId(resumeId);
  const customerEmail =
    typeof session.user.email === "string" && session.user.email.includes("@")
      ? session.user.email
      : `${session.user.id}@cvpilot.local`;
  const customerName =
    typeof session.user.name === "string" && session.user.name.trim().length > 0
      ? session.user.name
      : "CVpilot Customer";

  const requestUrl = new URL(req.url);
  const baseUrl = getCashfreeBaseUrl(config.mode);
  const createOrderResponse = await fetch(`${baseUrl}/pg/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-id": config.appId,
      "x-client-secret": config.secretKey,
      "x-api-version": config.apiVersion,
    },
    body: JSON.stringify({
      order_id: orderId,
      order_amount: config.amountInPaise / 100,
      order_currency: config.currency,
      customer_details: {
        customer_id: session.user.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: "9999999999",
      },
      order_meta: {
        return_url: `${requestUrl.origin}/editor/${resumeId}?payment=1&order_id={order_id}`,
      },
      order_note: `Resume PDF download for ${resume.title.slice(0, 60)}`,
    }),
    cache: "no-store",
  });

  const createOrderPayload = await createOrderResponse.json().catch(() => null);

  if (!createOrderResponse.ok) {
    return NextResponse.json(
      {
        error: getCashfreeErrorMessage(createOrderPayload, "Cashfree order creation failed."),
      },
      { status: 502 },
    );
  }

  const paymentSessionId =
    typeof (createOrderPayload as { payment_session_id?: unknown })?.payment_session_id === "string"
      ? (createOrderPayload as { payment_session_id: string }).payment_session_id
      : typeof (createOrderPayload as { paymentSessionId?: unknown })?.paymentSessionId === "string"
        ? (createOrderPayload as { paymentSessionId: string }).paymentSessionId
        : null;

  if (!paymentSessionId) {
    return NextResponse.json({ error: "Cashfree did not return a payment session." }, { status: 502 });
  }

  const cashfreeOrderStatus = getCashfreeOrderStatus(createOrderPayload);

  await prisma.paymentOrder.create({
    data: {
      userId: session.user.id,
      resumeId,
      providerOrderId: orderId,
      paymentSessionId,
      amountInPaise: config.amountInPaise,
      currency: config.currency,
      status: mapCashfreeOrderStatus(cashfreeOrderStatus),
      cashfreeOrderStatus,
      metadata: {
        cashfreeCreateOrder: createOrderPayload,
      },
    },
  });

  return NextResponse.json({
    orderId,
    paymentSessionId,
    mode: config.mode,
    amount: config.amountInPaise / 100,
    currency: config.currency,
  });
}
