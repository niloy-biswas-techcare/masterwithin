import { redirect, notFound } from "next/navigation";
import { getSiteConfig, ForbiddenError } from "@mw/backend";
import { verifyOperator } from "@/lib/auth";
import { SiteConfigForm } from "@/features/admin/SiteConfigForm";
import { OperatorManagement } from "@/features/admin/OperatorManagement";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  // Settings requires admin role (§17.5) 🔒
  let operator;
  try {
    operator = await verifyOperator("admin");
  } catch (e) {
    if (e instanceof ForbiddenError) {
      notFound();
    }
    redirect("/login");
  }

  const config = await getSiteConfig().catch(() => null);

  return (
    <div className="max-w-3xl space-y-8">
      <h1 className="text-2xl font-display font-semibold text-text">Settings</h1>

      <section aria-labelledby="site-config-heading">
        <h2 id="site-config-heading" className="text-base font-semibold text-text mb-4">
          Site Configuration
        </h2>
        <div className="bg-surface rounded-lg border border-border p-6">
          <SiteConfigForm config={config} />
        </div>
      </section>

      <section aria-labelledby="operator-heading">
        <h2 id="operator-heading" className="text-base font-semibold text-text mb-4">
          Operator Management
        </h2>
        <div className="bg-surface rounded-lg border border-border p-6">
          <OperatorManagement currentOperator={operator} />
        </div>
      </section>
    </div>
  );
}
