'use client';

import { useQuery } from '@tanstack/react-query';
import { use, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Notice } from '@/components/ui/field';
import { ApiRequestError, apiGet, apiPost, errorMessage } from '@/lib/api';

interface DownloadInfo {
  title: string;
  sellerName: string;
  isPaid: boolean;
}

/** Product download page, reached from the delivery email or right after paying. */
export default function DownloadPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['download', token],
    queryFn: () => apiGet<DownloadInfo>(`/public/download/${token}`),
    retry: false,
    // While the payment is being confirmed, check again every few seconds.
    refetchInterval: (query) => (query.state.data && !query.state.data.isPaid ? 4000 : false),
  });

  async function handleDownload() {
    setProblem(null);
    setBusy(true);
    try {
      // Links to the file last a few minutes, so a fresh one is made on each click.
      const { url } = await apiPost<{ url: string }>(`/public/download/${token}/link`);
      window.location.assign(url);
    } catch (err) {
      setProblem(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return <p className="text-center text-ink/75">Loading…</p>;

  if (error || !data) {
    const missing = error instanceof ApiRequestError && error.status === 404;
    return (
      <div className="rounded-2xl border-2 border-ink bg-white p-8 text-center">
        <h1 className="font-display text-3xl">
          {missing ? 'This download link is not valid' : 'Something went wrong'}
        </h1>
        <p className="mt-2 text-ink/75">
          {missing
            ? 'Open the link from your purchase email again, and make sure it was copied in full.'
            : errorMessage(error)}
        </p>
      </div>
    );
  }

  return (
    <div className="slab rounded-2xl bg-white p-6 text-center sm:p-10">
      <p className="text-sm font-bold uppercase tracking-wide text-moss">
        {data.isPaid ? 'Payment received' : 'Confirming your payment'}
      </p>
      <h1 className="mt-2 break-words font-display text-4xl leading-tight">{data.title}</h1>
      <p className="mt-1 text-ink/75">from {data.sellerName}</p>

      {data.isPaid ? (
        <>
          <Button size="lg" className="mt-8" onClick={handleDownload} disabled={busy}>
            {busy ? 'Preparing…' : 'Download your file'}
          </Button>
          <p className="mt-4 text-sm text-ink/75">
            We also emailed you this page. You can come back and download again any time.
          </p>
        </>
      ) : (
        <p className="mx-auto mt-6 max-w-md text-ink/80">
          This usually takes a few seconds. The button will appear here on its own. If you closed
          the payment window without paying, go back and try again.
        </p>
      )}
      {problem ? (
        <Notice tone="error" className="mt-6 text-left">
          {problem}
        </Notice>
      ) : null}
    </div>
  );
}
