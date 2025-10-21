'use client'

import { useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { useAdTracking } from './useASPAd'

// ============================================
// カスタムフック: useAdViewTracking
// ============================================

/**
 * Intersection Observerを使った広告表示トラッキング（IAB基準準拠）
 * 
 * IAB（Interactive Advertising Bureau）基準:
 * - 広告の50%以上が画面に表示
 * - 1秒以上表示され続ける
 * - 要素が他の要素に隠れていない（trackVisibility）
 * 
 * @param adId 広告ID
 * @param threshold 表示カウント閾値（デフォルト: 0.5 = 50%）
 * @param trackingDelay 表示カウント遅延時間（ミリ秒、デフォルト: 1000ms）
 * @param enabled 有効化フラグ（デフォルト: true）
 * 
 * @example
 * const adRef = useAdViewTracking(adId, 0.5, 1000)
 * return <div ref={adRef}>広告コンテンツ</div>
 */
export function useAdViewTracking(
  adId: number | null,
  threshold: number = 0.5,
  trackingDelay: number = 1000,
  enabled: boolean = true
) {
  const hasTrackedRef = useRef(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const { trackImpression } = useAdTracking()

  // react-intersection-observer を使用（trackVisibility対応）
  const { ref, inView, entry } = useInView({
    threshold: threshold,        // 50%以上の可視性
    trackVisibility: true,       // 要素が隠れていないか検知（IAB基準）
    delay: 100,                  // チェック頻度: 100ms
  })

  useEffect(() => {
    // 無効化またはadIdがない場合は何もしない
    if (!enabled || !adId) {
      return
    }

    // すでにトラッキング済みの場合は何もしない
    if (hasTrackedRef.current) {
      return
    }

    // IAB基準: 50%表示 + 1秒間継続 + 要素が見えている
    if (inView && entry?.isVisible) {
      // 指定時間後にカウント（デフォルト: 1秒）
      timerRef.current = setTimeout(() => {
        // まだトラッキングされていない場合のみカウント
        if (!hasTrackedRef.current) {
          trackImpression(adId)
          hasTrackedRef.current = true
          console.debug(`✅ Ad impression tracked: ${adId} (IAB compliant)`)
        }
      }, trackingDelay)
    } else {
      // 可視性が失われた場合、タイマーをクリア
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    // クリーンアップ
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [adId, inView, entry?.isVisible, trackingDelay, enabled, trackImpression])

  return ref
}

// ============================================
// カスタムフック: useAdClickTracking
// ============================================

/**
 * 広告クリックトラッキング
 * 
 * @param adId 広告ID
 * @param enabled 有効化フラグ（デフォルト: true）
 * 
 * @example
 * const handleClick = useAdClickTracking(adId)
 * return <div onClick={handleClick}>広告コンテンツ</div>
 */
export function useAdClickTracking(
  adId: number | null,
  enabled: boolean = true
) {
  const { trackClick } = useAdTracking()

  const handleClick = () => {
    if (enabled && adId) {
      trackClick(adId)
      console.debug(`✅ Ad click tracked: ${adId}`)
    }
  }

  return handleClick
}
