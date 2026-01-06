import { apiClient } from './client';
import type { Tag, TagsParams, TagCategory } from '@/types';

// ============================================
// タグ関連API
// ============================================

/**
 * タグAPIの関数群
 */
export const tagsApi = {
  /**
   * タグ一覧取得
   * @param params - カテゴリフィルタ
   * @returns タグ一覧
   */
  getTags: async (params?: TagsParams): Promise<Tag[]> => {
    // ページネーション無効のため、直接配列が返る
    const { data } = await apiClient.get<Tag[]>('/tags/', { params });
    return data;
  },

  /**
   * タグカテゴリ一覧取得
   * @returns タグカテゴリ一覧（display_order順）
   */
  getTagCategories: async (): Promise<TagCategory[]> => {
    const { data } = await apiClient.get<TagCategory[]>('/tag-categories/');
    return data;
  },
};
