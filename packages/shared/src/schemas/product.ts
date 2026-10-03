import { z } from 'zod';

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes');

/** "Sourdough, start to finish!" -> "sourdough-start-to-finish" */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Largest file a creator can upload as a product (500 MB). */
export const MAX_PRODUCT_FILE_BYTES = 500 * 1024 * 1024;
export const MAX_COVER_BYTES = 5 * 1024 * 1024;
export const COVER_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

const productFields = {
  title: z.string().trim().min(1, 'Give it a title').max(120),
  description: z.string().trim().max(5000),
  /** Price in paise (INR smallest unit). Razorpay's minimum is ₹1. */
  priceInPaise: z.number().int().min(100, 'Minimum price is ₹1').max(50_000_000),
  /** Storage key returned by the upload endpoint. */
  fileKey: z.string().min(1, 'Upload the file buyers will get'),
  coverKey: z.string().min(1).nullable(),
  isPublished: z.boolean(),
  slug: slugSchema,
};

export const createProductSchema = z.object({
  ...productFields,
  description: productFields.description.default(''),
  coverKey: productFields.coverKey.optional(),
  isPublished: productFields.isPublished.default(false),
});

export const updateProductSchema = z.object(productFields).partial();

export const uploadRequestSchema = z.object({
  kind: z.enum(['file', 'cover']),
  filename: z.string().trim().min(1).max(200),
  contentType: z.string().trim().min(1).max(100),
  size: z.number().int().positive(),
});

export const checkoutSchema = z.object({
  productId: z.string().min(1),
  buyerEmail: z.string().trim().toLowerCase().email('Enter a valid email'),
  buyerName: z.string().trim().max(100).optional(),
});

/** What Razorpay Checkout hands the browser after a successful payment. */
export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UploadRequest = z.infer<typeof uploadRequestSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
