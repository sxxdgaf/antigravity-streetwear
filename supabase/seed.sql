-- ============================================
-- ANTIGRAVITY STREETWEAR - SEED DATA
-- Sample data for development and testing
-- ============================================

-- ============================================
-- CATEGORIES
-- ============================================

INSERT INTO public.categories (id, name, slug, description, display_order, is_active) VALUES
  ('cat-001', 'Hoodies', 'hoodies', 'Premium heavyweight hoodies with minimalist designs', 1, true),
  ('cat-002', 'T-Shirts', 't-shirts', 'Essential streetwear tees in premium cotton', 2, true),
  ('cat-003', 'Pants', 'pants', 'Comfortable and stylish pants for everyday wear', 3, true),
  ('cat-004', 'Jackets', 'jackets', 'Statement outerwear pieces', 4, true),
  ('cat-005', 'Accessories', 'accessories', 'Complete your look with our accessories', 5, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PRODUCTS
-- ============================================

-- Hoodies
INSERT INTO public.products (
  id, name, slug, description, short_description, price, compare_at_price,
  category_id, is_active, is_featured, is_new, is_bestseller, tags
) VALUES
(
  'prod-001',
  'VOID Oversized Hoodie',
  'void-oversized-hoodie',
  'The VOID hoodie represents the essence of ANTIGRAVITY - a rejection of the ordinary. Crafted from 400gsm French terry cotton, this oversized piece features dropped shoulders, a kangaroo pocket, and our signature minimal branding. The perfect canvas for self-expression.',
  'Premium 400gsm oversized hoodie with minimal branding',
  12500,
  15000,
  'cat-001',
  true, true, true, true,
  ARRAY['oversized', 'heavyweight', 'essential', 'cotton']
),
(
  'prod-002',
  'ECLIPSE Cropped Hoodie',
  'eclipse-cropped-hoodie',
  'A modern take on the classic hoodie. The ECLIPSE features a cropped silhouette with raw hem details and a slightly boxy fit. Made from 350gsm cotton blend for the perfect drape.',
  'Cropped boxy fit hoodie with raw hem',
  10500,
  NULL,
  'cat-001',
  true, false, true, false,
  ARRAY['cropped', 'boxy', 'raw-hem']
),
(
  'prod-003',
  'GRAVITY Zip Hoodie',
  'gravity-zip-hoodie',
  'Full-zip heavyweight hoodie with YKK hardware and ribbed cuffs. Features subtle embossed logo on chest and premium drawstrings.',
  'Full-zip heavyweight hoodie with premium details',
  13500,
  NULL,
  'cat-001',
  true, true, false, true,
  ARRAY['zip', 'heavyweight', 'premium']
);

-- T-Shirts
INSERT INTO public.products (
  id, name, slug, description, short_description, price, compare_at_price,
  category_id, is_active, is_featured, is_new, is_bestseller, tags
) VALUES
(
  'prod-004',
  'ESSENTIAL Box Tee',
  'essential-box-tee',
  'The foundation of any wardrobe. 220gsm cotton with a relaxed box fit. Features a subtle woven label at the hem. Preshrunk and garment dyed for a lived-in feel from day one.',
  'Relaxed fit essential tee in premium cotton',
  4500,
  5500,
  'cat-002',
  true, true, false, true,
  ARRAY['essential', 'box-fit', 'garment-dyed']
),
(
  'prod-005',
  'SHADOW Oversized Tee',
  'shadow-oversized-tee',
  'Oversized silhouette with dropped shoulders and extended length. Made from 250gsm cotton with a subtle textured finish. Back features minimalist ANTIGRAVITY typography.',
  'Oversized tee with back typography',
  5500,
  NULL,
  'cat-002',
  true, false, true, false,
  ARRAY['oversized', 'typography', 'dropped-shoulder']
),
(
  'prod-006',
  'LUNAR Long Sleeve',
  'lunar-long-sleeve',
  'Long sleeve essential with ribbed cuffs and a slim-regular fit. Premium 230gsm cotton with subtle sleeve branding.',
  'Premium long sleeve with slim-regular fit',
  5900,
  NULL,
  'cat-002',
  true, true, true, false,
  ARRAY['long-sleeve', 'slim-regular', 'essential']
);

-- Pants
INSERT INTO public.products (
  id, name, slug, description, short_description, price, compare_at_price,
  category_id, is_active, is_featured, is_new, is_bestseller, tags
) VALUES
(
  'prod-007',
  'DRIFT Cargo Pants',
  'drift-cargo-pants',
  'Functional meets fashion. Our DRIFT cargos feature 6 pockets, adjustable ankle tabs, and a relaxed tapered fit. Made from durable ripstop cotton with subtle branding.',
  'Relaxed tapered cargo pants with 6 pockets',
  9500,
  11000,
  'cat-003',
  true, true, false, true,
  ARRAY['cargo', 'tapered', 'ripstop', 'functional']
),
(
  'prod-008',
  'CORE Sweatpants',
  'core-sweatpants',
  'Elevated sweats for everyday. 400gsm French terry construction with a relaxed fit, elastic waistband with drawcord, and ribbed ankle cuffs.',
  'Premium French terry sweatpants',
  7500,
  NULL,
  'cat-003',
  true, false, true, false,
  ARRAY['sweatpants', 'french-terry', 'relaxed']
);

-- Jackets
INSERT INTO public.products (
  id, name, slug, description, short_description, price, compare_at_price,
  category_id, is_active, is_featured, is_new, is_bestseller, tags
) VALUES
(
  'prod-009',
  'PHANTOM Bomber',
  'phantom-bomber',
  'A modern bomber jacket with a matte nylon shell and quilted lining. Features ribbed collar, cuffs, and hem with dual entry pockets and interior pocket.',
  'Modern bomber with quilted lining',
  18500,
  22000,
  'cat-004',
  true, true, true, false,
  ARRAY['bomber', 'nylon', 'quilted', 'outerwear']
),
(
  'prod-010',
  'STORM Windbreaker',
  'storm-windbreaker',
  'Lightweight technical windbreaker with water-resistant coating. Half-zip design with hood, adjustable hem, and reflective details.',
  'Technical windbreaker with water resistance',
  14500,
  NULL,
  'cat-004',
  true, true, false, true,
  ARRAY['windbreaker', 'technical', 'water-resistant']
);

-- Accessories
INSERT INTO public.products (
  id, name, slug, description, short_description, price, compare_at_price,
  category_id, is_active, is_featured, is_new, is_bestseller, tags
) VALUES
(
  'prod-011',
  'ARCH Cap',
  'arch-cap',
  'Unstructured 6-panel cap with embroidered ANTIGRAVITY arch logo. Adjustable strap with metal clasp.',
  'Unstructured cap with arch logo',
  3500,
  NULL,
  'cat-005',
  true, false, true, true,
  ARRAY['cap', 'unstructured', 'embroidered']
),
(
  'prod-012',
  'SIGNAL Beanie',
  'signal-beanie',
  'Ribbed knit beanie in heavyweight acrylic blend. Features subtle woven label and turn-up cuff.',
  'Ribbed knit beanie with cuff',
  2900,
  3500,
  'cat-005',
  true, true, false, false,
  ARRAY['beanie', 'ribbed', 'knit']
),
(
  'prod-013',
  'UTILITY Crossbody Bag',
  'utility-crossbody-bag',
  'Compact crossbody bag with multiple compartments. Water-resistant nylon construction with adjustable strap.',
  'Compact water-resistant crossbody',
  5500,
  NULL,
  'cat-005',
  true, true, true, false,
  ARRAY['bag', 'crossbody', 'nylon', 'water-resistant']
);

-- ============================================
-- PRODUCT VARIANTS
-- ============================================

-- VOID Oversized Hoodie variants
INSERT INTO public.product_variants (product_id, size, color, color_hex, stock_quantity, sku) VALUES
('prod-001', 'S', 'Black', '#0a0a0a', 25, 'VOH-BLK-S'),
('prod-001', 'M', 'Black', '#0a0a0a', 40, 'VOH-BLK-M'),
('prod-001', 'L', 'Black', '#0a0a0a', 35, 'VOH-BLK-L'),
('prod-001', 'XL', 'Black', '#0a0a0a', 20, 'VOH-BLK-XL'),
('prod-001', 'S', 'Charcoal', '#36454F', 15, 'VOH-CHR-S'),
('prod-001', 'M', 'Charcoal', '#36454F', 30, 'VOH-CHR-M'),
('prod-001', 'L', 'Charcoal', '#36454F', 25, 'VOH-CHR-L'),
('prod-001', 'XL', 'Charcoal', '#36454F', 15, 'VOH-CHR-XL'),
('prod-001', 'S', 'Cream', '#FFFDD0', 10, 'VOH-CRM-S'),
('prod-001', 'M', 'Cream', '#FFFDD0', 20, 'VOH-CRM-M'),
('prod-001', 'L', 'Cream', '#FFFDD0', 15, 'VOH-CRM-L'),
('prod-001', 'XL', 'Cream', '#FFFDD0', 10, 'VOH-CRM-XL');

-- ECLIPSE Cropped Hoodie variants
INSERT INTO public.product_variants (product_id, size, color, color_hex, stock_quantity, sku) VALUES
('prod-002', 'XS', 'Black', '#0a0a0a', 15, 'ECH-BLK-XS'),
('prod-002', 'S', 'Black', '#0a0a0a', 25, 'ECH-BLK-S'),
('prod-002', 'M', 'Black', '#0a0a0a', 30, 'ECH-BLK-M'),
('prod-002', 'L', 'Black', '#0a0a0a', 20, 'ECH-BLK-L'),
('prod-002', 'XS', 'White', '#FAFAFA', 10, 'ECH-WHT-XS'),
('prod-002', 'S', 'White', '#FAFAFA', 20, 'ECH-WHT-S'),
('prod-002', 'M', 'White', '#FAFAFA', 25, 'ECH-WHT-M'),
('prod-002', 'L', 'White', '#FAFAFA', 15, 'ECH-WHT-L');

-- GRAVITY Zip Hoodie variants
INSERT INTO public.product_variants (product_id, size, color, color_hex, stock_quantity, sku) VALUES
('prod-003', 'S', 'Black', '#0a0a0a', 20, 'GZH-BLK-S'),
('prod-003', 'M', 'Black', '#0a0a0a', 35, 'GZH-BLK-M'),
('prod-003', 'L', 'Black', '#0a0a0a', 30, 'GZH-BLK-L'),
('prod-003', 'XL', 'Black', '#0a0a0a', 15, 'GZH-BLK-XL'),
('prod-003', 'S', 'Navy', '#1B2838', 15, 'GZH-NVY-S'),
('prod-003', 'M', 'Navy', '#1B2838', 25, 'GZH-NVY-M'),
('prod-003', 'L', 'Navy', '#1B2838', 20, 'GZH-NVY-L'),
('prod-003', 'XL', 'Navy', '#1B2838', 10, 'GZH-NVY-XL');

-- ESSENTIAL Box Tee variants
INSERT INTO public.product_variants (product_id, size, color, color_hex, stock_quantity, sku) VALUES
('prod-004', 'S', 'Black', '#0a0a0a', 50, 'EBT-BLK-S'),
('prod-004', 'M', 'Black', '#0a0a0a', 75, 'EBT-BLK-M'),
('prod-004', 'L', 'Black', '#0a0a0a', 60, 'EBT-BLK-L'),
('prod-004', 'XL', 'Black', '#0a0a0a', 40, 'EBT-BLK-XL'),
('prod-004', 'S', 'White', '#FAFAFA', 45, 'EBT-WHT-S'),
('prod-004', 'M', 'White', '#FAFAFA', 70, 'EBT-WHT-M'),
('prod-004', 'L', 'White', '#FAFAFA', 55, 'EBT-WHT-L'),
('prod-004', 'XL', 'White', '#FAFAFA', 35, 'EBT-WHT-XL'),
('prod-004', 'S', 'Grey', '#808080', 30, 'EBT-GRY-S'),
('prod-004', 'M', 'Grey', '#808080', 50, 'EBT-GRY-M'),
('prod-004', 'L', 'Grey', '#808080', 40, 'EBT-GRY-L'),
('prod-004', 'XL', 'Grey', '#808080', 25, 'EBT-GRY-XL');

-- SHADOW Oversized Tee variants
INSERT INTO public.product_variants (product_id, size, color, color_hex, stock_quantity, sku) VALUES
('prod-005', 'S', 'Black', '#0a0a0a', 35, 'SOT-BLK-S'),
('prod-005', 'M', 'Black', '#0a0a0a', 50, 'SOT-BLK-M'),
('prod-005', 'L', 'Black', '#0a0a0a', 45, 'SOT-BLK-L'),
('prod-005', 'XL', 'Black', '#0a0a0a', 25, 'SOT-BLK-XL'),
('prod-005', 'S', 'Washed Black', '#2C2C2C', 20, 'SOT-WBK-S'),
('prod-005', 'M', 'Washed Black', '#2C2C2C', 35, 'SOT-WBK-M'),
('prod-005', 'L', 'Washed Black', '#2C2C2C', 30, 'SOT-WBK-L'),
('prod-005', 'XL', 'Washed Black', '#2C2C2C', 15, 'SOT-WBK-XL');

-- LUNAR Long Sleeve variants
INSERT INTO public.product_variants (product_id, size, color, color_hex, stock_quantity, sku) VALUES
('prod-006', 'S', 'Black', '#0a0a0a', 25, 'LLS-BLK-S'),
('prod-006', 'M', 'Black', '#0a0a0a', 40, 'LLS-BLK-M'),
('prod-006', 'L', 'Black', '#0a0a0a', 35, 'LLS-BLK-L'),
('prod-006', 'XL', 'Black', '#0a0a0a', 20, 'LLS-BLK-XL'),
('prod-006', 'S', 'White', '#FAFAFA', 20, 'LLS-WHT-S'),
('prod-006', 'M', 'White', '#FAFAFA', 35, 'LLS-WHT-M'),
('prod-006', 'L', 'White', '#FAFAFA', 30, 'LLS-WHT-L'),
('prod-006', 'XL', 'White', '#FAFAFA', 15, 'LLS-WHT-XL');

-- DRIFT Cargo Pants variants
INSERT INTO public.product_variants (product_id, size, color, color_hex, stock_quantity, sku) VALUES
('prod-007', 'S', 'Black', '#0a0a0a', 20, 'DCP-BLK-S'),
('prod-007', 'M', 'Black', '#0a0a0a', 35, 'DCP-BLK-M'),
('prod-007', 'L', 'Black', '#0a0a0a', 30, 'DCP-BLK-L'),
('prod-007', 'XL', 'Black', '#0a0a0a', 15, 'DCP-BLK-XL'),
('prod-007', 'S', 'Olive', '#556B2F', 15, 'DCP-OLV-S'),
('prod-007', 'M', 'Olive', '#556B2F', 25, 'DCP-OLV-M'),
('prod-007', 'L', 'Olive', '#556B2F', 20, 'DCP-OLV-L'),
('prod-007', 'XL', 'Olive', '#556B2F', 10, 'DCP-OLV-XL');

-- CORE Sweatpants variants
INSERT INTO public.product_variants (product_id, size, color, color_hex, stock_quantity, sku) VALUES
('prod-008', 'S', 'Black', '#0a0a0a', 25, 'CSP-BLK-S'),
('prod-008', 'M', 'Black', '#0a0a0a', 40, 'CSP-BLK-M'),
('prod-008', 'L', 'Black', '#0a0a0a', 35, 'CSP-BLK-L'),
('prod-008', 'XL', 'Black', '#0a0a0a', 20, 'CSP-BLK-XL'),
('prod-008', 'S', 'Charcoal', '#36454F', 15, 'CSP-CHR-S'),
('prod-008', 'M', 'Charcoal', '#36454F', 30, 'CSP-CHR-M'),
('prod-008', 'L', 'Charcoal', '#36454F', 25, 'CSP-CHR-L'),
('prod-008', 'XL', 'Charcoal', '#36454F', 15, 'CSP-CHR-XL');

-- PHANTOM Bomber variants
INSERT INTO public.product_variants (product_id, size, color, color_hex, stock_quantity, sku) VALUES
('prod-009', 'S', 'Black', '#0a0a0a', 10, 'PHB-BLK-S'),
('prod-009', 'M', 'Black', '#0a0a0a', 15, 'PHB-BLK-M'),
('prod-009', 'L', 'Black', '#0a0a0a', 12, 'PHB-BLK-L'),
('prod-009', 'XL', 'Black', '#0a0a0a', 8, 'PHB-BLK-XL'),
('prod-009', 'S', 'Olive', '#556B2F', 8, 'PHB-OLV-S'),
('prod-009', 'M', 'Olive', '#556B2F', 12, 'PHB-OLV-M'),
('prod-009', 'L', 'Olive', '#556B2F', 10, 'PHB-OLV-L'),
('prod-009', 'XL', 'Olive', '#556B2F', 5, 'PHB-OLV-XL');

-- STORM Windbreaker variants
INSERT INTO public.product_variants (product_id, size, color, color_hex, stock_quantity, sku) VALUES
('prod-010', 'S', 'Black', '#0a0a0a', 15, 'SWB-BLK-S'),
('prod-010', 'M', 'Black', '#0a0a0a', 25, 'SWB-BLK-M'),
('prod-010', 'L', 'Black', '#0a0a0a', 20, 'SWB-BLK-L'),
('prod-010', 'XL', 'Black', '#0a0a0a', 10, 'SWB-BLK-XL');

-- ARCH Cap variants
INSERT INTO public.product_variants (product_id, size, color, color_hex, stock_quantity, sku) VALUES
('prod-011', 'One Size', 'Black', '#0a0a0a', 50, 'ARC-BLK-OS'),
('prod-011', 'One Size', 'White', '#FAFAFA', 40, 'ARC-WHT-OS'),
('prod-011', 'One Size', 'Navy', '#1B2838', 30, 'ARC-NVY-OS');

-- SIGNAL Beanie variants
INSERT INTO public.product_variants (product_id, size, color, color_hex, stock_quantity, sku) VALUES
('prod-012', 'One Size', 'Black', '#0a0a0a', 45, 'SGB-BLK-OS'),
('prod-012', 'One Size', 'Charcoal', '#36454F', 35, 'SGB-CHR-OS'),
('prod-012', 'One Size', 'Cream', '#FFFDD0', 25, 'SGB-CRM-OS');

-- UTILITY Crossbody Bag variants
INSERT INTO public.product_variants (product_id, size, color, color_hex, stock_quantity, sku) VALUES
('prod-013', 'One Size', 'Black', '#0a0a0a', 30, 'UCB-BLK-OS'),
('prod-013', 'One Size', 'Olive', '#556B2F', 20, 'UCB-OLV-OS');

-- ============================================
-- SITE SETTINGS
-- ============================================

INSERT INTO public.site_settings (key, value) VALUES
('store_info', '{
  "name": "ANTIGRAVITY",
  "tagline": "DEFY THE ORDINARY",
  "description": "Premium streetwear for those who reject the ordinary",
  "email": "hello@antigravity.com",
  "phone": "+92 300 1234567",
  "address": "Lahore, Pakistan",
  "social": {
    "instagram": "https://instagram.com/antigravity",
    "twitter": "https://twitter.com/antigravity",
    "tiktok": "https://tiktok.com/@antigravity"
  }
}'::jsonb),
('shipping', '{
  "free_shipping_threshold": 10000,
  "standard_rate": 350,
  "express_rate": 750,
  "processing_days": 2,
  "delivery_days": {
    "standard": "5-7",
    "express": "2-3"
  }
}'::jsonb),
('homepage', '{
  "hero_title": "DEFY THE ORDINARY",
  "hero_subtitle": "Premium streetwear crafted for those who move different",
  "featured_collection": "New Arrivals"
}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ============================================
-- LOOKBOOK
-- ============================================

INSERT INTO public.lookbook (id, title, slug, description, cover_image, is_active) VALUES
(
  'look-001',
  'VOID Collection',
  'void-collection',
  'Explore the depths of minimal design with our VOID collection. Shot in the urban landscapes of Lahore.',
  '/images/lookbook/void-cover.jpg',
  true
),
(
  'look-002',
  'Urban Gravity',
  'urban-gravity',
  'Where street culture meets elevated design. The Urban Gravity editorial.',
  '/images/lookbook/urban-gravity-cover.jpg',
  true
)
ON CONFLICT (id) DO NOTHING;
