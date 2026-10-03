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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Field, Notice, Textarea, Toggle } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { uploadFile, useCreateProduct } from '@/hooks/useStore';
import { errorMessage } from '@/lib/api';
import { WEB_URL } from '@/lib/utils';
import { FileDrop } from './FileDrop';

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
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl space-y-5">
      <Card>
        <CardHeader title="Details" description="What buyers see on your store." />
        <CardContent className="space-y-5">
          <Field label="Title" htmlFor="title" error={errors.title}>
            <Input
              id="title"
              value={title}
              maxLength={120}
              aria-invalid={Boolean(errors.title) || undefined}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sourdough, start to finish"
            />
          </Field>

          <Field label="Description" htmlFor="description" aside="Optional">
            <Textarea
              id="description"
              rows={4}
              value={description}
              maxLength={5000}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do they get, and who is it for?"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Price" htmlFor="price" error={errors.price}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-ink-soft">
                  ₹
                </span>
                <Input
                  id="price"
                  type="number"
                  inputMode="decimal"
                  min={1}
                  step="1"
                  value={price}
                  aria-invalid={Boolean(errors.price) || undefined}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="499"
                  className="pl-7"
                />
              </div>
            </Field>

            <Field label="Link" htmlFor="slug" error={errors.slug}>
              <Input
                id="slug"
                value={finalSlug}
                maxLength={80}
                onChange={(e) => setSlug(slugify(e.target.value.replace(/\s+/g, '-')))}
                spellCheck={false}
              />
            </Field>
          </div>
          <p className="-mt-2 text-[13px] text-ink-soft [overflow-wrap:anywhere]">
            Your product page: {WEB_URL.replace(/^https?:\/\//, '')}/s/{user?.username ?? 'you'}/
            <span className="font-semibold text-ink">{finalSlug || 'your-product'}</span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Files" description="Only buyers who paid can download the file." />
        <CardContent className="space-y-5">
          <Field label="Product file" htmlFor="file" error={errors.file}>
            <FileDrop
              id="file"
              file={file}
              onChange={setFile}
              title="Choose a file or drop it here"
              hint="PDF, ZIP, video — anything up to 500 MB"
              invalid={Boolean(errors.file)}
            />
          </Field>
          <Field label="Cover image" htmlFor="cover" aside="Optional" error={errors.cover}>
            <FileDrop
              id="cover"
              file={cover}
              onChange={setCover}
              accept={COVER_CONTENT_TYPES.join(',')}
              title="Choose a cover image"
              hint="JPG, PNG or WebP, up to 5 MB"
              invalid={Boolean(errors.cover)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-semibold text-ink">Show on my store right away</p>
          <p className="text-[13px] text-ink-soft">You can hide it later at any time.</p>
        </div>
        <Toggle
          checked={isPublished}
          onChange={setIsPublished}
          label="Show on my store right away"
        />
      </Card>

      {failure ? <Notice tone="error">{failure}</Notice> : null}
      {status ? <Notice tone="info">{status} Keep this page open.</Notice> : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? 'Working…' : 'Add product'}
        </Button>
        <Button type="button" variant="ghost" size="lg" asChild>
          <Link href="/store">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
