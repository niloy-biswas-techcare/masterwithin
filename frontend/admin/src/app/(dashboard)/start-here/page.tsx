import { getStartHere } from "@mw/backend";
import { StartHereForm } from "@/features/admin/StartHereForm";

export const dynamic = "force-dynamic";

export default async function StartHerePage() {
  const config = await getStartHere().catch(() => []);

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-display font-semibold text-text">Start Here</h1>
        <p className="text-sm text-muted mt-1">
          Edit the four guided-entry paths. Data-driven — no code changes needed.
        </p>
      </div>
      <div className="bg-surface rounded-lg border border-border p-6">
        <StartHereForm config={config} />
      </div>
    </div>
  );
}
