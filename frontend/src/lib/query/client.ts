import { QueryClient } from '@tanstack/react-query';

// ============================================
// QueryClient設定
// ============================================

/**
 * TanStack Query用のQueryClient
 * グローバルなデフォルト設定を含む
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 60 * 1000,      // 1時間（データが古いと見なされるまでの時間）
      gcTime: 4 * 60 * 60 * 1000,     // 4時間（ガベージコレクション時間、旧cacheTime）
      retry: 3,                        // 失敗時のリトライ回数
      refetchOnWindowFocus: false,     // ウィンドウフォーカス時の再取得を無効化
    },
  },
});

// ============================================
// エンドポイント別のstaleTime設定
// ============================================

/**
 * エンドポイント別のキャッシュ時間設定
 * useQueryのstaleTimeオプションで使用
 */
export const staleTimeConfig = {
  tools: 60 * 60 * 1000,        // ツール: 1時間
  ranking: 10 * 60 * 1000,       // ランキング: 10分（頻繁に更新される）
  blog: 30 * 60 * 1000,          // ブログ: 30分
  tags: 24 * 60 * 60 * 1000,     // タグ: 24時間（ほとんど変更されない）
} as const;
