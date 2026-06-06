import type { Operator } from "@mw/types";
import { AdminSidebar } from "./AdminSidebar";

interface AdminShellProps {
  operator: Operator;
  children: React.ReactNode;
}

export function AdminShell({ operator, children }: AdminShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-surface flex items-center justify-end px-6 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted capitalize">{operator.role}</span>
            <span className="text-sm font-medium text-text truncate max-w-[200px]">
              {operator.displayName ?? operator.email}
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
