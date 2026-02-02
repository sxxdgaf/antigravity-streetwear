'use server';

import { createAdminClient, createClient } from '@/lib/supabase/server';
import { isAdmin } from './auth';
import { revalidatePath } from 'next/cache';
import type { InsertTables, UpdateTables } from '@/types';

export async function createCategory(formData: FormData) {
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    return { success: false, error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const image_url = formData.get('image_url') as string;
  const display_order = parseInt(formData.get('display_order') as string) || 0;
  const is_active = formData.get('is_active') === 'true';

  try {
    const supabase = createAdminClient();

    const { error } = await supabase.from('categories').insert({
      name,
      slug,
      description,
      image_url: image_url || null,
      display_order,
      is_active,
    });

    if (error) throw error;

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCategory(formData: FormData) {
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    return { success: false, error: 'Unauthorized' };
  }

  const id = formData.get('categoryId') as string;
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const image_url = formData.get('image_url') as string;
  const display_order = parseInt(formData.get('display_order') as string) || 0;
  const is_active = formData.get('is_active') === 'true';

  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('categories')
      .update({
        name,
        slug,
        description,
        image_url: image_url || null,
        display_order,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(formData: FormData) {
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    return { success: false, error: 'Unauthorized' };
  }

  const id = formData.get('categoryId') as string;

  try {
    const supabase = await createAdminClient();

    // Check if category has products
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (count && count > 0) {
      return { success: false, error: `Cannot delete category with ${count} product(s). Reassign products first.` };
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) throw error;

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function reorderCategories(formData: FormData) {
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    return { success: false, error: 'Unauthorized' };
  }

  const ordersJson = formData.get('orders') as string;
  const orders = JSON.parse(ordersJson) as { id: string; order: number }[];

  try {
    const supabase = await createAdminClient();

    // Update each category's display_order
    for (const { id, order } of orders) {
      const { error } = await supabase
        .from('categories')
        .update({ display_order: order })
        .eq('id', id);

      if (error) throw error;
    }

    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
