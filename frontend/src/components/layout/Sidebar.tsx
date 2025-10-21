'use client'

import { useWeeklyRanking } from '@/hooks/useRanking'
import { RankingList } from '@/components/ui/RankingList'
import { PopularPostsWidget } from '@/components/ui/PopularPostsWidget'
import { CategoryQuickLinks } from '@/components/ui/CategoryQuickLinks'
import { PopularTagsCloud } from '@/components/ui/PopularTagsCloud'
import { ASPWidget } from '@/components/ui/ASPWidget'
import { Loader2, TrendingUp } from 'lucide-react'

interface SidebarProps {
  isMobile?: boolean
}

export function Sidebar({ isMobile = false }: SidebarProps) {
  // モバイル時はランキングを5件、デスクトップは10件
  const rankingLimit = isMobile ? 5 : 10
  const { data: rankingData, isPending } = useWeeklyRanking({ limit: rankingLimit })

  return (
    <aside className={`space-y-6 ${!isMobile ? 'lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto lg:pr-2' : ''}`}>
      {/* 1. 週間人気ランキング（モバイル: TOP5 / デスクトップ: TOP10） */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">
            {isMobile ? '週間人気TOP5' : '週間人気TOP10'}
          </h3>
        </div>
        
        {isPending ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : rankingData?.rankings && rankingData.rankings.length > 0 ? (
          <RankingList 
            rankings={rankingData.rankings} 
            variant="compact" 
            limit={rankingLimit}
            showScore={false}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            ランキングデータがありません
          </p>
        )}
      </div>

      {/* 2. ASPウィジェット（デスクトップのみ、ランキング直後、PR表記済み） */}
      {!isMobile && <ASPWidget />}

      {/* 3. カテゴリクイックリンク（モバイル・デスクトップ共通） */}
      <CategoryQuickLinks />

      {/* 4. 人気タグクラウド（モバイル・デスクトップ共通） */}
      <PopularTagsCloud limit={isMobile ? 15 : 20} />

      {/* 5. 人気記事（デスクトップのみ） */}
      {!isMobile && <PopularPostsWidget limit={5} />}
    </aside>
  )
}
