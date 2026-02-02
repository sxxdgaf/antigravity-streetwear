'use server';

import { createAdminClient, createClient } from '@/lib/supabase/server';
import { isAdmin } from './auth';
import { revalidatePath } from 'next/cache';
import type { UpdateTables, Order } from '@/types';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export async function updateOrderStatus(formData: FormData) {
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    return { success: false, error: 'Unauthorized' };
  }

  const orderId = formData.get('orderId') as string;
  const status = formData.get('status') as OrderStatus;
  const notes = formData.get('notes') as string;

  try {
    const supabase = await createAdminClient();

    const updateData: UpdateTables<'orders'> = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Set shipped_at or delivered_at timestamps
    if (status === 'shipped') {
      updateData.shipped_at = new Date().toISOString();
    } else if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) throw error;

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTrackingInfo(formData: FormData) {
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    return { success: false, error: 'Unauthorized' };
  }

  const orderId = formData.get('orderId') as string;
  const trackingNumber = formData.get('tracking_number') as string;
  const trackingUrl = formData.get('tracking_url') as string;

  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('orders')
      .update({
        tracking_number: trackingNumber,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) throw error;

    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getOrdersStats() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select('status, total')
    .returns<Pick<Order, 'status' | 'total'>[]>();

  if (!orders) return null;

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => ['confirmed', 'processing'].includes(o.status)).length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => ['cancelled', 'refunded'].includes(o.status)).length,
    revenue: orders
      .filter((o) => !['cancelled', 'refunded'].includes(o.status))
      .reduce((sum, o) => sum + o.total, 0),
  };

  return stats;
}
