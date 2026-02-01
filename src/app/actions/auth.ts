'use server';

/**
 * Auth Server Actions
 * Handle authentication operations securely on the server
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
});

export type AuthState = {
  error?: string;
  success?: boolean;
  message?: string;
};

/**
 * Sign in with email and password
 */
export async function signIn(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  try {
    const supabase = await createClient();

    // Validate input
    const validatedFields = loginSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    if (!validatedFields.success) {
      return {
        error: validatedFields.error.errors[0]?.message || 'Invalid input',
      };
    }

    const { email, password } = validatedFields.data;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        error: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password' 
          : error.message,
      };
    }

    // Get redirect URL from form or default to home
    const redirectTo = formData.get('redirect')?.toString() || '/';
    
    revalidatePath('/', 'layout');
    redirect(redirectTo);
  } catch (error) {
    // redirect() throws an error which is expected behavior in Next.js
    // We need to re-throw it so Next.js can handle the redirect
    throw error;
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();

  // Validate input
  const validatedFields = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0]?.message || 'Invalid input',
    };
  }

  const { email, password, fullName } = validatedFields.data;

  // Check password confirmation
  const confirmPassword = formData.get('confirmPassword');
  if (password !== confirmPassword) {
    return {
      error: "Passwords don't match",
    };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return {
        error: 'An account with this email already exists',
      };
    }
    return {
      error: error.message,
    };
  }

  return {
    success: true,
    message: 'Check your email to confirm your account',
  };
}

/**
 * Sign out
 */
export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/');
  } catch (error) {
    // redirect() throws an error which is expected behavior in Next.js
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function forgotPassword(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();

  const email = formData.get('email')?.toString();

  if (!email || !z.string().email().safeParse(email).success) {
    return {
      error: 'Please enter a valid email address',
    };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    success: true,
    message: 'Check your email for a password reset link',
  };
}

/**
 * Reset password with token
 */
export async function resetPassword(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();

  const password = formData.get('password')?.toString();
  const confirmPassword = formData.get('confirmPassword')?.toString();

  if (!password || password.length < 8) {
    return {
      error: 'Password must be at least 8 characters',
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Passwords don't match",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return {
      error: error.message,
    };
  }

  return {
    success: true,
    message: 'Password updated successfully',
  };
}

/**
 * Get current user with profile
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return {
    ...user,
    profile,
  };
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>();

  return profile?.role === 'admin' || profile?.role === 'super_admin';
}

/**
 * Update user profile
 */
export async function updateProfile(
  prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const updates = {
    full_name: formData.get('fullName')?.toString() || null,
    phone: formData.get('phone')?.toString() || null,
    address_line1: formData.get('addressLine1')?.toString() || null,
    address_line2: formData.get('addressLine2')?.toString() || null,
    city: formData.get('city')?.toString() || null,
    state: formData.get('state')?.toString() || null,
    postal_code: formData.get('postalCode')?.toString() || null,
    country: formData.get('country')?.toString() || null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await (supabase
    .from('users') as any)
    .update(updates)
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/account');
  
  return {
    success: true,
    message: 'Profile updated successfully',
  };
}
