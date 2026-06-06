import { redirect } from "next/navigation";
import { getOperator } from "@/lib/auth";
import { AdminShell } from "@/features/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Real security boundary (§17.3) — re-verifies the cookie server-side on every request
  const operator = await getOperator();
  if (!operator) {
    redirect("/login");
  }

  return <AdminShell operator={operator}>{children}</AdminShell>;
}
