import type { Order, OrderLifecycleUpdate } from '@mw/types';

/** Paging options for the admin order history. */
export interface OrderListFilter {
  page?: number;
  pageSize?: number;
}

export interface OrderRepository {
  /** Persist a new order; the adapter assigns `id` and `createdAt`. */
  create(order: Order): Promise<Order>;
  /** List orders newest-first (admin history). */
  list(filter?: OrderListFilter): Promise<Order[]>;
  /** Total order count (for pagination). */
  count(): Promise<number>;
  /** Update lifecycle status fields for an existing order. */
  updateStatus(id: string, update: OrderLifecycleUpdate): Promise<Order>;
  /** Permanently delete an order record. */
  delete(id: string): Promise<void>;
}
