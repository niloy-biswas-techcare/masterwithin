"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  Trash2,
  Reply,
  Forward,
  ChevronDown,
  ChevronUp,
  CheckCheck,
  Eye,
} from "lucide-react";
import type { Contact, ContactStatus } from "@mw/types";
import { ConfirmDialog } from "./ConfirmDialog";
import { markContactStatusAction, deleteContactAction } from "@/app/actions/contacts.actions";

// ── Badges ──────────────────────────────────────────────────────────────────

function ChannelBadge({ channel }: { channel: Contact["channel"] }) {
  if (channel === "whatsapp") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#25D366]/10 px-2 py-0.5 text-xs font-medium text-[#128C7E]">
        <svg viewBox="0 0 24 24" className="h-3 w-3 fill-[#25D366]" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        WhatsApp
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
      <Mail className="h-3 w-3" />
      Email
    </span>
  );
}

const STATUS_STYLES: Record<ContactStatus, string> = {
  unread: "bg-blue-100 text-blue-700",
  read: "bg-gray-100 text-gray-600",
  replied: "bg-green-100 text-green-700",
  forwarded: "bg-orange-100 text-orange-700",
};

const STATUS_LABELS: Record<ContactStatus, string> = {
  unread: "Unread",
  read: "Read",
  replied: "Replied",
  forwarded: "Forwarded",
};

function StatusBadge({ status }: { status: ContactStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

// ── Contact Row ──────────────────────────────────────────────────────────────

function ContactRow({ contact, adminWaNumber }: { contact: Contact; adminWaNumber: string }) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const markStatus = (status: ContactStatus) => {
    startTransition(async () => {
      await markContactStatusAction(contact.id, status);
      router.refresh();
    });
  };

  const handleExpand = () => {
    setIsExpanded((v) => !v);
    if (!isExpanded && contact.status === "unread") {
      markStatus("read");
    }
  };

  // Build reply URL
  const replyUrl =
    contact.channel === "email" && contact.email
      ? `mailto:${contact.email}?subject=${encodeURIComponent("Re: Your inquiry to Master Within")}&body=${encodeURIComponent(`Hi ${contact.name},\n\nThank you for reaching out to Master Within.\n\n`)}`
      : contact.channel === "whatsapp" && contact.phone
      ? `https://wa.me/${contact.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${contact.name}, thank you for reaching out to Master Within. `)}`
      : null;

  // Forward to admin WhatsApp
  const contactInfo = contact.email ?? contact.phone ?? "";
  const forwardText = `📨 Contact from ${contact.name} (${contactInfo}):\n\n${contact.message}`;
  const forwardUrl = adminWaNumber
    ? `https://wa.me/${adminWaNumber.replace(/\D/g, "")}?text=${encodeURIComponent(forwardText)}`
    : null;

  const handleReply = () => {
    if (!replyUrl) return;
    window.open(replyUrl, "_blank");
    if (contact.status !== "replied") markStatus("replied");
  };

  const handleForward = () => {
    if (!forwardUrl) return;
    window.open(forwardUrl, "_blank");
    if (contact.status !== "forwarded") markStatus("forwarded");
  };

  const dateStr = new Date(contact.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className={`bg-surface rounded-lg border transition-colors ${
        contact.status === "unread" ? "border-primary/30" : "border-border"
      }`}
    >
      {/* Summary row */}
      <div className="flex items-start gap-3 p-4">
        {/* Unread dot */}
        <div className="mt-1.5 flex-shrink-0">
          {contact.status === "unread" ? (
            <span className="block h-2 w-2 rounded-full bg-primary" aria-label="Unread" />
          ) : (
            <span className="block h-2 w-2" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className={`text-sm font-semibold text-text ${contact.status === "unread" ? "" : "font-medium"}`}>
              {contact.name}
            </span>
            <ChannelBadge channel={contact.channel} />
            <StatusBadge status={contact.status} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted mb-2">
            {contact.channel === "email" ? <Mail className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
            <span className="font-mono">{contact.email ?? contact.phone ?? "—"}</span>
            <span className="mx-1">·</span>
            <span>{dateStr}</span>
          </div>
          <p className={`text-sm text-text/70 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
            {contact.message}
          </p>
        </div>

        {/* Expand toggle */}
        <button
          onClick={handleExpand}
          disabled={isPending}
          className="flex-shrink-0 p-1.5 rounded text-muted hover:text-text hover:bg-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={isExpanded ? "Collapse message" : "Expand message"}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded action bar */}
      {isExpanded && (
        <div className="border-t border-border/60 px-4 py-3 flex flex-wrap items-center gap-2">
          {/* Reply */}
          {replyUrl && (
            <button
              onClick={handleReply}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-deep text-surface hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              <Reply size={13} />
              {contact.channel === "whatsapp" ? "Reply on WhatsApp" : "Reply via Email"}
            </button>
          )}

          {/* Forward to admin WA */}
          {forwardUrl && (
            <button
              onClick={handleForward}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-[#25D366] text-white hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] disabled:opacity-50"
            >
              <Forward size={13} />
              Forward to WhatsApp
            </button>
          )}

          {/* Mark replied */}
          {contact.status !== "replied" && (
            <button
              onClick={() => markStatus("replied")}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text hover:bg-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              <CheckCheck size={13} />
              Mark replied
            </button>
          )}

          {/* Mark read */}
          {contact.status === "unread" && (
            <button
              onClick={() => markStatus("read")}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text hover:bg-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              <Eye size={13} />
              Mark read
            </button>
          )}

          {/* Delete */}
          <div className="ml-auto">
            <ConfirmDialog
              trigger={
                <button
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:opacity-50"
                  aria-label={`Delete message from ${contact.name}`}
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              }
              title="Delete message"
              description={`This will permanently delete the message from ${contact.name}. This cannot be undone.`}
              confirmLabel="Delete"
              destructive
              onConfirm={() => {
                startTransition(async () => {
                  await deleteContactAction(contact.id);
                  router.refresh();
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main table ────────────────────────────────────────────────────────────────

type Filter = "all" | ContactStatus | Contact["channel"];

export function ContactsTable({
  contacts,
  adminWaNumber,
}: {
  contacts: Contact[];
  adminWaNumber: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const unreadCount = contacts.filter((c) => c.status === "unread").length;

  const filtered = contacts.filter((c) => {
    const matchesFilter =
      filter === "all" ||
      c.status === filter ||
      c.channel === filter;

    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      (c.phone ?? "").includes(q) ||
      c.message.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  if (contacts.length === 0) {
    return (
      <div className="bg-surface rounded-lg border border-border p-12 text-center">
        <Mail className="h-10 w-10 text-muted mx-auto mb-3" />
        <p className="text-muted text-sm">No contact messages yet.</p>
      </div>
    );
  }

  const FILTER_OPTIONS: { label: string; value: Filter }[] = [
    { label: `All (${contacts.length})`, value: "all" },
    { label: `Unread (${unreadCount})`, value: "unread" },
    { label: "Email", value: "email" },
    { label: "WhatsApp", value: "whatsapp" },
    { label: "Replied", value: "replied" },
    { label: "Forwarded", value: "forwarded" },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone, or message…"
          className="flex-1 h-9 rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex gap-1 flex-wrap">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`h-9 px-3 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                filter === opt.value
                  ? "bg-deep text-surface"
                  : "border border-border text-text hover:bg-bg"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages list */}
      {filtered.length === 0 ? (
        <div className="bg-surface rounded-lg border border-border p-8 text-center">
          <p className="text-muted text-sm">No messages match your filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <ContactRow key={c.id} contact={c} adminWaNumber={adminWaNumber} />
          ))}
        </div>
      )}
    </div>
  );
}
