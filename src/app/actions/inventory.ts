'use server';

import { createAdminClient, createClient } from '@/lib/supabase/server';
import { isAdmin } from './auth';
import { revalidatePath } from 'next/cache';
import type { UpdateTables, InsertTables, ProductVariant } from '@/types';

export type InventoryChangeType = 'restock' | 'sale' | 'return' | 'adjustment' | 'damaged';

export async function updateStock(formData: FormData) {
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    return { success: false, error: 'Unauthorized' };
  }

  const variantId = formData.get('variantId') as string;
  const changeType = formData.get('changeType') as InventoryChangeType;
  const quantity = parseInt(formData.get('quantity') as string);
  const notes = formData.get('notes') as string;

  if (!quantity || quantity === 0) {
    return { success: false, error: 'Invalid quantity' };
  }

  try {
    const supabase = createAdminClient();

    // Get current stock
    const { data: variant } = await supabase
      .from('product_variants')
      .select('stock_quantity, product_id')
      .eq('id', variantId)
      .single()
      .returns<Pick<ProductVariant, 'stock_quantity' | 'product_id'>>();

    if (!variant) {
      return { success: false, error: 'Variant not found' };
    }

    // Calculate new stock
    let newStock = variant.stock_quantity;
    let quantityChange = 0;

    switch (changeType) {
      case 'restock':
      case 'return':
        quantityChange = Math.abs(quantity);
        newStock += quantityChange;
        break;
      case 'sale':
      case 'damaged':
        quantityChange = -Math.abs(quantity);
        newStock += quantityChange;
        break;
      case 'adjustment':
        // Direct set
        quantityChange = quantity - variant.stock_quantity;
        newStock = quantity;
        break;
      default:
        quantityChange = quantity;
        newStock += quantity;
    }

    if (newStock < 0) {
      return { success: false, error: 'Stock cannot be negative' };
    }

    // Update stock
    const { error: updateError } = await supabase
      .from('product_variants')
      .update({ stock_quantity: newStock })
      .eq('id', variantId);

    if (updateError) throw updateError;

    // Log the change
    const { error: logError } = await supabase.from('inventory_logs').insert({
      variant_id: variantId,
      action: changeType,
      quantity_change: quantityChange,
      quantity_before: variant.stock_quantity,
      quantity_after: newStock,
      notes,
    });

    if (logError) throw logError;

    revalidatePath('/admin/inventory');
    return { success: true, newStock };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkUpdateStock(formData: FormData) {
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    return { success: false, error: 'Unauthorized' };
  }

  const updatesJson = formData.get('updates') as string;
  const updates = JSON.parse(updatesJson) as { variantId: string; quantity: number }[];

  try {
    const supabase = createAdminClient();
    let successCount = 0;

    for (const { variantId, quantity } of updates) {
      const { error } = await supabase
        .from('product_variants')
        .update({ stock_quantity: quantity })
        .eq('id', variantId);

      if (!error) successCount++;
    }

    revalidatePath('/admin/inventory');
    return { success: true, updated: successCount };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getInventoryStats() {
  const supabase = await createClient();

  const { data: variants } = await supabase
    .from('product_variants')
    .select(`
      stock_quantity,
      product:products(is_active)
    `);

  if (!variants) return null;

  // Type guard for the product relation
  type VariantWithProduct = typeof variants[number] & {
    product: { is_active: boolean } | null;
  };

  const typedVariants = variants as unknown as VariantWithProduct[];
  const activeVariants = typedVariants.filter((v) => v.product?.is_active);

  return {
    totalVariants: variants.length,
    activeVariants: activeVariants.length,
    totalStock: variants.reduce((sum, v) => sum + v.stock_quantity, 0),
    outOfStock: variants.filter((v) => v.stock_quantity === 0).length,
    lowStock: variants.filter((v) => v.stock_quantity > 0 && v.stock_quantity <= 10).length,
  };
}
