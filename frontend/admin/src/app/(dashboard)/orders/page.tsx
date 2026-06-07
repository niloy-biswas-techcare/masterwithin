import { OrdersTable } from "@/features/admin/OrdersTable";
import { listOrdersAction } from "@/app/actions/orders.actions";
import { Package, TrendingUp, CreditCard, Truck } from "lucide-react";
import type { Order } from "@mw/backend";

export const dynamic = "force-dynamic";

// ── Monthly stats ────────────────────────────────────────────────────────────

function computeMonthlyStats(orders: Order[]) {
  const now = new Date();
  const monthOrders = orders.filter((o) => {
    if (!o.createdAt) return false;
    const d = new Date(o.createdAt);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  return {
    total:    monthOrders.length,
    revenue:  monthOrders.filter((o) => (o.paymentStatus ?? "unpaid") === "paid").reduce((s, o) => s + o.total, 0),
    accepted: monthOrders.filter((o) => (o.orderStatus   ?? "pending") === "accepted").length,
    pending:  monthOrders.filter((o) => (o.orderStatus   ?? "pending") === "pending").length,
    paid:     monthOrders.filter((o) => (o.paymentStatus ?? "unpaid")  === "paid").length,
    shipped:  monthOrders.filter((o) => (o.shippingStatus ?? "not_sent") !== "not_sent").length,
  };
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, iconClass, label, value, sub,
}: {
  icon: React.ElementType;
  iconClass: string;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-surface rounded-lg border border-border p-5 flex items-start gap-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted font-medium mb-0.5">{label}</p>
        <p className="text-2xl font-display font-bold text-text">{value}</p>
        {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function OrdersPage() {
  const orders = await listOrdersAction();
  const stats  = computeMonthlyStats(orders);

  const monthLabel = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text">Orders</h1>
          <p className="text-sm text-muted mt-0.5">Manage WhatsApp book orders and their fulfilment lifecycle</p>
        </div>
      </div>

      {/* Monthly stats */}
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">{monthLabel}</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Package}
            iconClass="bg-amber-100 text-amber-600"
            label="Orders This Month"
            value={stats.total}
            sub={`${stats.pending} pending`}
          />
          <StatCard
            icon={TrendingUp}
            iconClass="bg-emerald-100 text-emerald-600"
            label="Revenue Collected"
            value={`₹${stats.revenue.toLocaleString("en-IN")}`}
            sub={`${stats.paid} paid orders`}
          />
          <StatCard
            icon={CreditCard}
            iconClass="bg-green-100 text-green-600"
            label="Accepted Orders"
            value={stats.accepted}
            sub="this month"
          />
          <StatCard
            icon={Truck}
            iconClass="bg-blue-100 text-blue-600"
            label="Books Dispatched"
            value={stats.shipped}
            sub="sent or received"
          />
        </div>
      </div>

      {/* All orders */}
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">All Orders</p>
        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}
