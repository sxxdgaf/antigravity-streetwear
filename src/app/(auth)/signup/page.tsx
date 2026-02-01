'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signUp, type AuthState } from '@/app/actions/auth';
import { Loader2, Eye, EyeOff, Check } from 'lucide-react';

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
          Creating account...
        </>
      ) : (
        'Create Account'
      )}
    </button>
  );
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction] = useFormState<AuthState | null, FormData>(
    signUp,
    null
  );

  // Success state
  if (state?.success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="font-display text-3xl text-brand-white mb-4">
          Check Your Email
        </h1>
        <p className="text-brand-grey-400 mb-8">
          {state.message}
        </p>
        <Link href="/login" className="btn-secondary border-brand-white text-brand-white hover:bg-brand-white hover:text-brand-black">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl text-brand-white mb-2">
          Create Account
        </h1>
        <p className="text-brand-grey-400">
          Join the ANTIGRAVITY community
        </p>
      </div>

      {/* Form */}
      <form action={formAction} className="space-y-6">
        {/* Error message */}
        {state?.error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
            {state.error}
          </div>
        )}

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-brand-grey-300 mb-2">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            required
            className="input-dark w-full"
            placeholder="John Doe"
          />
        </div>

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
              autoComplete="new-password"
              required
              minLength={8}
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
          <p className="mt-1 text-xs text-brand-grey-500">
            Must be at least 8 characters
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-grey-300 mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            className="input-dark w-full"
            placeholder="••••••••"
          />
        </div>

        {/* Submit button */}
        <SubmitButton isPending={false} />
      </form>

      {/* Terms */}
      <p className="mt-6 text-center text-xs text-brand-grey-500">
        By signing up, you agree to our{' '}
        <Link href="/terms" className="hover:text-brand-white transition-colors">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="hover:text-brand-white transition-colors">
          Privacy Policy
        </Link>
      </p>

      {/* Sign in link */}
      <p className="mt-6 text-center text-brand-grey-400">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-brand-white hover:text-brand-accent transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
