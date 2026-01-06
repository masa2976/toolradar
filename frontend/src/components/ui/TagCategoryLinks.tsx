'use client'

import { FolderOpen, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useTagCategories } from '@/hooks/useTags'

interface TagCategoryLinksProps {
  className?: string
}

/**
 * タグカテゴリへのクイックリンク
 * サイドバー用 - メイン領域と差別化
 * 
 * メイン領域: 個別タグ（RSI, MACD等）への誘導
 * サイドバー: タグカテゴリ（テクニカル指標全体等）への誘導
 */
export function TagCategoryLinks({ className }: TagCategoryLinksProps) {
  const { data: categories, isPending, error } = useTagCategories()

  return (
    <div className={cn('rounded-lg border bg-white p-4 shadow-sm', className)}>
      {/* タイトル */}
      <div className="flex items-center gap-2 mb-4">
        <FolderOpen className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">
          タグカテゴリで探す
        </h3>
      </div>

      {/* ローディング */}
      {isPending && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {/* エラー */}
      {error && (
        <p className="text-sm text-muted-foreground py-2">
          カテゴリを読み込めませんでした
        </p>
      )}

      {/* カテゴリリンク */}
      {categories && categories.length > 0 && (
        <div className="space-y-1">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/tools/tags?category=${category.slug}`}
              className="group flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-primary/5 transition-colors"
            >
              <span className="font-medium text-gray-700 group-hover:text-primary transition-colors">
                {category.name}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-xs text-gray-400">
                  ({category.tag_count})
                </span>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* カテゴリがない場合 */}
      {categories && categories.length === 0 && (
        <p className="text-sm text-muted-foreground py-2">
          カテゴリがありません
        </p>
      )}

      {/* すべてのタグページへ */}
      <div className="mt-4 pt-3 border-t text-center">
        <Link 
          href="/tools/tags"
          className="text-sm font-medium text-primary hover:text-primary-hover hover:underline transition-colors"
        >
          すべてのタグを見る →
        </Link>
      </div>
    </div>
  )
}
