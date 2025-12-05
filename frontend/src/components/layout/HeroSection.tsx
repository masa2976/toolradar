'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchBar } from '@/components/ui/SearchBar'
import { Badge } from '@/components/ui/badge'

const popularTags = [
  { name: 'RSI', slug: 'rsi' },
  { name: 'MACD', slug: 'macd' },
  { name: '移動平均', slug: 'ma' },
  { name: 'ボリンジャーバンド', slug: 'bb' },
  { name: 'スキャルピング', slug: 'scalping' },
  { name: 'デイトレード', slug: 'day_trading' },
  { name: 'USD/JPY', slug: 'usdjpy' },
  { name: 'EUR/USD', slug: 'eurusd' },
]

/**
 * HeroSectionのProps
 */
interface HeroSectionProps {
  /** ツール総数（動的表示用） */
  toolCount?: number
}

/**
 * ツール数に応じた表現を生成
 * @param count - ツール総数
 * @returns 表示用テキスト
 */
function getToolCountText(count: number): string {
  if (count === 0) return ''                        // フォールバック用
  if (count < 30) return `厳選${count}件`           // 少数は「厳選」で価値を強調
  if (count < 100) return `${count}件`              // 中規模はそのまま
  if (count < 500) return `${count}件以上`          // 100件超えたら「以上」OK
  return `${Math.floor(count / 100) * 100}件以上`   // 500+は丸める
}

export function HeroSection({ toolCount }: HeroSectionProps) {
  const router = useRouter()
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setIsSearching(true)
      // 検索ページへ遷移
      router.push(`/?q=${encodeURIComponent(query)}`)
      setTimeout(() => setIsSearching(false), 500)
    }
  }

  const handleTagClick = (slug: string) => {
    router.push(`/?tags=${slug}`)
  }

  // 動的H1テキスト生成
  const countText = toolCount ? getToolCountText(toolCount) : ''
  const h1Text = countText 
    ? `${countText}のFX自動売買・分析ツールを無料比較`
    : 'FX自動売買・分析ツールを無料で比較'

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 py-16 sm:py-20">
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
      
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          {/* キャッチコピー */}
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            {h1Text}
          </h1>
          
          <p className="mb-8 text-lg text-blue-50 sm:text-xl">
            MT4・MT5・TradingView対応。毎週更新のランキングで、
            <br className="hidden sm:inline" />
            今注目のEA・インジケーターをチェック。
          </p>

          {/* 検索バー */}
          <div className="mb-8">
            <SearchBar
              onSearch={handleSearch}
              placeholder="ツール名、タグ、キーワードで検索..."
              isLoading={isSearching}
              className="mx-auto max-w-2xl bg-white"
            />
          </div>

          {/* 人気タグ */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm font-medium text-blue-100">
              人気タグ:
            </span>
            {popularTags.map((tag) => (
              <Badge
                key={tag.slug}
                variant="secondary"
                className="cursor-pointer bg-white/20 text-white hover:bg-white/30 transition-colors"
                onClick={() => handleTagClick(tag.slug)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
