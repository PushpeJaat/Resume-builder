import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function getAdminEmails(): Set<string> {
  const raw = `${process.env.ADMIN_EMAILS ?? ""},${process.env.ADMIN_EMAIL ?? ""}`;
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0),
  );
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminEmails = getAdminEmails();
  const requesterEmail = typeof session.user.email === "string" ? session.user.email.toLowerCase() : "";

  if (adminEmails.size === 0 || !adminEmails.has(requesterEmail)) {
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
