import type { Operator } from "@mw/types";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/session.actions";
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
        <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6 shrink-0">
          <div />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted capitalize">{operator.role}</span>
              <span className="text-sm font-medium text-text truncate max-w-[200px]">
                {operator.displayName ?? operator.email}
              </span>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                title="Sign out"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-muted hover:text-danger hover:bg-danger/8 transition-colors"
              >
                <LogOut size={15} aria-hidden="true" />
                Sign out
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
