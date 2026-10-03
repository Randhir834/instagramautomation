import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProductForm } from '@/components/store/ProductForm';

export const metadata: Metadata = { title: 'New product' };

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="New product" description="Upload a file and set a price." />
      <ProductForm />
    </>
  );
}
