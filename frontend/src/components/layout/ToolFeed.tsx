'use client'

import { useToolsInfinite } from '@/hooks/useTools'
import { ToolCard } from '@/components/ui/ToolCard'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Loader2 } from 'lucide-react'

export function ToolFeed() {
  const { data, isPending, isError, fetchNextPage, hasNextPage } = useToolsInfinite({})

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-600">
          ツールの読み込みに失敗しました。再度お試しください。
        </p>
      </div>
    )
  }

  const tools = (data?.pages ?? []).flatMap((page) => page.results)

  return (
    <InfiniteScroll
      dataLength={tools.length}
      next={fetchNextPage}
      hasMore={hasNextPage ?? false}
      loader={
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      }
      endMessage={
        <p className="py-4 text-center text-sm text-gray-500">
          すべてのツールを表示しました
        </p>
      }
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} variant="detailed" />
        ))}
      </div>
    </InfiniteScroll>
  )
}
