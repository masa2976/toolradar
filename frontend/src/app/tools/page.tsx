import { Suspense } from 'react';
import { getTools } from '@/lib/api/tools';
import { ToolsClient } from './ToolsClient';
import type { Platform, ToolType, PriceType, Tool } from '@/types';

// ============================================
// ツール一覧ページ（Server Component）
// ============================================

interface PageProps {
  searchParams: Promise<{
    q?: string;
    platform?: string;
    tool_type?: string;
    price_type?: string;
    tags?: string;
    ordering?: string;
    page?: string;
  }>;
}

export default async function ToolsListPage({ searchParams }: PageProps) {
  // searchParamsをawaitで解決（Next.js 16の仕様）
  const resolvedParams = await searchParams;
  
  // URLパラメータを解析
  const params = {
    q: resolvedParams.q,
    platform: resolvedParams.platform as Platform | undefined,
    tool_type: resolvedParams.tool_type as ToolType | undefined,
    price_type: resolvedParams.price_type as PriceType | undefined,
    tags: resolvedParams.tags,
    ordering: resolvedParams.ordering,
    page: resolvedParams.page ? parseInt(resolvedParams.page) : undefined,
  };

  // Server Componentでデータ取得（エラーハンドリング付き）
  let tools: Tool[] = [];
  let count = 0;
  
  try {
    const data = await getTools(params);
    tools = data.results;
    count = data.count;
  } catch (error) {
    // APIエラー時は空の結果を返す（無限ループ防止）
    console.error('[ToolsListPage] Failed to fetch tools:', error);
  }

  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <ToolsClient
        initialTools={tools}
        initialCount={count}
        initialFilters={{
          q: resolvedParams.q,
          platform: resolvedParams.platform,
          tool_type: resolvedParams.tool_type,
          price_type: resolvedParams.price_type,
          tags: resolvedParams.tags,
          ordering: resolvedParams.ordering,
        }}
      />
    </Suspense>
  );
}

// メタデータ生成（SEO）
export async function generateMetadata({ searchParams }: PageProps) {
  // searchParamsをawaitで解決
  const resolvedParams = await searchParams;
  
  const platform = resolvedParams.platform;
  const toolType = resolvedParams.tool_type;
  
  let title = '投資ツール一覧';
  if (platform) {
    title = `${platform.toUpperCase()}ツール一覧`;
  }
  if (toolType) {
    title += ` - ${toolType}`;
  }
  
  return {
    title: `${title} | ToolRadar`,
    description: 'MT4/MT5/TradingViewの優良ツールを検索・比較。週間ランキング、レビュー、詳細情報を掲載。',
  };
}
