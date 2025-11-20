'use client'

import { AlertCircle, Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { SafeHTML } from '@/components/ui/SafeHTML';
import { useAdClickTracking, useAdViewTracking } from '@/hooks/useAdViewTracking';
import { useASPAd } from '@/hooks/useASPAd';

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
export function ASPWidget() {
  // 広告取得（サイドバー上部、優先度順）
  const { ad, isLoading, isError } = useASPAd('sidebar-top', 'priority')

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

  // エラーまたは広告なしの場合はダミー表示
  if (isError || !ad) {
    // ダミーデータ（本番環境ではAPIから取得）
    const dummyAd = {
      id: 999,
      name: 'ダミー広告',
      ad_code: `
        <div style="text-align: center; padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
          <h4 style="color: white; margin-bottom: 8px; font-size: 16px; font-weight: bold;">おすすめ証券会社</h4>
          <p style="color: white; margin-bottom: 12px; font-size: 14px;">初心者に最適な証券口座</p>
          <button style="background: white; color: #667eea; padding: 8px 24px; border-radius: 4px; border: none; font-weight: bold; cursor: pointer;">
            詳細を見る
          </button>
        </div>
      `,
    }
    
    return (
      <div
        ref={adRef}
        className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm hover:shadow-md transition-shadow"
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
          html={dummyAd.ad_code}
          className="asp-ad-content flex justify-center items-center"
        />

        {/* 免責事項 */}
        <p className="mt-1 text-xs text-gray-500">
          ※アフィリエイト広告
        </p>
      </div>
    )
  }

  // 広告表示
  return (
    <div
      ref={adRef}
      className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm hover:shadow-md transition-shadow"
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
