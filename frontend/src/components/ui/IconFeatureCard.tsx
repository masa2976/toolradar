'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface IconFeatureCardProps {
  label: string
  href: string
  icon: React.ReactNode
  description: string
  accentColor?: string
  className?: string
}

/**
 * アイコン強調カード
 * 用途: ツールタイプなど、機能説明が重要な項目
 * デザイン: 白背景 + 中央配置の大アイコン + 説明文
 */
export function IconFeatureCard({
  label,
  href,
  icon,
  description,
  accentColor = 'blue',
  className,
}: IconFeatureCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        // ベーススタイル
        'group block rounded-xl p-6 h-[200px]',
        'bg-white border-2 border-gray-200',
        'transition-all duration-300 ease-out',
        // ホバー効果
        'hover:border-blue-500 hover:shadow-lg hover:-translate-y-1',
        // アクセシビリティ
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        className
      )}
    >
      <div className="flex h-full flex-col items-center justify-center text-center">
        {/* アイコン（大きめ） */}
        <div className="mb-4 text-6xl transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>

        {/* ラベル */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {label}
        </h3>

        {/* 説明文 */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {description}
        </p>
      </div>
    </Link>
  )
}
