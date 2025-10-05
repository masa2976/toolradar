import { useQuery } from '@tanstack/react-query';
import { rankingApi } from '@/lib/api';
import { queryKeys, staleTimeConfig } from '@/lib/query';
import type { RankingParams } from '@/types';

// ============================================
// ランキング関連カスタムフック
// ============================================

/**
 * 週間ランキング取得フック
 * @param params - プラットフォームフィルタ等
 * @returns TanStack Queryの結果オブジェクト
 * 
 * @example
 * ```tsx
 * // 全プラットフォーム
 * const { data, isPending } = useWeeklyRanking();
 * 
 * // MT5のみ
 * const { data, isPending } = useWeeklyRanking({ platform: 'mt5' });
 * ```
 */
export function useWeeklyRanking(params?: RankingParams) {
  return useQuery({
    queryKey: queryKeys.ranking.weekly(params || {}),
    queryFn: () => rankingApi.getWeeklyRanking(params),
    staleTime: staleTimeConfig.ranking, // 10分（頻繁に更新される）
  });
}
