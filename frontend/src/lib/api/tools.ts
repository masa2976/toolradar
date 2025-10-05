import { apiClient } from './client';
import type { Tool, ToolsResponse, ToolsParams } from '@/types';

// ============================================
// ツール関連API
// ============================================

/**
 * ツールAPIの関数群
 */
export const toolsApi = {
  /**
   * ツール一覧取得
   * @param params - 検索・フィルタパラメータ
   * @returns ページネーション付きツール一覧
   */
  getTools: async (params?: ToolsParams): Promise<ToolsResponse> => {
    const { data } = await apiClient.get<ToolsResponse>('/tools/', { params });
    return data;
  },

  /**
   * ツール詳細取得
   * @param slug - ツールのslug
   * @returns ツール詳細情報
   */
  getToolBySlug: async (slug: string): Promise<Tool> => {
    const { data } = await apiClient.get<Tool>(`/tools/${slug}/`);
    return data;
  },
};
