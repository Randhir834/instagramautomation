'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Download, Loader2 } from 'lucide-react';
import { use, useState } from 'react';
import { PublicMessage } from '@/components/layout/PublicMessage';
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

  if (isLoading) {
    return (
      <p className="flex items-center justify-center gap-2 text-ink-soft">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </p>
    );
  }

  if (error || !data) {
    const missing = error instanceof ApiRequestError && error.status === 404;
    return (
      <PublicMessage
        icon={AlertCircle}
        title={missing ? 'This download link isn’t valid' : 'Something went wrong'}
      >
        {missing
          ? 'Open the link from your purchase email again, and make sure it was copied in full.'
          : errorMessage(error)}
      </PublicMessage>
    );
  }

  if (!data.isPaid) {
    return (
      <PublicMessage icon={Loader2} eyebrow="Confirming your payment" title={data.title}>
        <p>
          This usually takes a few seconds, and this page updates on its own. If you closed the
          payment window without paying, go back and try again.
        </p>
      </PublicMessage>
    );
  }

  return (
    <PublicMessage icon={CheckCircle2} tone="success" eyebrow="Payment received" title={data.title}>
      <p>from {data.sellerName}</p>
      <Button size="lg" className="mt-7" onClick={handleDownload} disabled={busy}>
        <Download /> {busy ? 'Preparing…' : 'Download your file'}
      </Button>
      <p className="mt-5 text-[13px]">
        We emailed you a link to this page too, so you can download again any time.
      </p>
      {problem ? (
        <Notice tone="error" className="mt-5 text-left">
          {problem}
        </Notice>
      ) : null}
    </PublicMessage>
  );
}
