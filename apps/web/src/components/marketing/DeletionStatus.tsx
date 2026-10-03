'use client';

import { CheckCircle2, HelpCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ApiRequestError, apiGet } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';

interface Status {
  status: 'completed';
  requestedAt: string;
  accountsDeleted: number;
}

/** Shows the result of a deletion request when the page is opened with ?code=... */
export function DeletionStatus() {
  const [code, setCode] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const found = new URLSearchParams(window.location.search).get('code');
    if (!found) return;
    setCode(found);
    apiGet<Status>(`/compliance/data-deletion/${encodeURIComponent(found)}`)
      .then(setStatus)
      .catch((err) => setNotFound(err instanceof ApiRequestError));
  }, []);

  if (!code) return null;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-line bg-white p-5 shadow-soft">
      {status ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-moss" />
      ) : notFound ? (
        <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-ink-soft" />
      ) : (
        <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-ink-soft" />
      )}
      <div className="min-w-0">
        <p className="text-[13px] text-ink-soft [overflow-wrap:anywhere]">Request {code}</p>
        {status ? (
          <p className="mt-0.5 font-medium">
            Completed. Your data was deleted on {formatDateTime(status.requestedAt)}.
          </p>
        ) : notFound ? (
          <p className="mt-0.5">We have no record of this code. Codes are kept for 90 days.</p>
        ) : (
          <p className="mt-0.5">Checking…</p>
        )}
      </div>
    </div>
  );
}
