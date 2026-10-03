'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Field, Notice } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { errorMessage } from '@/lib/api';
import { GOOGLE_LOGIN_URL, login, signup } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Enter your password'),
});
const signupSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters'),
});
type FormValues = { name?: string; email: string; password: string };

/** Only follow `next` if it points inside this site. */
function safeNext(next: string | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.3-4.7 3.3-8Z"
      />
      <path
        fill="#34A853"
        d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.9A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.8 14c-.2-.7-.4-1.3-.4-2s.1-1.4.4-2V7.1H2.1A11 11 0 0 0 1 12c0 1.8.4 3.4 1.1 4.9L5.8 14Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1L5.8 10c.9-2.6 3.3-4.6 6.2-4.6Z"
      />
    </svg>
  );
}

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const isSignup = mode === 'signup';
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(isSignup ? signupSchema : loginSchema) });

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('error') === 'google') {
      setError('Google sign-in did not work. Please try again or use your email.');
    }
  }, []);

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const user = isSignup
        ? await signup({ name: values.name ?? '', email: values.email, password: values.password })
        : await login({ email: values.email, password: values.password });
      queryClient.setQueryData(['me'], user);
      router.push(safeNext(new URLSearchParams(window.location.search).get('next')));
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-[34px] font-medium leading-tight tracking-tight">
        {isSignup ? 'Create your account' : 'Welcome back'}
      </h1>
      <p className="mt-2 text-[15px] text-ink-soft">
        {isSignup ? 'Free to start. No card needed.' : 'Log in to your dashboard.'}
      </p>

      <Button variant="outline" size="lg" className="mt-8 w-full" asChild>
        <a href={GOOGLE_LOGIN_URL}>
          <GoogleMark />
          Continue with Google
        </a>
      </Button>

      <div className="my-6 flex items-center gap-3 text-[13px] text-ink-soft">
        <span className="h-px flex-1 bg-line-strong" />
        or with email
        <span className="h-px flex-1 bg-line-strong" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {isSignup ? (
          <Field label="Your name" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              autoComplete="name"
              aria-invalid={Boolean(errors.name) || undefined}
              {...register('name')}
            />
          </Field>
        ) : null}
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email) || undefined}
            {...register('email')}
          />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          hint={isSignup ? 'At least 8 characters.' : undefined}
          error={errors.password?.message}
        >
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              aria-invalid={Boolean(errors.password) || undefined}
              className="pr-11"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((show) => !show)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-paper hover:text-ink"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>

        {error ? <Notice tone="error">{error}</Notice> : null}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-soft">
        {isSignup ? 'Already have an account?' : 'New here?'}{' '}
        <Link
          href={isSignup ? '/login' : '/signup'}
          className="font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
        >
          {isSignup ? 'Log in' : 'Create an account'}
        </Link>
      </p>
      {isSignup ? (
        <p className="mt-4 text-center text-[13px] leading-relaxed text-ink-soft">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="underline underline-offset-2 hover:text-ink">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
            Privacy Policy
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
