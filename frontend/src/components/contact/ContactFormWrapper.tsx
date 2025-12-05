'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import type { ContactFormField } from '@/types';

// ContactFormをクライアントサイドでdynamic import
const ContactForm = dynamic(
  () => import('@/components/contact/ContactForm').then(mod => ({ default: mod.ContactForm })),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    )
  }
);

interface ContactFormWrapperProps {
  formFields: ContactFormField[];
  thankYouHtml: string;
}

/**
 * ContactForm用のClient Componentラッパー
 * Next.js 16のServer ComponentsとClient Componentsの分離に対応
 */
export function ContactFormWrapper({ formFields, thankYouHtml }: ContactFormWrapperProps) {
  return (
    <Suspense fallback={
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    }>
      <ContactForm formFields={formFields} thankYouHtml={thankYouHtml} />
    </Suspense>
  );
}
