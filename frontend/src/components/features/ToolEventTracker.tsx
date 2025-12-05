'use client'

import { useEffect, useRef } from 'react'
import { trackEvent } from '@/lib/api/tools'

interface ToolEventTrackerProps {
  toolId: string
}

/**
 * ツールイベントトラッキングコンポーネント
 * 
 * 機能:
 * - ページマウント時に「view」イベント送信（1回のみ）
 * - ページアンマウント時に「duration」イベント送信（10秒以上の滞在のみ）
 * 
 * 注意:
 * - UIは持たない（純粋なトラッキング用）
 * - エラー時もページ表示に影響を与えない（console.errorのみ）
 */
export function ToolEventTracker({ toolId }: ToolEventTrackerProps) {
  // 開始時刻を記録（アンマウント時の滞在時間計算用）
  const startTimeRef = useRef<number>(Date.now())
  
  // viewイベント送信済みフラグ（重複防止）
  const viewTrackedRef = useRef(false)

  useEffect(() => {
    // ============================================
    // マウント時: viewイベント送信
    // ============================================
    if (!viewTrackedRef.current) {
      trackEvent({
        target_type: 'tool',
        target_id: toolId,
        event_type: 'view',
      }).catch((error) => {
        console.error('[ToolEventTracker] viewイベント送信失敗:', error)
      })
      
      viewTrackedRef.current = true
    }

    // ============================================
    // アンマウント時: durationイベント送信
    // ============================================
    return () => {
      const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000)
      
      // 10秒未満の滞在は送信しない（知識ベース3より）
      if (durationSeconds < 10) {
        return
      }
      
      // 600秒（10分）でキャップ（知識ベース3より）
      const cappedDuration = Math.min(durationSeconds, 600)
      
      trackEvent({
        target_type: 'tool',
        target_id: toolId,
        event_type: 'duration',
        duration_seconds: cappedDuration,
      }).catch((error) => {
        console.error('[ToolEventTracker] durationイベント送信失敗:', error)
      })
    }
  }, [toolId])

  // UIは持たない
  return null
}
