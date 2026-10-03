'use client';

import {
  COVER_CONTENT_TYPES,
  createProductSchema,
  MAX_COVER_BYTES,
  MAX_PRODUCT_FILE_BYTES,
  slugify,
} from '@repo/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Notice, Textarea } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { uploadFile, useCreateProduct } from '@/hooks/useStore';
import { errorMessage } from '@/lib/api';
import { WEB_URL } from '@/lib/utils';

const fileInputClass =
  'block w-full rounded-lg border-2 border-ink/25 bg-white text-sm file:mr-3 file:border-0 file:border-r-2 file:border-ink/25 file:bg-butter file:px-4 file:py-2.5 file:font-semibold file:text-ink';

/** Create a digital product: title, description, price, file, cover. */
export function ProductForm() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const create = useCreateProduct();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [isPublished, setIsPublished] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const finalSlug = slug ?? slugify(title);
  const busy = status !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFailure(null);
    const found: Record<string, string> = {};
    const rupees = Number(price);
    if (!title.trim()) found.title = 'Give it a title';
    if (!finalSlug) found.slug = 'Add a link name';
    if (!price || !Number.isFinite(rupees) || rupees < 1)
      found.price = 'Enter a price of ₹1 or more';
    if (!file) found.file = 'Choose the file buyers will get';
    else if (file.size > MAX_PRODUCT_FILE_BYTES) found.file = 'The file must be under 500 MB';
    if (cover && !(COVER_CONTENT_TYPES as readonly string[]).includes(cover.type)) {
      found.cover = 'Use a JPG, PNG or WebP image';
    } else if (cover && cover.size > MAX_COVER_BYTES) found.cover = 'The cover must be under 5 MB';
    setErrors(found);
    if (Object.keys(found).length > 0 || !file) return;

    try {
      setStatus('Uploading your file…');
      const fileKey = await uploadFile('file', file);
      let coverKey: string | undefined;
      if (cover) {
        setStatus('Uploading the cover…');
        coverKey = await uploadFile('cover', cover);
      }
      setStatus('Saving…');
      const input = createProductSchema.parse({
        title,
        description,
        priceInPaise: Math.round(rupees * 100),
        fileKey,
        coverKey,
        slug: finalSlug,
        isPublished,
      });
      await create.mutateAsync(input);
      router.push('/store');
    } catch (err) {
      setFailure(errorMessage(err));
      setStatus(null);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-xl border-2 border-ink bg-white p-5"
      noValidate
    >
      <Field label="Title" htmlFor="title" error={errors.title}>
        <Input
          id="title"
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sourdough, start to finish"
        />
      </Field>

      <Field
        label="Link"
        htmlFor="slug"
        hint={`${WEB_URL}/s/${user?.username ?? 'you'}/${finalSlug || 'your-product'}`}
        error={errors.slug}
      >
        <Input
          id="slug"
          value={finalSlug}
          maxLength={80}
          onChange={(e) => setSlug(slugify(e.target.value.replace(/\s+/g, '-')))}
          spellCheck={false}
        />
      </Field>

      <Field label="Description" htmlFor="description" hint="What do they get? Optional.">
        <Textarea
          id="description"
          rows={4}
          value={description}
          maxLength={5000}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>

      <Field label="Price in rupees" htmlFor="price" error={errors.price}>
        <Input
          id="price"
          type="number"
          inputMode="decimal"
          min={1}
          step="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="499"
          className="max-w-[12rem]"
        />
      </Field>

      <Field
        label="The file buyers get"
        htmlFor="file"
        hint="PDF, ZIP, video, anything. Up to 500 MB. Only people who paid can download it."
        error={errors.file}
      >
        <input
          id="file"
          type="file"
          className={fileInputClass}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </Field>

      <Field
        label="Cover image"
        htmlFor="cover"
        hint="Optional. JPG, PNG or WebP, up to 5 MB."
        error={errors.cover}
      >
        <input
          id="cover"
          type="file"
          accept={COVER_CONTENT_TYPES.join(',')}
          className={fileInputClass}
          onChange={(e) => setCover(e.target.files?.[0] ?? null)}
        />
      </Field>

      <label className="flex items-start gap-3 text-sm font-medium">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="mt-0.5 h-5 w-5 accent-[#1a1714]"
        />
        Show it on my store page right away
      </label>

      {failure ? <Notice tone="error">{failure}</Notice> : null}
      {status ? <Notice tone="info">{status} Keep this page open.</Notice> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? 'Working…' : 'Add product'}
        </Button>
        <Button type="button" variant="outline" size="lg" asChild>
          <Link href="/store">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
