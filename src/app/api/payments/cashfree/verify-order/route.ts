import { z } from "zod";
import { auth } from "@/auth";
import {
  getCashfreeBaseUrl,
  getCashfreeConfig,
  getCashfreeErrorMessage,
  getCashfreeOrderStatus,
  mapCashfreeOrderStatus,
} from "@/lib/cashfree";
import {
  apiSuccess,
  badRequestError,
  internalServerError,
  notFoundError,
  unauthorizedError,
  upstreamError,
} from "@/lib/api-response";
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
    return unauthorizedError();
  }

  const rawBody = await req.json().catch(() => null);
  const parsed = verifyOrderSchema.safeParse(rawBody);

  if (!parsed.success) {
    return badRequestError("Invalid request body");
  }

  const { resumeId, orderId } = parsed.data;
  const { error, resume } = await assertResumeOwner(resumeId, session.user.id);

  if (error || !resume) {
    return notFoundError("Resume not found");
  }

  const existingOrder = await prisma.paymentOrder.findFirst({
    where: {
      userId: session.user.id,
      resumeId,
      providerOrderId: orderId,
    },
  });

  if (!existingOrder) {
    return notFoundError("Payment order not found");
  }

  if (existingOrder.status === "PAID") {
    return apiSuccess(
      {
        paid: true,
        orderId,
        orderStatus: existingOrder.cashfreeOrderStatus || "PAID",
      },
      { code: "PAYMENT_ALREADY_VERIFIED" },
    );
  }

  const config = getCashfreeConfig();

  if (!config) {
    return internalServerError("Cashfree is not configured. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY.");
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
    return upstreamError(getCashfreeErrorMessage(verifyPayload, "Could not verify payment status."));
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

  return apiSuccess(
    {
      paid: mappedStatus === "PAID",
      orderId,
      orderStatus: cashfreeOrderStatus || mappedStatus,
    },
    { code: "PAYMENT_VERIFIED" },
  );
}
