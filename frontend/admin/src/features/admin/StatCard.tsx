import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export function StatCard({ label, value, icon: Icon, description }: StatCardProps) {
  return (
    <div className="bg-surface rounded-lg border border-border p-5 flex items-start gap-4">
      <div className="p-2.5 rounded-md bg-primary/10 text-primary shrink-0">
        <Icon size={20} aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p className="text-2xl font-semibold text-text mt-0.5">{value}</p>
        {description && <p className="text-xs text-muted mt-1">{description}</p>}
      </div>
    </div>
  );
}
