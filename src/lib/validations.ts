/**
 * Validation Schemas using Zod
 */

import { z } from 'zod';

// Email validation
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email');

// Phone validation (Pakistani format)
export const phoneSchema = z
  .string()
  .min(1, 'Phone number is required')
  .regex(
    /^(\+92|0)?[3][0-9]{9}$/,
    'Please enter a valid Pakistani phone number'
  );

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Sign up schema
export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Sign in schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// User profile schema
export const userProfileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: phoneSchema.optional().or(z.literal('')),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().default('PK'),
});

// Shipping address schema
export const shippingAddressSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: emailSchema,
  phone: phoneSchema,
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(2, 'Country is required'),
});

// Checkout schema
export const checkoutSchema = shippingAddressSchema.extend({
  notes: z.string().optional(),
  paymentMethod: z.enum(['cash_on_delivery', 'bank_transfer']).default('cash_on_delivery'),
});

// Product schema (for admin)
export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  slug: z
    .string()
    .min(2, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  description: z.string().optional(),
  shortDescription: z.string().max(200).optional(),
  price: z.number().min(0, 'Price must be positive'),
  compareAtPrice: z.number().min(0).optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

// Product variant schema
export const variantSchema = z.object({
  size: z.string().min(1, 'Size is required'),
  color: z.string().min(1, 'Color is required'),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color')
    .optional(),
  stockQuantity: z.number().int().min(0, 'Stock cannot be negative'),
  sku: z.string().optional(),
  priceAdjustment: z.number().default(0),
});

// Category schema
export const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  slug: z
    .string()
    .min(2, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  description: z.string().optional(),
  parentId: z.string().uuid().optional().nullable(),
  displayOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

// Contact form schema
export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: emailSchema,
  subject: z.string().min(5, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// Newsletter schema
export const newsletterSchema = z.object({
  email: emailSchema,
});

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type UserProfileInput = z.infer<typeof userProfileSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type VariantInput = z.infer<typeof variantSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
