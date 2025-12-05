'use client'

import { useBlogPosts } from '@/hooks/useBlog'
import { BlogCard } from '@/components/ui/BlogCard'
import { Loader2 } from 'lucide-react'

interface BlogFeedProps {
  limit?: number;
}

export function BlogFeed({ limit }: BlogFeedProps) {
  const { data, isPending, error } = useBlogPosts({ limit })

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">
          記事の読み込みに失敗しました。再度お試しください。
        </p>
      </div>
    )
  }

  const posts = data?.results ?? []

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
        <p className="text-sm text-gray-600">記事がまだありません</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {posts.map((post) => (
        <BlogCard key={post.slug} post={post} variant="vertical" />
      ))}
    </div>
  )
}
