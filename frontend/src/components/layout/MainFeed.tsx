'use client'

import Link from 'next/link'
import { CategorySection } from '@/components/ui/CategorySection'
import { Separator } from '@/components/ui/separator'
import { IconFeatureCard } from '@/components/ui/IconFeatureCard'
import { ImageOverlayCard } from '@/components/ui/ImageOverlayCard'
import { BlogFeed } from './BlogFeed'
import { ASPAdSpace } from '@/components/ui/ASPAdSpace'
import { AdSense } from '@/components/ui/AdSense'
import {
  platforms,
  toolTypes,
  technicalIndicators,
  tradeStyles,
  priceTypes,
} from '@/lib/data/categories'

export function MainFeed() {
  return (
    <div className="space-y-10">
      {/* 1. プラットフォーム（3個） - SimpleGradientCard */}
      <CategorySection 
        title="プラットフォーム別に探す" 
        gridCols="grid-cols-3"
        items={platforms}
      />

      {/* 2. ツールタイプ（4個） - IconFeatureCard */}
      <section>
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            ツールタイプから探す
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {toolTypes.map((item) => (
            <IconFeatureCard
              key={item.label}
              label={item.label}
              href={item.href}
              icon={item.icon}
              description={item.description || ''}
            />
          ))}
        </div>
      </section>

      {/* 3. テクニカル指標（5個） - SimpleGradientCard */}
      <CategorySection
        title="テクニカル指標から探す"
        gridCols="grid-cols-3 sm:grid-cols-5"
        items={technicalIndicators}
      />

      {/* ASP広告: トップページ中盤 */}
      <ASPAdSpace 
        placement="homepage-middle" 
        strategy="random"
      />

      {/* 4. トレードスタイル（4個） - ImageOverlayCard */}
      <section>
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            トレードスタイルから探す
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {tradeStyles.map((item) => (
            <ImageOverlayCard
              key={item.label}
              label={item.label}
              href={item.href}
              description={item.description || ''}
              backgroundImage={item.backgroundImage || ''}
            />
          ))}
        </div>
      </section>

      {/* 5. 価格帯（3個） - SimpleGradientCard */}
      <CategorySection 
        title="価格帯から探す" 
        gridCols="grid-cols-3"
        items={priceTypes}
      />

      {/* ========== セクション区切り（ツール→ブログ遷移） ========== */}
      <section className="mt-16 flex flex-col items-center gap-6">
        {/* メインCTAボタン */}
        <Link
          href="/tools"
          className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-sm border-2 border-primary bg-transparent px-6 py-3 text-lg font-bold text-primary transition-all duration-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/90 translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
          <span className="relative z-10 flex items-center gap-2">
            すべてのツールを見る
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-1 transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </Link>
        
        {/* 視覚的な区切り線 */}
        <Separator className="w-full max-w-4xl my-4" />
        
        {/* セクション切り替えの見出し */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            投資の学びを深める
          </h2>
          <p className="text-sm text-gray-600">
            FX・株式・仮想通貨の最新情報
          </p>
        </div>
      </section>

      {/* 6. ブログセクション */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">新着記事</h2>
          <Link
            href="/blog"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            すべて見る →
          </Link>
        </div>
        <BlogFeed limit={3} />
      </section>

      {/* ========== AdSense広告（トップページ下部） ========== */}
      <AdSense
        slot="YYYYYYYYYY"
        format="horizontal"
        placement="homepage-bottom"
        className="my-8"
      />
    </div>
  )
}
