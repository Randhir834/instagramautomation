export default function PublicNotFound() {
  return (
    <div className="rounded-xl border-2 border-ink bg-white p-8 text-center">
      <h1 className="font-display text-3xl">We could not find that</h1>
      <p className="mt-2 text-ink/75">
        The link may be wrong, or it may have been taken down. Check with whoever sent it to you.
      </p>
    </div>
  );
}
