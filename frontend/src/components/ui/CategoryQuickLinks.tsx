'use client'

import { Layers, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CategoryLink {
  label: string
  href: string
  icon?: React.ReactNode
}

interface CategoryQuickLinksProps {
  className?: string
}

const categories: CategoryLink[] = [
  {
    label: 'MT4ツール',
    href: '/tools?platform=mt4',
  },
  {
    label: 'MT5ツール',
    href: '/tools?platform=mt5',
  },
  {
    label: 'TradingViewツール',
    href: '/tools?platform=tradingview',
  },
  {
    label: 'EA/ストラテジー',
    href: '/tools?tool_type=ea',
  },
  {
    label: 'インジケーター',
    href: '/tools?tool_type=indicator',
  },
  {
    label: '無料ツール',
    href: '/tools?price_type=free',
  },
  {
    label: '有料ツール',
    href: '/tools?price_type=paid',
  },
]

export function CategoryQuickLinks({ className }: CategoryQuickLinksProps) {
  return (
    <div className={cn('rounded-lg border bg-white p-4 shadow-sm', className)}>
      {/* タイトル */}
      <div className="flex items-center gap-2 mb-4">
        <Layers className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">
          カテゴリから探す
        </h3>
      </div>

      {/* カテゴリリンク */}
      <div className="space-y-2">
        {categories.map((category) => (
          <Link
            key={category.href}
            href={category.href}
            className="group flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-primary/5 transition-colors"
          >
            <span className="font-medium text-gray-700 group-hover:text-primary transition-colors">
              {category.label}
            </span>
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>

      {/* すべてのカテゴリリンク */}
      <div className="mt-4 pt-3 border-t text-center">
        <Link 
          href="/tools"
          className="text-sm font-medium text-primary hover:text-primary-hover hover:underline transition-colors"
        >
          すべてのツールを見る →
        </Link>
      </div>
    </div>
  )
}
