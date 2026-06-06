import { OrdersTable } from "@/features/admin/OrdersTable";

export const dynamic = "force-dynamic";

// Orders are private — read through the backend service-role adapter.
// For now we show a placeholder until a listOrders use-case is exposed publicly.
export default async function OrdersPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold text-text">Orders</h1>
        <ExportButton />
      </div>
      <OrdersTable />
    </div>
  );
}

function ExportButton() {
  return (
    <button
      type="button"
      className="h-9 px-4 rounded-md border border-border text-sm text-text hover:bg-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      Export CSV
    </button>
  );
}
