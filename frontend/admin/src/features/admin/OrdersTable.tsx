"use client";
import { type ColumnDef } from "@tanstack/react-table";
import type { Order } from "@mw/types";
import { DataTable } from "./DataTable";

// Orders are read-only (§17.5) — no edit/delete. No import in current phase.
const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{String(getValue()).slice(0, 8)}…</span>
    ),
  },
  {
    accessorKey: "customer",
    header: "Customer",
    cell: ({ getValue }) => {
      const c = getValue<Order["customer"]>();
      return c?.name ?? "—";
    },
  },
  {
    accessorKey: "total",
    header: "Total (₹)",
    cell: ({ getValue }) => `₹${getValue<number>() ?? 0}`,
  },
  {
    accessorKey: "channel",
    header: "Channel",
  },
  {
    id: "items",
    header: "Items",
    cell: ({ row }) => row.original.items.length,
  },
];

export function OrdersTable({ orders = [] }: { orders?: Order[] }) {
  if (!orders.length) {
    return (
      <div className="bg-surface rounded-lg border border-border p-12 text-center">
        <p className="text-muted text-sm">No orders yet.</p>
      </div>
    );
  }
  return <DataTable data={orders} columns={columns} searchPlaceholder="Search orders…" />;
}
