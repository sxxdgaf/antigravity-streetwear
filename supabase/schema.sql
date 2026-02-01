-- ============================================
-- ANTIGRAVITY STREETWEAR - DATABASE SCHEMA
-- Phase 1: Core Database Structure
-- ============================================
-- Run this script in Supabase SQL Editor
-- Make sure to enable UUID extension first

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CUSTOM TYPES / ENUMS
-- ============================================

-- Order status enum
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed', 
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

-- Payment method enum
CREATE TYPE payment_method AS ENUM (
  'cash_on_delivery',
  'bank_transfer',
  'card'
);

-- Inventory action type
CREATE TYPE inventory_action AS ENUM (
  'restock',
  'sale',
  'return',
  'adjustment',
  'damaged'
);

-- User role enum
CREATE TYPE user_role AS ENUM (
  'customer',
  'admin',
  'super_admin'
);

-- ============================================
-- USERS TABLE
-- ============================================
-- Extended profile for Supabase auth users

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'customer' NOT NULL,
  
  -- Shipping address (default)
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'PK',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_sign_in TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Index for faster lookups
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- ============================================
-- CATEGORIES TABLE
-- ============================================

CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for faster queries
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent ON public.categories(parent_id);
CREATE INDEX idx_categories_active ON public.categories(is_active);

-- ============================================
-- PRODUCTS TABLE
-- ============================================

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  compare_at_price DECIMAL(10,2) CHECK (compare_at_price >= 0),
  cost_price DECIMAL(10,2) CHECK (cost_price >= 0),
  
  -- Categorization
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  
  -- Media
  thumbnail_url TEXT,
  images JSONB DEFAULT '[]'::JSONB,
  
  -- Product details
  sku TEXT UNIQUE,
  barcode TEXT,
  weight DECIMAL(8,2),
  weight_unit TEXT DEFAULT 'g',
  
  -- Inventory
  track_inventory BOOLEAN DEFAULT TRUE,
  allow_backorder BOOLEAN DEFAULT FALSE,
  
  -- Status flags
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE NOT NULL,
  is_new BOOLEAN DEFAULT FALSE NOT NULL,
  is_bestseller BOOLEAN DEFAULT FALSE NOT NULL,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Stats
  view_count INT DEFAULT 0,
  sales_count INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_products_featured ON public.products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_created ON public.products(created_at DESC);
CREATE INDEX idx_products_sales ON public.products(sales_count DESC);

-- Full text search index
CREATE INDEX idx_products_search ON public.products 
  USING GIN (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));

-- ============================================
-- PRODUCT VARIANTS TABLE
-- ============================================
-- Size/Color combinations with individual stock

CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  
  -- Variant attributes
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  color_hex TEXT, -- For color swatch display
  
  -- Pricing (optional override)
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  
  -- Inventory
  sku TEXT UNIQUE,
  stock_quantity INT DEFAULT 0 NOT NULL CHECK (stock_quantity >= 0),
  low_stock_threshold INT DEFAULT 5,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Unique constraint for product + size + color combination
  UNIQUE(product_id, size, color)
);

-- Indexes
CREATE INDEX idx_variants_product ON public.product_variants(product_id);
CREATE INDEX idx_variants_size ON public.product_variants(size);
CREATE INDEX idx_variants_color ON public.product_variants(color);
CREATE INDEX idx_variants_stock ON public.product_variants(stock_quantity);

-- ============================================
-- PRODUCT IMAGES TABLE
-- ============================================
-- Additional images with variant association

CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_product_images_product ON public.product_images(product_id);

-- ============================================
-- WISHLIST TABLE
-- ============================================

CREATE TABLE public.wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Prevent duplicates
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlist_user ON public.wishlist(user_id);

-- ============================================
-- ORDERS TABLE
-- ============================================

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  -- Order status
  status order_status DEFAULT 'pending' NOT NULL,
  
  -- Customer info (snapshot at time of order)
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  
  -- Shipping address
  shipping_address_line1 TEXT NOT NULL,
  shipping_address_line2 TEXT,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT NOT NULL,
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  -- Payment
  payment_method payment_method DEFAULT 'cash_on_delivery',
  payment_status TEXT DEFAULT 'pending',
  
  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,
  
  -- Tracking
  tracking_number TEXT,
  carrier TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  confirmed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_number ON public.orders(order_number);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX idx_orders_email ON public.orders(customer_email);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  
  -- Snapshot of product at time of order
  product_name TEXT NOT NULL,
  product_sku TEXT,
  variant_size TEXT,
  variant_color TEXT,
  product_image TEXT,
  
  -- Pricing
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  total_price DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_product ON public.order_items(product_id);

-- ============================================
-- INVENTORY LOGS TABLE
-- ============================================
-- Track all inventory changes

CREATE TABLE public.inventory_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  
  action inventory_action NOT NULL,
  quantity_change INT NOT NULL, -- Positive for additions, negative for removals
  quantity_before INT NOT NULL,
  quantity_after INT NOT NULL,
  
  -- Reference to related order if applicable
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  
  -- Who made the change
  performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_inventory_logs_variant ON public.inventory_logs(variant_id);
CREATE INDEX idx_inventory_logs_action ON public.inventory_logs(action);
CREATE INDEX idx_inventory_logs_created ON public.inventory_logs(created_at DESC);

-- ============================================
-- CART TABLE (Optional - for persistent carts)
-- ============================================

CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id TEXT, -- For guest carts
  
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Either user_id or session_id must be set
  CONSTRAINT cart_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE INDEX idx_cart_user ON public.cart_items(user_id);
CREATE INDEX idx_cart_session ON public.cart_items(session_id);

-- ============================================
-- LOOKBOOK TABLE
-- ============================================

CREATE TABLE public.lookbook (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- Media
  cover_image TEXT NOT NULL,
  images JSONB DEFAULT '[]'::JSONB,
  
  -- Related products
  product_ids UUID[] DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_lookbook_slug ON public.lookbook(slug);
CREATE INDEX idx_lookbook_active ON public.lookbook(is_active);

-- ============================================
-- SITE SETTINGS TABLE
-- ============================================

CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INT;
BEGIN
  -- Format: AG-YYYYMMDD-XXXX (e.g., AG-20260131-0001)
  SELECT COUNT(*) + 1 INTO counter
  FROM public.orders
  WHERE DATE(created_at) = CURRENT_DATE;
  
  new_number := 'AG-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
  RETURN new_number;
END;
$$ language 'plpgsql';

-- Function to update product sales count
CREATE OR REPLACE FUNCTION update_product_sales_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.products
    SET sales_count = sales_count + NEW.quantity
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to log inventory changes
CREATE OR REPLACE FUNCTION log_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stock_quantity != NEW.stock_quantity THEN
    INSERT INTO public.inventory_logs (
      variant_id,
      action,
      quantity_change,
      quantity_before,
      quantity_after
    ) VALUES (
      NEW.id,
      CASE 
        WHEN NEW.stock_quantity > OLD.stock_quantity THEN 'restock'::inventory_action
        ELSE 'adjustment'::inventory_action
      END,
      NEW.stock_quantity - OLD.stock_quantity,
      OLD.stock_quantity,
      NEW.stock_quantity
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE 
      WHEN NEW.email = ANY(string_to_array(current_setting('app.admin_emails', true), ','))
      THEN 'admin'::user_role
      ELSE 'customer'::user_role
    END
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lookbook_updated_at
  BEFORE UPDATE ON public.lookbook
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate order number
CREATE OR REPLACE FUNCTION set_order_number_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION set_order_number_trigger();

-- Update sales count on order items
CREATE TRIGGER update_sales_on_order
  AFTER INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION update_product_sales_count();

-- Log inventory changes
CREATE TRIGGER log_variant_inventory
  AFTER UPDATE OF stock_quantity ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION log_inventory_change();

-- Create user profile on auth signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lookbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'customer'); -- Can't change own role

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can update users (except super_admins can't be demoted by admins)
CREATE POLICY "Admins can update users"
  ON public.users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- CATEGORIES POLICIES
-- ============================================

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = TRUE);

-- Admins can view all categories
CREATE POLICY "Admins can view all categories"
  ON public.categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can manage categories
CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- PRODUCTS POLICIES
-- ============================================

-- Anyone can view active products
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = TRUE);

-- Admins can view all products
CREATE POLICY "Admins can view all products"
  ON public.products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can manage products
CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- PRODUCT VARIANTS POLICIES
-- ============================================

-- Anyone can view variants of active products
CREATE POLICY "Anyone can view product variants"
  ON public.product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = product_id AND is_active = TRUE
    )
  );

-- Admins can manage variants
CREATE POLICY "Admins can manage variants"
  ON public.product_variants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- PRODUCT IMAGES POLICIES
-- ============================================

-- Anyone can view images
CREATE POLICY "Anyone can view product images"
  ON public.product_images FOR SELECT
  USING (TRUE);

-- Admins can manage images
CREATE POLICY "Admins can manage images"
  ON public.product_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- WISHLIST POLICIES
-- ============================================

-- Users can view their own wishlist
CREATE POLICY "Users can view own wishlist"
  ON public.wishlist FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add to their wishlist
CREATE POLICY "Users can add to wishlist"
  ON public.wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove from their wishlist
CREATE POLICY "Users can remove from wishlist"
  ON public.wishlist FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- ORDERS POLICIES
-- ============================================

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create orders
CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (TRUE); -- Guest checkout allowed

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can update orders
CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- ORDER ITEMS POLICIES
-- ============================================

-- Users can view their own order items
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

-- Anyone can insert order items (for checkout)
CREATE POLICY "Anyone can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (TRUE);

-- Admins can view all order items
CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- INVENTORY LOGS POLICIES
-- ============================================

-- Only admins can view inventory logs
CREATE POLICY "Admins can view inventory logs"
  ON public.inventory_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- Only admins can insert logs manually
CREATE POLICY "Admins can insert inventory logs"
  ON public.inventory_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- CART POLICIES
-- ============================================

-- Users can view their own cart
CREATE POLICY "Users can view own cart"
  ON public.cart_items FOR SELECT
  USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- Users can manage their cart
CREATE POLICY "Users can manage cart"
  ON public.cart_items FOR ALL
  USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- ============================================
-- LOOKBOOK POLICIES
-- ============================================

-- Anyone can view active lookbook
CREATE POLICY "Anyone can view active lookbook"
  ON public.lookbook FOR SELECT
  USING (is_active = TRUE);

-- Admins can manage lookbook
CREATE POLICY "Admins can manage lookbook"
  ON public.lookbook FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- SITE SETTINGS POLICIES
-- ============================================

-- Anyone can view settings
CREATE POLICY "Anyone can view settings"
  ON public.site_settings FOR SELECT
  USING (TRUE);

-- Only admins can update settings
CREATE POLICY "Admins can manage settings"
  ON public.site_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- STORAGE BUCKETS (Run in Dashboard or via API)
-- ============================================

-- Create storage bucket for product images
-- INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);

-- Create storage bucket for lookbook images
-- INSERT INTO storage.buckets (id, name, public) VALUES ('lookbook', 'lookbook', true);

-- Create storage bucket for user avatars
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- ============================================
-- STORAGE POLICIES (Run after creating buckets)
-- ============================================

-- Anyone can view product images
-- CREATE POLICY "Public product images" ON storage.objects FOR SELECT USING (bucket_id = 'products');

-- Admins can upload product images
-- CREATE POLICY "Admin upload product images" ON storage.objects FOR INSERT 
--   WITH CHECK (bucket_id = 'products' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Admins can delete product images
-- CREATE POLICY "Admin delete product images" ON storage.objects FOR DELETE 
--   USING (bucket_id = 'products' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

COMMENT ON SCHEMA public IS 'ANTIGRAVITY Streetwear E-commerce Schema v1.0';
