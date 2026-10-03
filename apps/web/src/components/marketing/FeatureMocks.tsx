import { Check } from 'lucide-react';

/** Small hand-built illustrations used inside the cards on the landing page. */

export function ConnectMock() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-white p-3 shadow-xs">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-butter text-xs font-bold">
        MK
      </span>
      <div className="min-w-0 text-sm">
        <p className="font-semibold">@meera.kneads</p>
        <p className="text-xs text-ink-soft">Creator account</p>
      </div>
      <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-moss text-white">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    </div>
  );
}

export function KeywordMock() {
  return (
    <div className="rounded-xl border border-line bg-white p-3 text-sm shadow-xs">
      <p className="text-xs text-ink-soft">When a comment contains</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {['price', 'link', 'how much'].map((k) => (
          <span
            key={k}
            className="rounded-md bg-butter-tint px-2 py-0.5 font-semibold ring-1 ring-inset ring-[#ecd48a]"
          >
            {k}
          </span>
        ))}
        <span className="rounded-md border border-dashed border-line-strong px-2 py-0.5 text-ink-soft">
          + add
        </span>
      </div>
    </div>
  );
}

export function MessageMock() {
  return (
    <div className="space-y-2 text-sm">
      <p className="w-fit rounded-2xl rounded-bl-md bg-white px-3 py-1.5 shadow-xs ring-1 ring-line">
        Here it is! ₹499, link below.
      </p>
      <span className="ml-4 block w-fit rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white">
        Open the course
      </span>
    </div>
  );
}

export function RepliesMock() {
  const replies = ['Sent it to your DMs!', 'Check your inbox, just messaged you', 'DM on its way'];
  return (
    <ul className="space-y-2 text-sm">
      {replies.map((r, i) => (
        <li
          key={r}
          className={`w-fit rounded-xl bg-white px-3 py-1.5 shadow-xs ring-1 ring-line ${
            i === 1 ? 'ml-6' : i === 2 ? 'ml-2' : ''
          }`}
        >
          {r}
        </li>
      ))}
    </ul>
  );
}

export function FollowGateMock() {
  return (
    <div className="space-y-2 text-sm">
      <p className="w-fit rounded-2xl rounded-bl-md bg-white px-3 py-2 shadow-xs ring-1 ring-line">
        Quick one: follow me first and I&apos;ll send the link.
      </p>
      <span className="block w-fit rounded-full border border-sky/40 bg-white px-3 py-1 text-xs font-semibold text-sky-dark">
        Done, I followed
      </span>
    </div>
  );
}

export function ContactsMock() {
  const rows = [
    ['@riya.s', 'riya.sharma@gmail.com', 'course'],
    ['@thekabirj', '+91 98•• ••• 210', 'workshop'],
    ['@anu.paints', 'anu@hey.com', 'course'],
  ];
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white text-xs shadow-xs">
      {rows.map(([user, contact, tag]) => (
        <div
          key={user}
          className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line px-3 py-2 last:border-0"
        >
          <span className="font-semibold">{user}</span>
          <span className="break-all text-ink-soft">{contact}</span>
          <span className="ml-auto rounded-full bg-moss-tint px-2 py-0.5 font-semibold text-moss-dark">
            {tag}
          </span>
        </div>
      ))}
    </div>
  );
}
