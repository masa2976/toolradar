import { apiClient } from './client';
import type { Tag, TagsParams } from '@/types';

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
    const { data } = await apiClient.get<Tag[]>('/tags/', { params });
    return data;
  },
};
