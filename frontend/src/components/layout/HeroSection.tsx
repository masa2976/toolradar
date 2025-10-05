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

export function HeroSection() {
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

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 py-16 sm:py-20">
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
      
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          {/* キャッチコピー */}
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            投資ツールの
            <br className="hidden sm:inline" />
            最適解を見つけよう
          </h1>
          
          <p className="mb-8 text-lg text-blue-50 sm:text-xl">
            MT4/MT5/TradingViewのツール検索から投資ノウハウまで、
            <br className="hidden sm:inline" />
            すべてがここに。
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
