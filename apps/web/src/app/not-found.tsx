import { Brand } from '@/components/layout/Brand';
import { PushButton } from '@/components/marketing/PushButton';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-paper px-5 py-6 text-ink">
      <Brand />
      <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <p className="font-display text-[96px] font-medium leading-none tracking-tight text-brand">
          404
        </p>
        <h1 className="mt-4 font-display text-[32px] font-medium tracking-tight">
          This page doesn’t exist
        </h1>
        <p className="mt-2 max-w-sm text-ink-soft">
          The link may be mistyped, or the page may have moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <PushButton href="/">Go to the homepage</PushButton>
          <PushButton href="/dashboard" variant="white">
            Open the dashboard
          </PushButton>
        </div>
      </div>
    </div>
  );
}
