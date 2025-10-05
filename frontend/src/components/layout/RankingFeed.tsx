'use client'

import { useWeeklyRanking } from '@/hooks/useRanking'
import { RankingList } from '@/components/ui/RankingList'
import { Loader2 } from 'lucide-react'

export function RankingFeed() {
  const { data, isPending, error } = useWeeklyRanking()

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">
          ランキングの読み込みに失敗しました。再度お試しください。
        </p>
      </div>
    )
  }

  const rankings = data?.rankings ?? []

  if (rankings.length === 0) {
    return (
      <div className="rounded-lg border bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-600">
          現在ランキングデータがありません
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            週間ランキング TOP50
          </h3>
          <p className="text-sm text-gray-500">
            更新: {new Date(data.updated_at).toLocaleDateString('ja-JP')}
          </p>
        </div>
        <RankingList rankings={rankings} variant="detailed" limit={50} />
      </div>
    </div>
  )
}
