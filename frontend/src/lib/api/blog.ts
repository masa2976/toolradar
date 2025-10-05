import { apiClient } from './client';
import type { BlogPost, BlogPostDetail, BlogPostsResponse, BlogPostsParams } from '@/types';

// ============================================
// ブログ関連API
// ============================================

/**
 * ブログAPIの関数群
 */
export const blogApi = {
  /**
   * ブログ記事一覧取得
   * @param params - カテゴリ・タグによるフィルタパラメータ
   * @returns ページネーション付きブログ記事一覧
   */
  getPosts: async (params?: BlogPostsParams): Promise<BlogPostsResponse> => {
    const { data } = await apiClient.get<BlogPostsResponse>('/blog/posts/', { params });
    return data;
  },

  /**
   * ブログ記事詳細取得
   * @param slug - 記事のslug
   * @returns ブログ記事詳細（StreamField含む）
   */
  getPostBySlug: async (slug: string): Promise<BlogPostDetail> => {
    const { data } = await apiClient.get<BlogPostDetail>(`/blog/posts/${slug}/`);
    return data;
  },
};
