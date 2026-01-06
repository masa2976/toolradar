'use client'

import Link from 'next/link'
import { useWeeklyRanking } from '@/hooks/useRanking'
import { RankingList } from '@/components/ui/RankingList'
import { PopularPostsWidget } from '@/components/ui/PopularPostsWidget'
import { TagCategoryLinks } from '@/components/ui/TagCategoryLinks'
import { PopularTagsCloud } from '@/components/ui/PopularTagsCloud'
import { ASPWidget } from '@/components/ui/ASPWidget'
import { Loader2, TrendingUp, ChevronRight } from 'lucide-react'

interface SidebarProps {
  isMobile?: boolean
  /** ランキング表示件数（デフォルト: モバイル5件、デスクトップ3件） */
  rankingLimit?: number
}

export function Sidebar({ isMobile = false, rankingLimit }: SidebarProps) {
  // ランキング件数: 指定があればそれを使用、なければモバイル5件/デスクトップ3件
  const limit = rankingLimit ?? (isMobile ? 5 : 3)
  const { data: rankingData, isPending } = useWeeklyRanking({ limit })

  return (
    <aside className={`space-y-6 ${!isMobile ? 'lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto lg:pr-2' : ''}`}>
      {/* 1. 週間人気ランキング */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">
            週間人気TOP{limit}
          </h3>
        </div>
        
        {isPending ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : rankingData?.rankings && rankingData.rankings.length > 0 ? (
          <>
            <RankingList 
              rankings={rankingData.rankings} 
              variant="compact" 
              limit={limit}
              showScore={false}
            />
            <Link 
              href="/ranking/weekly"
              className="flex items-center justify-center gap-1 mt-4 pt-3 border-t text-sm text-primary hover:text-primary/80 transition-colors"
            >
              ランキングを全て見る
              <ChevronRight className="h-4 w-4" />
            </Link>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            ランキングデータがありません
          </p>
        )}
      </div>

      {/* 2. ASPウィジェット（デスクトップのみ、ランキング直後、PR表記済み） */}
      {!isMobile && <ASPWidget />}

      {/* 3. タグカテゴリリンク（モバイル・デスクトップ共通） */}
      <TagCategoryLinks />

      {/* 4. 人気タグクラウド（モバイル・デスクトップ共通） */}
      <PopularTagsCloud limit={isMobile ? 15 : 20} />

      {/* 5. 人気記事（デスクトップのみ） */}
      {!isMobile && <PopularPostsWidget limit={5} />}
    </aside>
  )
}
