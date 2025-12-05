'use client'

import { useASPAd, useAdViewTracking, useAdClickTracking } from '@/hooks'
import { SafeHTML } from '@/components/ui/SafeHTML'
import { Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ASPAdStrategy } from '@/lib/api/asp'

// ============================================
// ASPAdSpace Props
// ============================================

interface ASPAdSpaceProps {
  /**
   * 広告配置場所（必須）
   * 例: 'homepage-middle', 'blog-middle', 'sidebar-top'
   */
  placement: string

  /**
   * 広告ローテーション戦略（オプション）
   * - priority: 優先度順（固定表示）
   * - random: 重み付きランダム（動的ローテーション）
   */
  strategy?: ASPAdStrategy

  /**
   * 追加のCSSクラス
   */
  className?: string

  /**
   * 表示カウント閾値（0-1、デフォルト: 0.5 = 50%）
   * Intersection Observer用
   */
  trackingThreshold?: number

  /**
   * 表示カウント遅延時間（ミリ秒、デフォルト: 1000ms）
   * 画面に表示されてからこの時間経過後にカウント
   */
  trackingDelay?: number

  /**
   * トラッキング有効化（デフォルト: true）
   */
  enableTracking?: boolean
}

// ============================================
// ASPAdSpace Component
// ============================================

/**
 * ASPアフィリエイト広告表示コンポーネント
 * 
 * 機能:
 * - Django APIから広告を動的取得
 * - Intersection Observerによる可視性トラッキング
 * - クリックトラッキング
 * - セキュリティ対策（dangerouslySetInnerHTML）
 * 
 * @example
 * // 優先度順で表示（固定）
 * <ASPAdSpace placement="homepage-middle" strategy="priority" />
 * 
 * @example
 * // ランダムローテーション
 * <ASPAdSpace placement="blog-middle" strategy="random" />
 */
export function ASPAdSpace({
  placement,
  strategy = 'priority',
  className,
  trackingThreshold = 0.5,
  trackingDelay = 1000,
  enableTracking = true,
}: ASPAdSpaceProps) {
  // 広告取得
  const { ad, isLoading, isError } = useASPAd(placement, strategy)

  // Intersection Observer による表示トラッキング
  const adRef = useAdViewTracking(
    ad?.id || null,
    trackingThreshold,
    trackingDelay,
    enableTracking
  )

  // クリックトラッキング
  const handleClick = useAdClickTracking(ad?.id || null, enableTracking)

  // ローディング状態
  if (isLoading) {
    return (
      <section
        className={cn('my-8', className)}
        data-asp-ad-space={placement}
      >
        <div className="flex justify-center items-center py-12 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </section>
    )
  }

  // エラー状態（表示しない）
  if (isError) {
    console.debug(`ASP Ad error for placement: ${placement}`)
    return null
  }

  // 広告がない場合（表示しない）
  if (!ad) {
    console.debug(`No active ads for placement: ${placement}`)
    return null
  }

  // 広告表示
  return (
    <section
      ref={adRef}
      className={cn('my-8', className)}
      data-asp-ad-space={placement}
      data-asp-ad-id={ad.id}
      onClick={handleClick}
    >
      {/* 広告コンテンツ */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        {/* ASP広告コード埋め込み（SafeHTML使用） */}
        <SafeHTML
          html={ad.ad_code}
          className="asp-ad-content flex justify-center items-center p-4"
        />
      </div>

      {/* 免責事項 */}
      <p className="mt-2 text-xs text-muted-foreground text-center">
        ※広告・アフィリエイトリンクを含みます。詳細は各サービスの公式サイトでご確認ください。
      </p>
    </section>
  )
}

// ============================================
// デフォルトエクスポート
// ============================================

export default ASPAdSpace
