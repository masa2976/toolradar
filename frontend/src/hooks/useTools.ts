import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { toolsApi } from '@/lib/api';
import { queryKeys, staleTimeConfig } from '@/lib/query';
import type { ToolsParams } from '@/types';

// ============================================
// ツール関連カスタムフック
// ============================================

/**
 * ツール一覧取得フック
 * @param params - 検索・フィルタパラメータ
 * @returns TanStack Queryの結果オブジェクト
 * 
 * @example
 * ```tsx
 * const { data, isPending, error } = useTools({ platform: 'mt5' });
 * ```
 */
export function useTools(params?: ToolsParams) {
  return useQuery({
    queryKey: queryKeys.tools.list(params || {}),
    queryFn: () => toolsApi.getTools(params),
    staleTime: staleTimeConfig.tools,
  });
}

/**
 * ツール一覧取得フック（無限スクロール対応）
 * @param params - 検索・フィルタパラメータ
 * @returns TanStack Query Infiniteの結果オブジェクト
 * 
 * @example
 * ```tsx
 * const { data, fetchNextPage, hasNextPage } = useToolsInfinite({ platform: 'mt5' });
 * ```
 */
export function useToolsInfinite(params?: ToolsParams) {
  return useInfiniteQuery({
    queryKey: queryKeys.tools.list(params || {}),
    queryFn: ({ pageParam = 1 }) => toolsApi.getTools({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      // nextがnullなら、次のページはない
      if (!lastPage.next) return undefined;
      
      // nextのURLからページ番号を抽出
      const url = new URL(lastPage.next);
      const page = url.searchParams.get('page');
      return page ? parseInt(page, 10) : undefined;
    },
    staleTime: staleTimeConfig.tools,
  });
}

/**
 * ツール詳細取得フック
 * @param slug - ツールのslug
 * @returns TanStack Queryの結果オブジェクト
 * 
 * @example
 * ```tsx
 * const { data: tool, isPending } = useTool('super-rsi-indicator');
 * ```
 */
export function useTool(slug: string) {
  return useQuery({
    queryKey: queryKeys.tools.detail(slug),
    queryFn: () => toolsApi.getToolBySlug(slug),
    staleTime: staleTimeConfig.tools,
    enabled: !!slug, // slugが存在する場合のみクエリを実行
  });
}
