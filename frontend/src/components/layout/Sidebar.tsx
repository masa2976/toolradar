'use client'

import { FilterPanel } from '@/components/ui/FilterPanel'
import { useWeeklyRanking } from '@/hooks/useRanking'
import { RankingList } from '@/components/ui/RankingList'
import { Loader2, TrendingUp } from 'lucide-react'
import type { FilterState } from '@/components/ui/FilterPanel'
import { ASPWidget } from '@/components/ui/ASPWidget'

interface SidebarProps {
  onFilterChange?: (filters: FilterState) => void
}

export function Sidebar({ onFilterChange }: SidebarProps) {
  const { data: rankingData, isPending } = useWeeklyRanking()

  return (
    <aside className="space-y-6">
      {/* フィルターパネル */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          絞り込み検索
        </h3>
        <FilterPanel onFilterChange={onFilterChange ?? (() => {})} />
      </div>

      {/* ASPウィジェット（収益源） */}
      <ASPWidget />

      {/* 人気ランキング TOP5 */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            人気ランキング
          </h3>
        </div>
        
        {isPending ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : rankingData?.rankings && rankingData.rankings.length > 0 ? (
          <RankingList 
            rankings={rankingData.rankings} 
            variant="compact" 
            limit={5}
          />
        ) : (
          <p className="text-sm text-gray-500">
            ランキングデータがありません
          </p>
        )}
      </div>

      {/* 注目記事（将来実装） */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          注目記事
        </h3>
        <p className="text-sm text-gray-500">
          ブログ機能実装後に表示されます
        </p>
      </div>
    </aside>
  )
}
