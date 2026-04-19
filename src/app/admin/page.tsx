import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { AdminLoginClient } from "./AdminLoginClient";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; forbidden?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;

  if (session?.user?.id && isAdminEmail(session.user.email)) {
    redirect("/admin/dashboard");
  }

  return (
    <AdminLoginClient
      callbackUrl={params.callbackUrl || "/admin/dashboard"}
      showForbiddenMessage={params.forbidden === "1"}
      signedInAsNonAdmin={Boolean(session?.user?.id)}
    />
  );
}
