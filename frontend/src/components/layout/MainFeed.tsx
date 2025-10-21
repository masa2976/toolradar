'use client'

import Link from 'next/link'
import { CategorySection } from '@/components/ui/CategorySection'
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
        adSlot="YYYYYYYYYY"
        adFormat="horizontal"
        placement="homepage-bottom"
        className="my-8"
      />
    </div>
  )
}
