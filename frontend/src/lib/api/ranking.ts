import { apiClient } from './client';
import type { RankingResponse, RankingParams } from '@/types';

// ============================================
// ランキング関連API
// ============================================

/**
 * ランキングAPIの関数群
 */
export const rankingApi = {
  /**
   * 週間ランキング取得
   * @param params - プラットフォームフィルタ等
   * @returns 週間ランキングデータ（TOP50）
   */
  getWeeklyRanking: async (params?: RankingParams): Promise<RankingResponse> => {
    const { data } = await apiClient.get<RankingResponse>('/ranking/weekly/', { params });
    return data;
  },
};
