'use client'

import { AlertCircle, Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { SafeHTML } from '@/components/ui/SafeHTML';
import { useAdClickTracking, useAdViewTracking } from '@/hooks/useAdViewTracking';
import { useASPAd } from '@/hooks/useASPAd';

interface ASPWidgetProps {
  placement?: string;
  className?: string;
  sortOrder?: 'priority' | 'random';
}

/**
 * ASPWidget コンポーネント
 *
 * サイドバーに表示されるASP広告ウィジェット。
 * - DOMPurifyによるHTMLサニタイズ
 * - IAB基準準拠のトラッキング
 * - 優先度順またはランダムでの広告表示
 *
 * @example
 * <Sidebar>
 *   <ASPWidget />
 * </Sidebar>
 */
export function ASPWidget({ 
  placement = 'sidebar-top', 
  className = '',
  sortOrder = 'priority' 
}: ASPWidgetProps) {
  // 広告取得（配置場所とソート順を設定）
  const { ad, isLoading, isError } = useASPAd(placement, sortOrder)

  // IAB準拠トラッキング（50%表示 + 1秒継続）
  const adRef = useAdViewTracking(ad?.id || null)
  const handleClick = useAdClickTracking(ad?.id || null)

  // ローディング状態
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      </div>
    )
  }

  // エラーまたは広告なしの場合は何も表示しない
  if (isError || !ad) {
    return null
  }

  // 広告表示
  return (
    <div
      ref={adRef}
      className={`rounded-lg border border-gray-200 bg-white p-2 shadow-sm hover:shadow-md transition-shadow ${className}`}
      onClick={handleClick}
    >
      {/* PR表記 */}
      <div className="flex items-center justify-end mb-1">
        <Badge variant="outline" className="text-xs bg-gray-50">
          PR
        </Badge>
      </div>

      {/* 広告コンテンツ（SafeHTML使用） */}
      <SafeHTML
        html={ad.ad_code}
        className="asp-ad-content flex justify-center items-center"
      />

      {/* 免責事項 */}
      <p className="mt-1 text-xs text-gray-500">
        ※アフィリエイト広告
      </p>
    </div>
  )
}
