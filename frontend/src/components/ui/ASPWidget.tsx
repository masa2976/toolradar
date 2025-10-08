'use client'

import { useBrokers } from '@/hooks'
import type { Broker } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, ExternalLink, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BrokerCardProps {
  broker: Broker
  rank: number
}

function BrokerCard({ broker, rank }: BrokerCardProps) {
  // ランキングバッジの色
  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-premium text-white'
    if (rank === 2) return 'bg-gray-400 text-white'
    if (rank === 3) return 'bg-orange-400 text-white'
    return 'bg-gray-500 text-white'
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* ランキングバッジ */}
          <div className="flex-shrink-0">
            <Badge
              className={cn(
                'text-sm font-bold px-2.5 py-1',
                getRankBadgeColor(rank)
              )}
            >
              {rank}位
            </Badge>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 min-w-0">
            {/* 会社名 */}
            <h4 className="font-bold text-sm mb-2">{broker.name}</h4>

            {/* 特徴リスト */}
            <ul className="space-y-1 mb-3">
              {broker.features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-1.5 text-xs text-muted-foreground"
                >
                  <Check className="w-3 h-3 mt-0.5 text-success flex-shrink-0" />
                  <span className="flex-1">{feature}</span>
                </li>
              ))}
            </ul>

            {/* ボーナス情報 */}
            {broker.bonus && (
              <Badge
                variant="outline"
                className="mb-3 text-xs bg-warning-light text-warning border-warning"
              >
                {broker.bonus}
              </Badge>
            )}

            {/* CTAボタン */}
            <Button
              asChild
              size="sm"
              className="w-full bg-accent hover:bg-accent-hover text-white"
            >
              <a
                href={broker.cta_url}
                target="_blank"
                rel="nofollow noopener noreferrer"
                data-tracking-id={broker.tracking_id}
              >
                詳細を見る
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ASPWidget() {
  const { data, isPending, isError } = useBrokers()

  // ローディング状態
  if (isPending) {
    return (
      <div className="rounded-lg border-2 border-accent/20 bg-accent/5 p-4">
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      </div>
    )
  }

  // エラー状態
  if (isError || !data || data.results.length === 0) {
    return (
      <div className="rounded-lg border-2 border-danger/20 bg-danger/5 p-4">
        <div className="flex items-center gap-2 text-danger">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">証券会社情報の取得に失敗しました</p>
        </div>
      </div>
    )
  }

  // TOP3のみ表示
  const brokers = data.results.slice(0, 3)

  return (
    <div className="rounded-lg border-2 border-accent/20 bg-accent/5 p-4">
      {/* タイトル */}
      <h3 className="text-base font-bold mb-4 text-foreground">
        おすすめ証券会社TOP3
      </h3>

      {/* ブローカーカード */}
      <div className="space-y-3">
        {brokers.map((broker) => (
          <BrokerCard key={broker.id} broker={broker} rank={broker.rank} />
        ))}
      </div>

      {/* 免責事項 */}
      <p className="text-xs text-muted-foreground mt-4 text-center">
        ※口座開設時は各社の最新情報をご確認ください
      </p>
    </div>
  )
}
