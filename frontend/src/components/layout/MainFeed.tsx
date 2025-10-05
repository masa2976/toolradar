'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ToolFeed } from './ToolFeed'
import { BlogFeed } from './BlogFeed'
import { RankingFeed } from './RankingFeed'

type FeedTab = 'tools' | 'blog' | 'ranking'

export function MainFeed() {
  const [activeTab, setActiveTab] = useState<FeedTab>('tools')

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FeedTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tools">新着ツール</TabsTrigger>
          <TabsTrigger value="blog">新着記事</TabsTrigger>
          <TabsTrigger value="ranking">週間ランキング</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="mt-6">
          <ToolFeed />
        </TabsContent>

        <TabsContent value="blog" className="mt-6">
          <BlogFeed />
        </TabsContent>

        <TabsContent value="ranking" className="mt-6">
          <RankingFeed />
        </TabsContent>
      </Tabs>
    </div>
  )
}
