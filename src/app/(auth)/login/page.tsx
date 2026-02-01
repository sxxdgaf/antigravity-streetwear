'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn, type AuthState } from '@/app/actions/auth';
import { Loader2, Eye, EyeOff } from 'lucide-react';

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <button
      type="submit"
      disabled={isPending}
      className="btn-primary w-full"
    >
      {isPending ? (
        <>
          <Loader2 className="animate-spin mr-2" size={20} />
          Signing in...
        </>
      ) : (
        'Sign In'
      )}
    </button>
  );
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction] = useFormState<AuthState | null, FormData>(
    signIn,
    null
  );

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl text-brand-white mb-2">
          Welcome Back
        </h1>
        <p className="text-brand-grey-400">
          Sign in to your account
        </p>
      </div>

      {/* Form */}
      <form action={formAction} className="space-y-6">
        {/* Hidden redirect field */}
        <input type="hidden" name="redirect" value={redirect} />

        {/* Error message */}
        {state?.error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
            {state.error}
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-brand-grey-300 mb-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="input-dark w-full"
            placeholder="you@example.com"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-brand-grey-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              className="input-dark w-full pr-12"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-grey-400 hover:text-brand-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Forgot password link */}
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-brand-grey-400 hover:text-brand-white transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit button */}
        <SubmitButton isPending={false} />
      </form>

      {/* Sign up link */}
      <p className="mt-8 text-center text-brand-grey-400">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="text-brand-white hover:text-brand-accent transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
