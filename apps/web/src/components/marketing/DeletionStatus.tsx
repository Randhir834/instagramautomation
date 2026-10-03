'use client';

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
    <div className="rounded-xl border-2 border-ink bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-ink/75">
        Deletion request <span className="break-all">{code}</span>
      </p>
      {status ? (
        <p className="mt-2">
          <strong>Completed.</strong> Your data was deleted on {formatDateTime(status.requestedAt)}.
        </p>
      ) : notFound ? (
        <p className="mt-2">
          We have no record of this code. Codes are kept for 90 days after the request.
        </p>
      ) : (
        <p className="mt-2">Checking…</p>
      )}
    </div>
  );
}
