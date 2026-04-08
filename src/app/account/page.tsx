import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppHeader } from "@/components/layout/AppHeader";
import { AccountClient } from "./AccountClient";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account");
  }

  const [user, downloads] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        name: true,
        createdAt: true,
        plan: true,
        passwordHash: true,
      },
    }),
    prisma.downloadHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        resume: { select: { title: true } },
      },
    }),
  ]);

  if (!user) {
    redirect("/login?callbackUrl=/account");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <AccountClient
          email={user.email}
          name={user.name}
          plan={user.plan === "PREMIUM" ? "PREMIUM" : "FREE"}
          hasPassword={Boolean(user.passwordHash)}
          createdAt={user.createdAt.toISOString()}
          downloads={downloads.map((d) => ({
            id: d.id,
            createdAt: d.createdAt.toISOString(),
            templateId: d.templateId,
            resumeTitle: d.resume.title,
            resumeId: d.resumeId,
          }))}
        />
      </main>
    </div>
  );
}
