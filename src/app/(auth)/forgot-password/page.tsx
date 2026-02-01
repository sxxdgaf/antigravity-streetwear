'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { forgotPassword, type AuthState } from '@/app/actions/auth';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState<AuthState | null, FormData>(
    forgotPassword,
    null
  );

  // Success state
  if (state?.success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-brand-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8 text-brand-accent" />
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
      {/* Back link */}
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-brand-grey-400 hover:text-brand-white transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-brand-white mb-2">
          Forgot Password?
        </h1>
        <p className="text-brand-grey-400">
          Enter your email and we&apos;ll send you a reset link
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

        {/* Submit button */}
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>
    </div>
  );
}
