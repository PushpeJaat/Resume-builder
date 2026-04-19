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

  const [
    usersCount,
    resumesCount,
    downloadsCount,
    paymentsCount,
    paidPaymentsCount,
    blogsCount,
    users,
    recentResumes,
    recentPayments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.resume.count(),
    prisma.downloadHistory.count(),
    prisma.paymentOrder.count(),
    prisma.paymentOrder.count({ where: { status: "PAID" } }),
    prisma.blogPost.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 120,
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        createdAt: true,
        _count: {
          select: {
            resumes: true,
            downloads: true,
            payments: true,
          },
        },
      },
    }),
    prisma.resume.findMany({
      orderBy: { updatedAt: "desc" },
      take: 80,
      select: {
        id: true,
        title: true,
        templateId: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    }),
    prisma.paymentOrder.findMany({
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
    }),
  ]);

  return NextResponse.json({
    stats: {
      users: usersCount,
      resumes: resumesCount,
      downloads: downloadsCount,
      payments: paymentsCount,
      paidPayments: paidPaymentsCount,
      blogs: blogsCount,
    },
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      createdAt: user.createdAt,
      resumeCount: user._count.resumes,
      downloadCount: user._count.downloads,
      paymentCount: user._count.payments,
    })),
    resumes: recentResumes.map((resume) => ({
      id: resume.id,
      title: resume.title,
      templateId: resume.templateId,
      updatedAt: resume.updatedAt,
      userId: resume.user.id,
      userEmail: resume.user.email,
      userName: resume.user.name,
    })),
    payments: recentPayments.map((order) => ({
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
