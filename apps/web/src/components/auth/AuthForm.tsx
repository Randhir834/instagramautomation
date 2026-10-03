'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
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

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const isSignup = mode === 'signup';
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
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
    <>
      <h1 className="font-display text-3xl">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
      <p className="mt-1 text-sm text-ink/75">
        {isSignup ? 'Free to start. No card needed.' : 'Log in to your dashboard.'}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        {isSignup ? (
          <Field label="Your name" htmlFor="name" error={errors.name?.message}>
            <Input id="name" autoComplete="name" {...register('name')} />
          </Field>
        ) : null}
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          hint={isSignup ? 'At least 8 characters.' : undefined}
          error={errors.password?.message}
        >
          <Input
            id="password"
            type="password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            {...register('password')}
          />
        </Field>

        {error ? <Notice tone="error">{error}</Notice> : null}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase text-ink/75">
        <span className="h-0.5 flex-1 bg-ink/15" />
        or
        <span className="h-0.5 flex-1 bg-ink/15" />
      </div>

      <Button variant="outline" size="lg" className="w-full" asChild>
        <a href={GOOGLE_LOGIN_URL}>Continue with Google</a>
      </Button>

      <p className="mt-6 text-center text-sm text-ink/75">
        {isSignup ? 'Already have an account?' : 'New here?'}{' '}
        <Link
          href={isSignup ? '/login' : '/signup'}
          className="font-semibold text-ink underline underline-offset-4"
        >
          {isSignup ? 'Log in' : 'Create an account'}
        </Link>
      </p>
    </>
  );
}
