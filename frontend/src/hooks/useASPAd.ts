'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import {
  getAdForPlacement,
  incrementImpressions,
  incrementClicks,
  type ASPAdResponse,
  type ASPAdStrategy,
} from '@/lib/api/asp'

// ============================================
// カスタムフック: useASPAd
// ============================================

/**
 * ASP広告取得フック
 * 
 * @param placement 配置場所
 * @param strategy ローテーション戦略（priority: 優先度順、random: ランダム）
 * @param enabled 有効化フラグ（デフォルト: true）
 * 
 * @example
 * const { ad, isLoading } = useASPAd('homepage-middle', 'random')
 */
export function useASPAd(
  placement: string,
  strategy: ASPAdStrategy = 'priority',
  enabled: boolean = true
) {
  const query = useQuery<ASPAdResponse | null>({
    queryKey: ['asp-ad', placement, strategy],
    queryFn: () => getAdForPlacement(placement, strategy),
    enabled,
    staleTime: 5 * 60 * 1000,       // 5分間キャッシュ
    gcTime: 30 * 60 * 1000,         // 30分後にガベージコレクション
    refetchOnWindowFocus: false,    // フォーカス時の再取得無効
    retry: 1,                        // エラー時1回のみリトライ
  })

  return {
    ad: query.data,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
  }
}

// ============================================
// カスタムフック: useAdTracking
// ============================================

/**
 * 広告トラッキングフック
 * 
 * @example
 * const { trackImpression, trackClick } = useAdTracking()
 * 
 * // 表示時
 * trackImpression(adId)
 * 
 * // クリック時
 * trackClick(adId)
 */
export function useAdTracking() {
  // 表示数カウント（非同期・エラー無視）
  const impressionMutation = useMutation({
    mutationFn: incrementImpressions,
    onError: (error) => {
      console.debug('Failed to track impression:', error)
    },
  })

  // クリック数カウント（非同期・エラー無視）
  const clickMutation = useMutation({
    mutationFn: incrementClicks,
    onError: (error) => {
      console.debug('Failed to track click:', error)
    },
  })

  return {
    trackImpression: (adId: number) => {
      impressionMutation.mutate(adId)
    },
    trackClick: (adId: number) => {
      clickMutation.mutate(adId)
    },
    isTracking: impressionMutation.isPending || clickMutation.isPending,
  }
}
