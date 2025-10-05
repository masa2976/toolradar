import { useQuery } from '@tanstack/react-query';
import { blogApi } from '@/lib/api';
import { queryKeys, staleTimeConfig } from '@/lib/query';
import type { BlogPostsParams } from '@/types';

// ============================================
// ブログ関連カスタムフック
// ============================================

/**
 * ブログ記事一覧取得フック
 * @param params - カテゴリ・タグフィルタパラメータ
 * @returns TanStack Queryの結果オブジェクト
 * 
 * @example
 * ```tsx
 * const { data, isPending } = useBlogPosts({ category: 'beginner_guide' });
 * ```
 */
export function useBlogPosts(params?: BlogPostsParams) {
  return useQuery({
    queryKey: queryKeys.blog.list(params || {}),
    queryFn: () => blogApi.getPosts(params),
    staleTime: staleTimeConfig.blog,
  });
}

/**
 * ブログ記事詳細取得フック
 * @param slug - 記事のslug
 * @returns TanStack Queryの結果オブジェクト
 * 
 * @example
 * ```tsx
 * const { data: post, isPending } = useBlogPost('forex-beginner-guide');
 * ```
 */
export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: queryKeys.blog.detail(slug),
    queryFn: () => blogApi.getPostBySlug(slug),
    staleTime: staleTimeConfig.blog,
    enabled: !!slug, // slugが存在する場合のみクエリを実行
  });
}
