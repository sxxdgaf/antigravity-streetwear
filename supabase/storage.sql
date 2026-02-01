-- ============================================
-- ANTIGRAVITY STREETWEAR - STORAGE SETUP
-- Run this after creating the main schema
-- ============================================

-- ============================================
-- CREATE STORAGE BUCKETS
-- ============================================

-- Product images bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Lookbook images bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lookbook',
  'lookbook',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- User avatars bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================
-- STORAGE POLICIES - PRODUCTS BUCKET
-- ============================================

-- Anyone can view product images
CREATE POLICY "Public read access for products"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Admins can upload product images
CREATE POLICY "Admin upload for products"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Admins can update product images
CREATE POLICY "Admin update for products"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'products'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- Admins can delete product images
CREATE POLICY "Admin delete for products"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'products'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- ============================================
-- STORAGE POLICIES - LOOKBOOK BUCKET
-- ============================================

-- Anyone can view lookbook images
CREATE POLICY "Public read access for lookbook"
ON storage.objects FOR SELECT
USING (bucket_id = 'lookbook');

-- Admins can manage lookbook images
CREATE POLICY "Admin upload for lookbook"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lookbook'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admin update for lookbook"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lookbook'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admin delete for lookbook"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lookbook'
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )
);

-- ============================================
-- STORAGE POLICIES - AVATARS BUCKET
-- ============================================

-- Anyone can view avatars
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "User upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can update their own avatar
CREATE POLICY "User update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own avatar
CREATE POLICY "User delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
