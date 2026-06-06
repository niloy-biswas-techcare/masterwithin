import type { Order } from '../entities';

/** Paging options for the read-only admin order history (§17.5). */
export interface OrderListFilter {
  page?: number;
  pageSize?: number;
}

/**
 * OrderRepository port (§9, §16). Orders are pseudonymous records written
 * server-side at checkout; never client-writable, never edited (§16, §17.5).
 */
export interface OrderRepository {
  /** Persist a new order; the adapter assigns `id` and `createdAt`. */
  create(order: Order): Promise<Order>;
  /** List orders newest-first (read-only admin history). */
  list(filter?: OrderListFilter): Promise<Order[]>;
  /** Total order count (for pagination). */
  count(): Promise<number>;
}
