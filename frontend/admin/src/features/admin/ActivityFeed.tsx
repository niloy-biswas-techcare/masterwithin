import type { AuditLog } from "@mw/types";
import { formatDistanceToNow } from "@/lib/dateUtils";

interface ActivityFeedProps {
  logs: AuditLog[];
}

const ACTION_COLOR: Record<string, string> = {
  create: "text-success",
  update: "text-primary",
  delete: "text-danger",
  sync: "text-accent",
  role_grant: "text-warning",
  role_revoke: "text-danger",
};

export function ActivityFeed({ logs }: ActivityFeedProps) {
  if (!logs.length) {
    return (
      <p className="text-sm text-muted text-center py-8">No recent activity.</p>
    );
  }

  return (
    <ol role="list" className="space-y-3" aria-label="Recent activity">
      {logs.map((log, i) => (
        <li
          key={log.id ?? i}
          className="flex items-start gap-3 text-sm"
        >
          <span
            className={`mt-0.5 text-xs font-semibold uppercase tracking-wide ${ACTION_COLOR[log.action] ?? "text-muted"}`}
            aria-label={`Action: ${log.action}`}
          >
            {log.action}
          </span>
          <span className="flex-1 text-text">
            <span className="font-medium">{log.entity}</span>
            {log.entityId && (
              <span className="text-muted"> #{log.entityId.slice(0, 8)}</span>
            )}
          </span>
          <time
            dateTime={log.at}
            className="shrink-0 text-muted"
            title={log.at}
          >
            {formatDistanceToNow(log.at)}
          </time>
        </li>
      ))}
    </ol>
  );
}
