'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReCaptchaProvider } from 'next-recaptcha-v3';
import { queryClient } from '@/lib/query';

// ReactQueryDevtoolsを動的インポート（開発時のみ）
const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then((mod) => mod.ReactQueryDevtools),
  { ssr: false }
);

/**
 * アプリケーション全体のプロバイダー
 * - TanStack QueryのQueryClientProvider
 * - Google reCAPTCHA v3のReCaptchaProvider（クライアントサイドのみ）
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const reCaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!reCaptchaKey) {
    console.warn('NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set. reCAPTCHA will not work.');
  }

  // SSR時はReCaptchaProviderをスキップ
  if (!mounted) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return (
    <ReCaptchaProvider
      reCaptchaKey={reCaptchaKey}
      language="ja"
      useEnterprise={false}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        {/* TanStack Query DevTools - 開発時のみ表示 */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools 
            initialIsOpen={false}
            buttonPosition="bottom-right"
          />
        )}
      </QueryClientProvider>
    </ReCaptchaProvider>
  );
}
