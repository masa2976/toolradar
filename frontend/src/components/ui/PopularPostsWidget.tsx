'use client'

import { useBlogPosts } from '@/hooks'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Eye, Loader2, AlertCircle, FileText } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PopularPostsWidgetProps {
  limit?: number
  className?: string
}

export function PopularPostsWidget({ 
  limit = 5, 
  className 
}: PopularPostsWidgetProps) {
  // 最新記事を取得（将来的にview_countでソート可能）
  const { data, isPending, isError } = useBlogPosts({ 
    page: 1, 
    limit 
  })

  // ローディング状態
  if (isPending) {
    return (
      <div className={cn('rounded-lg border bg-white p-4 shadow-sm', className)}>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">
            人気記事
          </h3>
        </div>
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  // エラー状態
  if (isError || !data || data.results.length === 0) {
    return (
      <div className={cn('rounded-lg border bg-white p-4 shadow-sm', className)}>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">
            人気記事
          </h3>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <AlertCircle className="h-4 w-4" />
          <p>記事データがありません</p>
        </div>
      </div>
    )
  }

  const posts = data.results.slice(0, limit)

  return (
    <div className={cn('rounded-lg border bg-white p-4 shadow-sm', className)}>
      {/* タイトル */}
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">
          人気記事
        </h3>
      </div>

      {/* 記事リスト */}
      <div className="space-y-3">
        {posts.map((post, index) => (
          <Link 
            key={post.id} 
            href={`/blog/${post.slug}`}
            className="block group"
          >
            <Card className="transition-all hover:shadow-md">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  {/* 番号 */}
                  <div className="flex-shrink-0">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      index < 3 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-600'
                    )}>
                      {index + 1}
                    </div>
                  </div>

                  {/* コンテンツ */}
                  <div className="flex-1 min-w-0">
                    {/* タイトル */}
                    <h4 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h4>

                    {/* カテゴリ */}
                    <Badge variant="secondary" className="text-xs mb-2">
                      {post.category}
                    </Badge>

                    {/* メタ情報 */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {post.reading_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{post.reading_time}分</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{post.view_count.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* もっと見るリンク */}
      <div className="mt-4 text-center">
        <Link 
          href="/blog"
          className="text-sm font-medium text-primary hover:text-primary-hover hover:underline transition-colors"
        >
          すべて見る →
        </Link>
      </div>
    </div>
  )
}
