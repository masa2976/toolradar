'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToolFeed } from './ToolFeed'
import { BlogFeed } from './BlogFeed'
import { RankingFeed } from './RankingFeed'

type FeedTab = 'tools' | 'ranking'

export function MainFeed() {
  const [activeTab, setActiveTab] = useState<FeedTab>('tools')

  return (
    <div className="space-y-8">
      {/* ツール系タブ（同じカテゴリ） */}
      <section>
        <h2 className="text-2xl font-bold mb-4">投資ツール</h2>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FeedTab)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tools">新着ツール</TabsTrigger>
            <TabsTrigger value="ranking">週間ランキング</TabsTrigger>
          </TabsList>

          <TabsContent value="tools" className="mt-6">
            <ToolFeed />
          </TabsContent>

          <TabsContent value="ranking" className="mt-6">
            <RankingFeed />
          </TabsContent>
        </Tabs>
      </section>

      {/* ブログセクション（独立） */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">新着記事</h2>
          <Link 
            href="/blog" 
            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            すべて見る →
          </Link>
        </div>
        <BlogFeed limit={3} />
      </section>
    </div>
  )
}
