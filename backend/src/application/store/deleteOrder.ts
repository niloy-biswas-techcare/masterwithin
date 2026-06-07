import type { OrderRepository } from '../../domain';

export type DeleteOrder = (id: string) => Promise<void>;

export function makeDeleteOrder(orders: OrderRepository): DeleteOrder {
  return (id) => orders.delete(id);
}
