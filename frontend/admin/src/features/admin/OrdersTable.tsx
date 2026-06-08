"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Package,
  CheckCircle,
  XCircle,
  CreditCard,
  Truck,
  Home,
  Clock,
  MessageCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { Order, OrderStatus, PaymentStatus, ShippingStatus } from "@mw/backend";
import { updateOrderStatusAction, deleteOrderAction } from "@/app/actions/orders.actions";
import { ConfirmDialog } from "./ConfirmDialog";

const PAGE_SIZE = 10;

// ── Badges ───────────────────────────────────────────────────────────────────

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  pending:  "bg-amber-100  text-amber-700",
  accepted: "bg-green-100  text-green-700",
  rejected: "bg-red-100    text-red-700",
};
const ORDER_STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  pending:  Clock,
  accepted: CheckCircle,
  rejected: XCircle,
};
const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending:  "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
};

const PAYMENT_STATUS_STYLES: Record<PaymentStatus, string> = {
  unpaid: "bg-orange-100 text-orange-700",
  paid:   "bg-emerald-100 text-emerald-700",
};
const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  paid:   "Paid",
};

const SHIPPING_STATUS_STYLES: Record<ShippingStatus, string> = {
  not_sent: "bg-gray-100   text-gray-600",
  sent:     "bg-blue-100   text-blue-700",
  received: "bg-teal-100   text-teal-700",
};
const SHIPPING_STATUS_LABELS: Record<ShippingStatus, string> = {
  not_sent: "Not Sent",
  sent:     "Sent",
  received: "Received",
};

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const Icon = ORDER_STATUS_ICONS[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_STYLES[status]}`}>
      <Icon className="h-3 w-3" />
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${PAYMENT_STATUS_STYLES[status]}`}>
      <CreditCard className="h-3 w-3" />
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}

function ShippingBadge({ status }: { status: ShippingStatus }) {
  const Icon = status === "not_sent" ? Package : status === "sent" ? Truck : Home;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${SHIPPING_STATUS_STYLES[status]}`}>
      <Icon className="h-3 w-3" />
      {SHIPPING_STATUS_LABELS[status]}
    </span>
  );
}

// ── Action button ─────────────────────────────────────────────────────────────

function Btn({
  onClick, disabled, variant = "default", children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "success" | "danger" | "blue" | "teal" | "ghost-danger";
  children: React.ReactNode;
}) {
  const base = "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50";
  const styles: Record<string, string> = {
    default:      "border border-border text-text hover:bg-bg",
    success:      "bg-green-500  text-white hover:bg-green-600",
    danger:       "bg-red-500    text-white hover:bg-red-600",
    blue:         "bg-blue-500   text-white hover:bg-blue-600",
    teal:         "bg-teal-500   text-white hover:bg-teal-600",
    "ghost-danger": "text-danger hover:bg-danger/10",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
}

// ── Order Row ─────────────────────────────────────────────────────────────────

function OrderRow({ order }: { order: Order }) {
  const router = useRouter();
  const [isExpanded, setIsExpanded]   = useState(false);
  const [isPending, startTransition]  = useTransition();

  const orderStatus    = order.orderStatus    ?? "pending";
  const paymentStatus  = order.paymentStatus  ?? "unpaid";
  const shippingStatus = order.shippingStatus ?? "not_sent";

  const STATUS_LABELS: Record<string, string> = {
    accepted: "Order accepted",
    rejected: "Order rejected",
    paid: "Marked as paid",
    sent: "Marked as shipped",
    received: "Marked as received",
  };

  const update = (patch: Parameters<typeof updateOrderStatusAction>[1]) => {
    startTransition(async () => {
      try {
        await updateOrderStatusAction(order.id!, patch);
        const label = Object.values(patch)[0] as string;
        toast.success(STATUS_LABELS[label] ?? "Order updated");
        router.refresh();
      } catch {
        toast.error("Failed to update order");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteOrderAction(order.id!);
        toast.success("Order deleted");
        router.refresh();
      } catch {
        toast.error("Failed to delete order");
      }
    });
  };

  const dateStr = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "—";

  const timeStr = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit",
      })
    : "";

  return (
    <div
      className={`bg-surface rounded-lg border transition-colors ${
        orderStatus === "pending" ? "border-amber-300/50" : "border-border"
      }`}
    >
      {/* Summary row */}
      <div className="flex items-start gap-3 p-4">
        <div className="mt-1.5 flex-shrink-0">
          {orderStatus === "pending" ? (
            <span className="block h-2 w-2 rounded-full bg-amber-400" aria-label="Pending" />
          ) : (
            <span className="block h-2 w-2" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-xs text-text/60 font-medium">
              #{String(order.id).slice(0, 8)}
            </span>
            <span className="text-sm font-semibold text-text">{order.customer?.name ?? "—"}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#25D366]/10 px-2 py-0.5 text-xs font-medium text-[#128C7E]">
              <MessageCircle className="h-3 w-3" />
              WhatsApp
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted mb-2">
            <Package className="h-3 w-3" />
            <span>{order.items.length} {order.items.length === 1 ? "book" : "books"}</span>
            <span className="mx-1">·</span>
            <span className="font-semibold text-text">₹{order.total}</span>
            <span className="mx-1">·</span>
            <span>{dateStr}{timeStr ? ` · ${timeStr}` : ""}</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <OrderStatusBadge status={orderStatus} />
            <PaymentBadge     status={paymentStatus} />
            <ShippingBadge    status={shippingStatus} />
          </div>
        </div>

        <button
          onClick={() => setIsExpanded((v) => !v)}
          disabled={isPending}
          className="flex-shrink-0 p-1.5 rounded text-muted hover:text-text hover:bg-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={isExpanded ? "Collapse order" : "Expand order"}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded detail + actions */}
      {isExpanded && (
        <div className="border-t border-border/60 px-4 py-4 space-y-4">

          {/* Items list */}
          <div>
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-2">Books Ordered</p>
            <ul className="space-y-1">
              {order.items.map((item, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="text-text/80">{item.title}</span>
                  <span className="text-text/60 text-xs">×{item.qty} · ₹{item.price * item.qty}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Delivery address */}
          <div>
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-1">Delivery Address</p>
            <p className="text-sm text-text/80">
              {order.customer?.address?.line1}
              {order.customer?.address?.line2 ? `, ${order.customer.address.line2}` : ""}
              {`, ${order.customer?.address?.city}, ${order.customer?.address?.state} – ${order.customer?.address?.pin}`}
            </p>
            <p className="text-xs text-muted mt-0.5">{order.customer?.mobile}</p>
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">

            {orderStatus === "pending" && (
              <>
                <Btn variant="success" disabled={isPending} onClick={() => update({ orderStatus: "accepted" })}>
                  <CheckCircle size={13} /> Accept
                </Btn>
                <Btn variant="danger" disabled={isPending} onClick={() => update({ orderStatus: "rejected" })}>
                  <XCircle size={13} /> Reject
                </Btn>
              </>
            )}
            {orderStatus === "accepted" && (
              <Btn variant="danger" disabled={isPending} onClick={() => update({ orderStatus: "rejected" })}>
                <XCircle size={13} /> Reject
              </Btn>
            )}

            {orderStatus === "accepted" && paymentStatus === "unpaid" && (
              <Btn variant="teal" disabled={isPending} onClick={() => update({ paymentStatus: "paid" })}>
                <CreditCard size={13} /> Mark Paid
              </Btn>
            )}

            {paymentStatus === "paid" && shippingStatus === "not_sent" && (
              <Btn variant="blue" disabled={isPending} onClick={() => update({ shippingStatus: "sent" })}>
                <Truck size={13} /> Mark Sent
              </Btn>
            )}
            {shippingStatus === "sent" && (
              <Btn variant="teal" disabled={isPending} onClick={() => update({ shippingStatus: "received" })}>
                <Home size={13} /> Mark Received
              </Btn>
            )}

            {/* Delete — pushed to the right */}
            <div className="ml-auto">
              <ConfirmDialog
                trigger={
                  <button
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:opacity-50"
                    aria-label={`Delete order from ${order.customer?.name}`}
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                }
                title="Delete order"
                description={`This will permanently delete the order from ${order.customer?.name ?? "this customer"}. This cannot be undone.`}
                confirmLabel="Delete"
                destructive
                onConfirm={handleDelete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  current, total, onChange,
}: {
  current: number;
  total: number;
  onChange: (p: number) => void;
}) {
  if (total <= 1) return null;

  const pages: (number | "…")[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push("…");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push("…");
    pages.push(total);
  }

  const btnBase = "inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <nav className="flex items-center justify-center gap-1 pt-2" aria-label="Pagination">
      {/* Prev */}
      {current > 1 ? (
        <button onClick={() => onChange(current - 1)} className={`${btnBase} border border-border text-text/60 hover:border-primary/40 hover:text-primary`}>
          <ChevronLeft size={14} />
        </button>
      ) : (
        <span className={`${btnBase} border border-border/30 text-text/25 cursor-not-allowed`}>
          <ChevronLeft size={14} />
        </span>
      )}

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="px-1 text-text/30 text-sm select-none">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            aria-current={p === current ? "page" : undefined}
            className={`${btnBase} ${
              p === current
                ? "bg-primary text-surface border border-primary font-semibold pointer-events-none"
                : "border border-border/60 text-text/60 hover:border-primary/40 hover:text-primary"
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      {current < total ? (
        <button onClick={() => onChange(current + 1)} className={`${btnBase} border border-border text-text/60 hover:border-primary/40 hover:text-primary`}>
          <ChevronRight size={14} />
        </button>
      ) : (
        <span className={`${btnBase} border border-border/30 text-text/25 cursor-not-allowed`}>
          <ChevronRight size={14} />
        </span>
      )}
    </nav>
  );
}

// ── Main table ────────────────────────────────────────────────────────────────

type Filter = "all" | OrderStatus | PaymentStatus | ShippingStatus;

export function OrdersTable({ orders = [] }: { orders?: Order[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [page,   setPage]   = useState(1);

  const pendingCount = orders.filter((o) => (o.orderStatus ?? "pending") === "pending").length;

  const filtered = orders.filter((o) => {
    const os = o.orderStatus    ?? "pending";
    const ps = o.paymentStatus  ?? "unpaid";
    const ss = o.shippingStatus ?? "not_sent";
    const matchesFilter =
      filter === "all" || os === filter || ps === filter || ss === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (o.customer?.name  ?? "").toLowerCase().includes(q) ||
      (o.customer?.mobile ?? "").includes(q) ||
      String(o.id).toLowerCase().includes(q) ||
      o.items.some((item) => item.title.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage    = Math.min(page, Math.max(1, totalPages));
  const pageOrders  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const changeFilter = (f: Filter) => { setFilter(f); setPage(1); };
  const changeSearch = (v: string) => { setSearch(v); setPage(1); };

  const from = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to   = Math.min(safePage * PAGE_SIZE, filtered.length);

  if (orders.length === 0) {
    return (
      <div className="bg-surface rounded-lg border border-border p-12 text-center">
        <Package className="h-10 w-10 text-muted mx-auto mb-3" />
        <p className="text-muted text-sm">No orders yet.</p>
      </div>
    );
  }

  const FILTERS: { label: string; value: Filter }[] = [
    { label: `All (${orders.length})`,   value: "all"      },
    { label: `Pending (${pendingCount})`, value: "pending"  },
    { label: "Accepted",                  value: "accepted" },
    { label: "Rejected",                  value: "rejected" },
    { label: "Paid",                      value: "paid"     },
    { label: "Sent",                      value: "sent"     },
    { label: "Received",                  value: "received" },
  ];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => changeSearch(e.target.value)}
          placeholder="Search by customer name, mobile, order ID or book…"
          className="flex-1 h-9 rounded-md border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => changeFilter(opt.value)}
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

      {/* Result count */}
      {filtered.length > 0 && (
        <p className="text-xs text-muted">
          Showing <span className="font-medium text-text">{from}–{to}</span> of{" "}
          <span className="font-medium text-text">{filtered.length}</span> orders
        </p>
      )}

      {/* Order list */}
      {filtered.length === 0 ? (
        <div className="bg-surface rounded-lg border border-border p-8 text-center">
          <p className="text-muted text-sm">No orders match your filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pageOrders.map((o) => (
            <OrderRow key={o.id} order={o} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination current={safePage} total={totalPages} onChange={setPage} />
    </div>
  );
}
