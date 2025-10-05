'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/query';

/**
 * アプリケーション全体のプロバイダー
 * TanStack QueryのQueryClientProviderを提供
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* TanStack Query DevTools - 右下に配置 */}
      <ReactQueryDevtools 
        initialIsOpen={false}
        buttonPosition="bottom-right"
      />
    </QueryClientProvider>
  );
}
