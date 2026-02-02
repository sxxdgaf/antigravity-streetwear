/**
 * Database Types for ANTIGRAVITY Streetwear
 * Auto-generated types matching Supabase schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Enum types
export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 
  | 'cash_on_delivery'
  | 'bank_transfer'
  | 'card';

export type InventoryAction = 
  | 'restock'
  | 'sale'
  | 'return'
  | 'adjustment'
  | 'damaged';

export type UserRole = 
  | 'customer'
  | 'admin'
  | 'super_admin';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          country: string | null;
          created_at: string;
          updated_at: string;
          last_sign_in: string | null;
          is_active: boolean;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
          last_sign_in?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string | null;
          created_at?: string;
          updated_at?: string;
          last_sign_in?: string | null;
          is_active?: boolean;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          parent_id: string | null;
          display_order: number;
          is_active: boolean;
          meta_title: string | null;
          meta_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          display_order?: number;
          is_active?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          display_order?: number;
          is_active?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          price: number;
          compare_at_price: number | null;
          cost_price: number | null;
          category_id: string | null;
          thumbnail_url: string | null;
          images: Json;
          sku: string | null;
          barcode: string | null;
          weight: number | null;
          weight_unit: string;
          track_inventory: boolean;
          allow_backorder: boolean;
          is_active: boolean;
          is_featured: boolean;
          is_new: boolean;
          is_bestseller: boolean;
          meta_title: string | null;
          meta_description: string | null;
          tags: string[];
          view_count: number;
          sales_count: number;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          short_description?: string | null;
          price: number;
          compare_at_price?: number | null;
          cost_price?: number | null;
          category_id?: string | null;
          thumbnail_url?: string | null;
          images?: Json;
          sku?: string | null;
          barcode?: string | null;
          weight?: number | null;
          weight_unit?: string;
          track_inventory?: boolean;
          allow_backorder?: boolean;
          is_active?: boolean;
          is_featured?: boolean;
          is_new?: boolean;
          is_bestseller?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          tags?: string[];
          view_count?: number;
          sales_count?: number;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          short_description?: string | null;
          price?: number;
          compare_at_price?: number | null;
          cost_price?: number | null;
          category_id?: string | null;
          thumbnail_url?: string | null;
          images?: Json;
          sku?: string | null;
          barcode?: string | null;
          weight?: number | null;
          weight_unit?: string;
          track_inventory?: boolean;
          allow_backorder?: boolean;
          is_active?: boolean;
          is_featured?: boolean;
          is_new?: boolean;
          is_bestseller?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          tags?: string[];
          view_count?: number;
          sales_count?: number;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size: string;
          color: string;
          color_hex: string | null;
          price_adjustment: number;
          sku: string | null;
          stock_quantity: number;
          low_stock_threshold: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          size: string;
          color: string;
          color_hex?: string | null;
          price_adjustment?: number;
          sku?: string | null;
          stock_quantity?: number;
          low_stock_threshold?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          size?: string;
          color?: string;
          color_hex?: string | null;
          price_adjustment?: number;
          sku?: string | null;
          stock_quantity?: number;
          low_stock_threshold?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          variant_id: string | null;
          url: string;
          alt_text: string | null;
          display_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          variant_id?: string | null;
          url: string;
          alt_text?: string | null;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          variant_id?: string | null;
          url?: string;
          alt_text?: string | null;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
      };
      wishlist: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          status: OrderStatus;
          customer_email: string;
          customer_name: string;
          customer_phone: string;
          shipping_address_line1: string;
          shipping_address_line2: string | null;
          shipping_city: string;
          shipping_state: string | null;
          shipping_postal_code: string | null;
          shipping_country: string;
          subtotal: number;
          shipping_cost: number;
          tax_amount: number;
          discount_amount: number;
          total: number;
          payment_method: PaymentMethod;
          payment_status: string;
          customer_notes: string | null;
          admin_notes: string | null;
          tracking_number: string | null;
          carrier: string | null;
          created_at: string;
          updated_at: string;
          confirmed_at: string | null;
          shipped_at: string | null;
          delivered_at: string | null;
        };
        Insert: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          status?: OrderStatus;
          customer_email: string;
          customer_name: string;
          customer_phone: string;
          shipping_address_line1: string;
          shipping_address_line2?: string | null;
          shipping_city: string;
          shipping_state?: string | null;
          shipping_postal_code?: string | null;
          shipping_country: string;
          subtotal: number;
          shipping_cost?: number;
          tax_amount?: number;
          discount_amount?: number;
          total: number;
          payment_method?: PaymentMethod;
          payment_status?: string;
          customer_notes?: string | null;
          admin_notes?: string | null;
          tracking_number?: string | null;
          carrier?: string | null;
          created_at?: string;
          updated_at?: string;
          confirmed_at?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          status?: OrderStatus;
          customer_email?: string;
          customer_name?: string;
          customer_phone?: string;
          shipping_address_line1?: string;
          shipping_address_line2?: string | null;
          shipping_city?: string;
          shipping_state?: string | null;
          shipping_postal_code?: string | null;
          shipping_country?: string;
          subtotal?: number;
          shipping_cost?: number;
          tax_amount?: number;
          discount_amount?: number;
          total?: number;
          payment_method?: PaymentMethod;
          payment_status?: string;
          customer_notes?: string | null;
          admin_notes?: string | null;
          tracking_number?: string | null;
          carrier?: string | null;
          created_at?: string;
          updated_at?: string;
          confirmed_at?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          product_name: string;
          product_sku: string | null;
          variant_size: string | null;
          variant_color: string | null;
          product_image: string | null;
          unit_price: number;
          quantity: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name: string;
          product_sku?: string | null;
          variant_size?: string | null;
          variant_color?: string | null;
          product_image?: string | null;
          unit_price: number;
          quantity: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name?: string;
          product_sku?: string | null;
          variant_size?: string | null;
          variant_color?: string | null;
          product_image?: string | null;
          unit_price?: number;
          quantity?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      inventory_logs: {
        Row: {
          id: string;
          variant_id: string;
          action: InventoryAction;
          quantity_change: number;
          quantity_before: number;
          quantity_after: number;
          order_id: string | null;
          performed_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          variant_id: string;
          action: InventoryAction;
          quantity_change: number;
          quantity_before: number;
          quantity_after: number;
          order_id?: string | null;
          performed_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          variant_id?: string;
          action?: InventoryAction;
          quantity_change?: number;
          quantity_before?: number;
          quantity_after?: number;
          order_id?: string | null;
          performed_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string | null;
          session_id: string | null;
          product_id: string;
          variant_id: string;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          product_id: string;
          variant_id: string;
          quantity: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          product_id?: string;
          variant_id?: string;
          quantity?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      lookbook: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          cover_image: string;
          images: Json;
          product_ids: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          cover_image: string;
          images?: Json;
          product_ids?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          cover_image?: string;
          images?: Json;
          product_ids?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          published_at?: string | null;
        };
      };
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          updated_at?: string;
          updated_by?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
    };
    Enums: {
      order_status: OrderStatus;
      payment_method: PaymentMethod;
      inventory_action: InventoryAction;
      user_role: UserRole;
    };
  };
}

// Convenience types for common operations
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

// Shorthand types
export type User = Tables<'users'>;
export type Category = Tables<'categories'>;
export type Product = Tables<'products'>;
export type ProductVariant = Tables<'product_variants'>;
export type ProductImage = Tables<'product_images'>;
export type WishlistItem = Tables<'wishlist'>;
export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type InventoryLog = Tables<'inventory_logs'>;
export type CartItem = Tables<'cart_items'>;
export type Lookbook = Tables<'lookbook'>;
export type SiteSetting = Tables<'site_settings'>;

// Extended types with relations
export type ProductWithCategory = Product & {
  category: Category | null;
};

export type ProductWithVariants = Product & {
  variants: ProductVariant[];
  category: Category | null;
};

export type OrderItemWithDetails = OrderItem & {
  product: Product | null;
  variant: ProductVariant | null;
};

export type OrderWithDetails = Order & {
  user: User | null;
  order_items: OrderItemWithDetails[];
};

export type OrderWithItems = Order & {
  items: OrderItem[];
};

export type CartItemWithProduct = CartItem & {
  product: Product;
  variant: ProductVariant;
};
