import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CategoryOptionCardProps {
  label: string
  href: string
  gradient: string
  icon?: React.ReactNode
  toolCount?: number
  className?: string
}

export function CategoryOptionCard({
  label,
  href,
  gradient,
  icon,
  toolCount,
  className,
}: CategoryOptionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        // ベーススタイル
        'group relative block h-[160px] rounded-xl p-8 overflow-hidden',
        'transition-all duration-300 ease-out',
        // グラデーション背景
        `bg-gradient-to-br ${gradient}`,
        // ホバー効果
        'hover:scale-105 hover:shadow-xl',
        // アクセシビリティ
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        className
      )}
    >
      {/* 背景装飾（微妙な円形グラデーション） */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* コンテンツ */}
      <div className="relative flex h-full flex-col justify-between">
        {/* 上部: アイコン */}
        {icon && (
          <div className="flex items-start">
            <div className="text-white/90 group-hover:text-white transition-colors">
              {icon}
            </div>
          </div>
        )}

        {/* 下部: ラベルとツール数 */}
        <div>
          <h3 className="text-xl font-bold text-white mb-1 group-hover:translate-x-1 transition-transform duration-300">
            {label}
          </h3>
          {toolCount !== undefined && (
            <p className="text-sm text-white/80 group-hover:text-white transition-colors">
              {toolCount.toLocaleString()}件のツール
            </p>
          )}
        </div>
      </div>

      {/* 矢印アイコン（右上） */}
      <div className="absolute top-4 right-4 text-white/60 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
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
