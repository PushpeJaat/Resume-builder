import { auth } from "@/auth";
import {
  createCashfreeOrderId,
  getCashfreeBaseUrl,
  getCashfreeConfig,
  getCashfreeErrorMessage,
  getCashfreeOrderStatus,
  mapCashfreeOrderStatus,
} from "@/lib/cashfree";
import {
  apiSuccess,
  internalServerError,
  unauthorizedError,
  upstreamError,
} from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { getPlanDownloadAccess } from "@/lib/server/plan-access";
import { DEFAULT_TEMPLATE_ID } from "@/lib/templates/registry";
import { emptyResumeData } from "@/types/resume";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return unauthorizedError();
  }

  const planAccess = await getPlanDownloadAccess(session.user.id);

  if (planAccess.status === "ACTIVE") {
    return apiSuccess(
      {
        alreadyPaid: true,
        planActive: true,
        downloadsUsed: planAccess.downloadsUsed,
        downloadLimit: planAccess.downloadLimit,
        downloadsRemaining: planAccess.downloadsRemaining,
      },
      { code: "PLAN_ALREADY_ACTIVE" },
    );
  }

  const config = getCashfreeConfig();

  if (!config) {
    return internalServerError("Cashfree is not configured. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY.");
  }

  const latestResume = await prisma.resume.findFirst({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
    },
  });

  const resume = latestResume
    ? latestResume
    : await prisma.resume.create({
        data: {
          userId: session.user.id,
          title: "Subscription Purchase",
          templateId: DEFAULT_TEMPLATE_ID,
          data: emptyResumeData() as object,
        },
        select: {
          id: true,
          title: true,
        },
      });

  const orderId = createCashfreeOrderId(resume.id);
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
        return_url: `${requestUrl.origin}/pricing?payment=1&order_id={order_id}`,
      },
      order_note: `CVpilot subscription purchase for ${resume.title.slice(0, 60)}`,
    }),
    cache: "no-store",
  });

  const createOrderPayload = await createOrderResponse.json().catch(() => null);

  if (!createOrderResponse.ok) {
    return upstreamError(getCashfreeErrorMessage(createOrderPayload, "Cashfree order creation failed."));
  }

  const paymentSessionId =
    typeof (createOrderPayload as { payment_session_id?: unknown })?.payment_session_id === "string"
      ? (createOrderPayload as { payment_session_id: string }).payment_session_id
      : typeof (createOrderPayload as { paymentSessionId?: unknown })?.paymentSessionId === "string"
        ? (createOrderPayload as { paymentSessionId: string }).paymentSessionId
        : null;

  if (!paymentSessionId) {
    return upstreamError("Cashfree did not return a payment session.");
  }

  const cashfreeOrderStatus = getCashfreeOrderStatus(createOrderPayload);

  await prisma.paymentOrder.create({
    data: {
      userId: session.user.id,
      resumeId: resume.id,
      providerOrderId: orderId,
      paymentSessionId,
      amountInPaise: config.amountInPaise,
      currency: config.currency,
      status: mapCashfreeOrderStatus(cashfreeOrderStatus),
      cashfreeOrderStatus,
      metadata: {
        cashfreeCreateOrder: createOrderPayload,
        source: "pricing-subscribe",
      },
    },
  });

  return apiSuccess(
    {
      orderId,
      paymentSessionId,
      mode: config.mode,
      amount: config.amountInPaise / 100,
      currency: config.currency,
      resumeId: resume.id,
    },
    { code: "SUBSCRIPTION_ORDER_CREATED" },
  );
}
