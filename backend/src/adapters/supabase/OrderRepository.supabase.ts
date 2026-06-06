import type { Order, OrderRepository, OrderListFilter } from '../../domain';
import { supabaseAdmin } from './client';

function toDomain(row: any): Order {
  const ord: Order = {
    id: row.id,
    items: row.items || [],
    customer: row.customer,
    total: row.total,
    channel: row.channel,
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
  if (domain.id) row.id = domain.id;
  if (domain.createdAt) row.created_at = domain.createdAt;
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
}
