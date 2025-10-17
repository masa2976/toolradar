'use client'

import { CategoryOptionCard } from './CategoryOptionCard'

export interface CategoryItem {
  label: string
  href: string
  gradient: string
  icon?: React.ReactNode
  toolCount?: number
  description?: string        // 説明文（IconFeatureCard, ImageOverlayCard用）
  backgroundImage?: string    // 背景画像URL（ImageOverlayCard用）
}

interface CategorySectionProps {
  title: string
  subtitle?: string
  titleAlign?: 'left' | 'center'
  gridCols?: string  // Tailwind CSSクラス文字列（例: "grid-cols-3"）
  items: CategoryItem[]
  className?: string
}

export function CategorySection({
  title,
  subtitle,
  titleAlign = 'center',
  gridCols = 'grid-cols-2 sm:grid-cols-3',  // デフォルト値
  items,
  className,
}: CategorySectionProps) {
  // タイトルのクラス
  const titleClass = titleAlign === 'center' 
    ? 'text-center' 
    : 'text-left'

  return (
    <section className={className}>
      {/* セクションタイトル */}
      <div className={`mb-4 ${titleClass}`}>
        <h2 className="text-2xl font-bold text-gray-900">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-600 mt-1">
            {subtitle}
          </p>
        )}
      </div>

      {/* カテゴリカードグリッド（中央揃え） */}
      <div className={`grid ${gridCols} gap-6 place-content-center`}>
        {items.map((item) => (
          <CategoryOptionCard
            key={item.label}
            label={item.label}
            href={item.href}
            gradient={item.gradient}
            icon={item.icon}
            toolCount={item.toolCount}
          />
        ))}
      </div>
    </section>
  )
}
