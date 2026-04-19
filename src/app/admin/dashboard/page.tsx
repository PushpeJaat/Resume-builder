import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import { AdminDashboardClient } from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin?callbackUrl=/admin/dashboard");
  }

  if (!isAdminEmail(session.user.email)) {
    redirect("/admin?forbidden=1");
  }

  return <AdminDashboardClient />;
}
