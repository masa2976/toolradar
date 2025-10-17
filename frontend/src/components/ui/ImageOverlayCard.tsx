'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ImageOverlayCardProps {
  label: string
  href: string
  description: string
  backgroundImage: string
  className?: string
}

/**
 * 画像オーバーレイカード
 * 用途: トレードスタイルなど、視覚的イメージが重要な項目
 * デザイン: 背景画像 + 暗いオーバーレイ + 白文字
 */
export function ImageOverlayCard({
  label,
  href,
  description,
  backgroundImage,
  className,
}: ImageOverlayCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative block h-[200px] rounded-xl overflow-hidden',
        'transition-all duration-300 ease-out',
        'hover:shadow-xl',
        // アクセシビリティ
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        className
      )}
    >
      {/* 背景画像 */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt={label}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* 暗いオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30 group-hover:from-black/60 group-hover:via-black/40 group-hover:to-black/20 transition-colors duration-300" />

      {/* テキストコンテンツ（下部） */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        {/* ラベル */}
        <h3 className="text-2xl font-bold text-white mb-2 group-hover:translate-x-1 transition-transform duration-300">
          {label}
        </h3>

        {/* 説明文 */}
        <p className="text-sm text-white/90 line-clamp-2">
          {description}
        </p>
      </div>

      {/* 右上の矢印アイコン */}
      <div className="absolute top-4 right-4 text-white/80 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </div>
    </Link>
  )
}
