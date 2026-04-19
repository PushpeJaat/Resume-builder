import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orders = await prisma.paymentOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 120,
    include: {
      resume: {
        select: {
          id: true,
          title: true,
          templateId: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  return NextResponse.json({
    payments: orders.map((order) => ({
      id: order.id,
      provider: order.provider,
      orderId: order.providerOrderId,
      status: order.status,
      providerStatus: order.cashfreeOrderStatus,
      amountInPaise: order.amountInPaise,
      currency: order.currency,
      createdAt: order.createdAt,
      paymentConfirmedAt: order.paymentConfirmedAt,
      resumeId: order.resume.id,
      resumeTitle: order.resume.title,
      resumeTemplateId: order.resume.templateId,
      userId: order.user.id,
      userEmail: order.user.email,
      userName: order.user.name,
    })),
  });
}
