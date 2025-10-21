import { apiClient } from './client'

// ============================================
// ASP広告 型定義
// ============================================

/**
 * ASP広告データ
 */
export interface ASPAd {
  id: number
  name: string
  ad_code: string
  placement: string
  start_date: string
  end_date: string | null
  priority: number
  weight: number
  impressions: number
  clicks: number
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * 広告取得レスポンス
 */
export interface ASPAdResponse {
  id: number
  name: string
  ad_code: string
  placement: string
}

/**
 * 広告一覧レスポンス
 */
export interface ASPAdsListResponse {
  count: number
  next: string | null
  previous: string | null
  results: ASPAd[]
}

/**
 * 広告ローテーション戦略
 */
export type ASPAdStrategy = 'priority' | 'random'

// ============================================
// API関数
// ============================================

/**
 * 広告一覧取得
 * @param placement 配置場所でフィルタ（オプション）
 */
export async function getASPAds(placement?: string): Promise<ASPAdsListResponse> {
  const params = placement ? { placement } : {}
  const response = await apiClient.get<ASPAdsListResponse>('/asp/ads/', { params })
  return response.data
}

/**
 * 広告詳細取得
 * @param id 広告ID
 */
export async function getASPAd(id: number): Promise<ASPAd> {
  const response = await apiClient.get<ASPAd>(`/asp/ads/${id}/`)
  return response.data
}

/**
 * 配置場所に応じた広告取得（ローテーション対応）
 * @param placement 配置場所
 * @param strategy ローテーション戦略（priority: 優先度順、random: ランダム）
 */
export async function getAdForPlacement(
  placement: string,
  strategy: ASPAdStrategy = 'priority'
): Promise<ASPAdResponse | null> {
  try {
    const response = await apiClient.get<ASPAdResponse>('/asp/ads/get_ad/', {
      params: { placement, strategy },
    })
    return response.data
  } catch (error: any) {
    // 404エラー（広告なし）は正常なケース
    if (error.status === 404) {
      console.info(`No active ads found for placement: ${placement}`)
      return null
    }
    throw error
  }
}

/**
 * 表示数カウント（非同期・エラー無視）
 * @param adId 広告ID
 */
export async function incrementImpressions(adId: number): Promise<void> {
  try {
    await apiClient.post(`/asp/ads/${adId}/impression/`)
  } catch (error) {
    // エラーは無視（トラッキング失敗は致命的ではない）
    console.debug('Failed to track impression:', error)
  }
}

/**
 * クリック数カウント（非同期・エラー無視）
 * @param adId 広告ID
 */
export async function incrementClicks(adId: number): Promise<void> {
  try {
    await apiClient.post(`/asp/ads/${adId}/click/`)
  } catch (error) {
    // エラーは無視（トラッキング失敗は致命的ではない）
    console.debug('Failed to track click:', error)
  }
}

// ============================================
// バッチトラッキング（将来実装用）
// ============================================

/**
 * トラッキングキュー
 */
interface TrackingEvent {
  adId: number
  type: 'impression' | 'click'
  timestamp: number
}

let trackingQueue: TrackingEvent[] = []
let batchTimeout: NodeJS.Timeout | null = null

/**
 * バッチトラッキング送信（10秒ごと）
 */
function sendBatchTracking() {
  if (trackingQueue.length === 0) return

  const impressions = trackingQueue.filter((e) => e.type === 'impression')
  const clicks = trackingQueue.filter((e) => e.type === 'click')

  // グループ化して送信
  const impressionCounts = new Map<number, number>()
  const clickCounts = new Map<number, number>()

  impressions.forEach((e) => {
    impressionCounts.set(e.adId, (impressionCounts.get(e.adId) || 0) + 1)
  })

  clicks.forEach((e) => {
    clickCounts.set(e.adId, (clickCounts.get(e.adId) || 0) + 1)
  })

  // 送信（非同期・エラー無視）
  impressionCounts.forEach((count, adId) => {
    for (let i = 0; i < count; i++) {
      incrementImpressions(adId)
    }
  })

  clickCounts.forEach((count, adId) => {
    for (let i = 0; i < count; i++) {
      incrementClicks(adId)
    }
  })

  // キュークリア
  trackingQueue = []
}

/**
 * トラッキングイベント追加（バッチ処理用・将来実装）
 * @param adId 広告ID
 * @param type イベントタイプ
 */
export function queueTrackingEvent(adId: number, type: 'impression' | 'click'): void {
  trackingQueue.push({
    adId,
    type,
    timestamp: Date.now(),
  })

  // 10秒ごとにバッチ送信
  if (!batchTimeout) {
    batchTimeout = setTimeout(() => {
      sendBatchTracking()
      batchTimeout = null
    }, 10000)
  }
}
