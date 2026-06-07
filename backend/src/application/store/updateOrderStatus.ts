import type { Order, OrderRepository, OrderLifecycleUpdate } from '../../domain';
import { NotFoundError } from '../errors';

export type UpdateOrderStatus = (id: string, update: OrderLifecycleUpdate) => Promise<Order>;

export function makeUpdateOrderStatus(orders: OrderRepository): UpdateOrderStatus {
  return async (id, update) => {
    if (!id) throw new NotFoundError('Order', id);
    return orders.updateStatus(id, update);
  };
}
