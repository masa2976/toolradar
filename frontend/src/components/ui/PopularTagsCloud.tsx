'use client'

import { useQuery } from '@tanstack/react-query'
import { tagsApi } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Hash, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PopularTagsCloudProps {
  limit?: number
  className?: string
}

export function PopularTagsCloud({ 
  limit = 20, 
  className 
}: PopularTagsCloudProps) {
  // タグ一覧を取得
  const { data: tags, isPending, isError } = useQuery({
    queryKey: ['tags', 'popular'],
    queryFn: () => tagsApi.getTags(),
    staleTime: 24 * 60 * 60 * 1000, // 24時間
  })

  // ローディング状態
  if (isPending) {
    return (
      <div className={cn('rounded-lg border bg-white p-4 shadow-sm', className)}>
        <div className="flex items-center gap-2 mb-4">
          <Hash className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">
            人気タグ
          </h3>
        </div>
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  // エラー状態またはデータがない場合
  if (isError || !tags) {
    return (
      <div className={cn('rounded-lg border bg-white p-4 shadow-sm', className)}>
        <div className="flex items-center gap-2 mb-4">
          <Hash className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">
            人気タグ
          </h3>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <AlertCircle className="h-4 w-4" />
          <p>タグデータがありません</p>
        </div>
      </div>
    )
  }

  // tagsが配列かどうか確認
  const tagsArray = Array.isArray(tags) ? tags : []
  
  // データがない場合
  if (tagsArray.length === 0) {
    return (
      <div className={cn('rounded-lg border bg-white p-4 shadow-sm', className)}>
        <div className="flex items-center gap-2 mb-4">
          <Hash className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">
            人気タグ
          </h3>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <AlertCircle className="h-4 w-4" />
          <p>タグデータがありません</p>
        </div>
      </div>
    )
  }

  // tool_countでソートして上位を取得
  const popularTags = [...tagsArray]
    .sort((a, b) => (b.tool_count || 0) - (a.tool_count || 0))
    .slice(0, limit)

  return (
    <div className={cn('rounded-lg border bg-white p-4 shadow-sm', className)}>
      {/* タイトル */}
      <div className="flex items-center gap-2 mb-4">
        <Hash className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">
          人気タグ
        </h3>
      </div>

      {/* タグクラウド */}
      <div className="flex flex-wrap gap-2">
        {popularTags.map((tag) => (
          <Link 
            key={tag.id} 
            href={`/tools?tags=${tag.slug}`}
          >
            <Badge 
              variant="secondary"
              className="hover:bg-primary hover:text-white transition-colors cursor-pointer text-sm"
            >
              {tag.name}
              {tag.tool_count && tag.tool_count > 0 && (
                <span className="ml-1 text-xs opacity-70">
                  ({tag.tool_count})
                </span>
              )}
            </Badge>
          </Link>
        ))}
      </div>

      {/* すべてのタグリンク */}
      <div className="mt-4 pt-3 border-t text-center">
        <Link 
          href="/tools"
          className="text-sm font-medium text-primary hover:text-primary-hover hover:underline transition-colors"
        >
          すべてのタグを見る →
        </Link>
      </div>
    </div>
  )
}
