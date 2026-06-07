import type { Order, OrderRepository, OrderListFilter, OrderLifecycleUpdate } from '../../domain';
import { supabaseAdmin } from './client';

function toDomain(row: any): Order {
  const ord: Order = {
    id: row.id,
    items: row.items || [],
    customer: row.customer,
    total: row.total,
    channel: row.channel,
    orderStatus:    row.order_status    ?? 'pending',
    paymentStatus:  row.payment_status  ?? 'unpaid',
    shippingStatus: row.shipping_status ?? 'not_sent',
  };
  if (row.created_at) {
    ord.createdAt = new Date(row.created_at).toISOString().replace('.000Z', 'Z');
  }
  return ord;
}

function toRow(domain: Order): any {
  const row: any = {
    items: domain.items,
    customer: domain.customer,
    total: domain.total,
    channel: domain.channel,
  };
  if (domain.id)             row.id              = domain.id;
  if (domain.createdAt)      row.created_at      = domain.createdAt;
  if (domain.orderStatus)    row.order_status    = domain.orderStatus;
  if (domain.paymentStatus)  row.payment_status  = domain.paymentStatus;
  if (domain.shippingStatus) row.shipping_status = domain.shippingStatus;
  return row;
}

export class SupabaseOrderRepository implements OrderRepository {
  async create(order: Order): Promise<Order> {
    const row = toRow(order);
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert(row)
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }

  async list(filter?: OrderListFilter): Promise<Order[]> {
    let query = supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter) {
      if (filter.page && filter.pageSize) {
        const from = (filter.page - 1) * filter.pageSize;
        const to = filter.page * filter.pageSize - 1;
        query = query.range(from, to);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(toDomain);
  }

  async count(): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  }

  async updateStatus(id: string, update: OrderLifecycleUpdate): Promise<Order> {
    const patch: Record<string, string> = {};
    if (update.orderStatus)    patch.order_status    = update.orderStatus;
    if (update.paymentStatus)  patch.payment_status  = update.paymentStatus;
    if (update.shippingStatus) patch.shipping_status = update.shippingStatus;

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;
    return toDomain(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
