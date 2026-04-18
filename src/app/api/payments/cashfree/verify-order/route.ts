import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import {
  getCashfreeBaseUrl,
  getCashfreeConfig,
  getCashfreeErrorMessage,
  getCashfreeOrderStatus,
  mapCashfreeOrderStatus,
} from "@/lib/cashfree";
import { prisma } from "@/lib/prisma";
import { assertResumeOwner } from "@/lib/resume-access";

export const runtime = "nodejs";

const verifyOrderSchema = z.object({
  resumeId: z.string().min(1),
  orderId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await req.json().catch(() => null);
  const parsed = verifyOrderSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { resumeId, orderId } = parsed.data;
  const { error, resume } = await assertResumeOwner(resumeId, session.user.id);

  if (error || !resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const existingOrder = await prisma.paymentOrder.findFirst({
    where: {
      userId: session.user.id,
      resumeId,
      providerOrderId: orderId,
    },
  });

  if (!existingOrder) {
    return NextResponse.json({ error: "Payment order not found" }, { status: 404 });
  }

  if (existingOrder.status === "PAID") {
    return NextResponse.json({
      paid: true,
      orderId,
      orderStatus: existingOrder.cashfreeOrderStatus || "PAID",
    });
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

  const baseUrl = getCashfreeBaseUrl(config.mode);
  const verifyResponse = await fetch(`${baseUrl}/pg/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: {
      "x-client-id": config.appId,
      "x-client-secret": config.secretKey,
      "x-api-version": config.apiVersion,
    },
    cache: "no-store",
  });

  const verifyPayload = await verifyResponse.json().catch(() => null);

  if (!verifyResponse.ok) {
    return NextResponse.json(
      {
        error: getCashfreeErrorMessage(verifyPayload, "Could not verify payment status."),
      },
      { status: 502 },
    );
  }

  const cashfreeOrderStatus = getCashfreeOrderStatus(verifyPayload);
  const mappedStatus = mapCashfreeOrderStatus(cashfreeOrderStatus);

  await prisma.paymentOrder.update({
    where: { id: existingOrder.id },
    data: {
      status: mappedStatus,
      cashfreeOrderStatus,
      paymentConfirmedAt: mappedStatus === "PAID" ? new Date() : existingOrder.paymentConfirmedAt,
      metadata: {
        ...(existingOrder.metadata && typeof existingOrder.metadata === "object" && !Array.isArray(existingOrder.metadata)
          ? existingOrder.metadata
          : {}),
        cashfreeVerifyOrder: verifyPayload,
      },
    },
  });

  if (mappedStatus === "PAID") {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { plan: "PREMIUM" },
    });
  }

  return NextResponse.json({
    paid: mappedStatus === "PAID",
    orderId,
    orderStatus: cashfreeOrderStatus || mappedStatus,
  });
}
