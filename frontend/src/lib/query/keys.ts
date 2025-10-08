// ============================================
// Query Keys（TanStack Query用）
// ============================================

/**
 * TanStack Queryで使用するクエリキー定義
 * キャッシュの管理と無効化に使用
 */
export const queryKeys = {
  // ツール関連
  tools: {
    all: ['tools'] as const,
    lists: () => [...queryKeys.tools.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...queryKeys.tools.lists(), params] as const,
    details: () => [...queryKeys.tools.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.tools.details(), slug] as const,
  },
  
  // ブログ関連
  blog: {
    all: ['blog'] as const,
    lists: () => [...queryKeys.blog.all, 'list'] as const,
    list: (params?: Record<string, any>) => [...queryKeys.blog.lists(), params] as const,
    details: () => [...queryKeys.blog.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.blog.details(), slug] as const,
  },
  
  // ランキング関連
  ranking: {
    all: ['ranking'] as const,
    weekly: (params?: Record<string, any>) => [...queryKeys.ranking.all, 'weekly', params] as const,
  },
  
  // タグ関連
  tags: {
    all: ['tags'] as const,
    list: (params?: Record<string, any>) => [...queryKeys.tags.all, params] as const,
  },
  
  // ASPアフィリエイト関連
  brokers: {
    all: ['brokers'] as const,
  },
} as const;
