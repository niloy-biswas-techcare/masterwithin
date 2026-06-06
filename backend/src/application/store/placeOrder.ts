import type { Order, BookRepository, OrderRepository } from '../../domain';
import { ValidationError, NotFoundError } from '../errors';
import { OrderSchema } from '@mw/types';

export type PlaceOrder = (order: Order) => Promise<Order>;

export function makePlaceOrder(
  books: BookRepository,
  orders: OrderRepository
): PlaceOrder {
  return async (order) => {
    // 1. Zod schema validation
    const parsed = OrderSchema.safeParse(order);
    if (!parsed.success) {
      throw new ValidationError('Invalid order details', parsed.error.flatten().fieldErrors);
    }

    const orderData = parsed.data;

    if (!orderData.items || orderData.items.length === 0) {
      throw new ValidationError('Order must contain at least one item');
    }

    // 2. Authoritative price re-read and availability validation (§10.4)
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of orderData.items) {
      const dbBook = await books.getById(item.id);
      if (!dbBook) {
        throw new NotFoundError('Book', item.id);
      }

      if (!dbBook.available) {
        throw new ValidationError(`Book "${dbBook.title}" is currently unavailable`);
      }

      const verifiedPrice = dbBook.price;
      calculatedTotal += verifiedPrice * item.qty;

      validatedItems.push({
        ...item,
        title: dbBook.title,
        price: verifiedPrice,
      });
    }

    // 3. Re-set total and items
    const finalOrder: Order = {
      ...orderData,
      items: validatedItems,
      total: calculatedTotal,
      createdAt: new Date().toISOString(),
    };

    // 4. Save to Repository
    return orders.create(finalOrder);
  };
}
