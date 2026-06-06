"use client";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import type { Operator } from "@mw/types";

interface Props {
  currentOperator: Operator;
}

export function OperatorManagement({ currentOperator }: Props) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "admin">("editor");
  const [isPending, startTransition] = useTransition();

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    startTransition(async () => {
      // In a full implementation this calls a server action that uses the Supabase Admin API
      // to create/invite the user and set their role claim (§17.6).
      // For now we show the pattern and a toast.
      toast.info(`Invite to ${inviteEmail} as ${inviteRole} — implement via Supabase Admin API (§17.6)`);
      setInviteEmail("");
    });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Operators are managed via Supabase Auth. Self-service signup is disabled. Invite
        operators here; their role claim is set server-side (§17.6).
      </p>

      <form onSubmit={handleInvite} className="flex gap-2 items-end" noValidate>
        <div className="flex-1">
          <label htmlFor="invite-email" className="block text-sm font-medium text-text mb-1.5">
            Email
          </label>
          <input
            id="invite-email"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            className="field"
            placeholder="new-operator@example.com"
          />
        </div>
        <div>
          <label htmlFor="invite-role" className="block text-sm font-medium text-text mb-1.5">
            Role
          </label>
          <select
            id="invite-role"
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as "editor" | "admin")}
            className="field"
          >
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="h-11 px-4 rounded-md bg-deep text-surface text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary inline-flex items-center gap-2"
        >
          <UserPlus size={15} aria-hidden="true" />
          Invite
        </button>
      </form>

      <div className="text-sm text-muted border border-border rounded-md p-4">
        <p className="font-medium text-text mb-1">Current operator</p>
        <p>{currentOperator.email} — <span className="capitalize font-medium">{currentOperator.role}</span></p>
      </div>
    </div>
  );
}
