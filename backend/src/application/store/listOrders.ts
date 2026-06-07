import type { Order, OrderRepository, OrderListFilter } from '../../domain';

export type ListOrders = (filter?: OrderListFilter) => Promise<Order[]>;

export function makeListOrders(orders: OrderRepository): ListOrders {
  return (filter) => orders.list(filter);
}
