'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trophy, TrendingUp, TrendingDown, Minus, Eye, Share2, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Platform, ToolType, RankingResponse, RankingItem } from '@/types';

// ============================================
// 型定義
// ============================================

interface WeeklyRankingClientProps {
  initialData: RankingResponse;
  title: string;
  currentPlatform?: Platform;
  currentToolType?: ToolType;
  platforms: Platform[];
  toolTypes: ToolType[];
  platformNames: Record<Platform, string>;
  toolTypeNames: Record<ToolType, string>;
}

// ============================================
// URL用ツールタイプマッピング
// ============================================

const TOOL_TYPE_TO_URL: Record<ToolType, string> = {
  EA: 'ea',
  Indicator: 'indicator',
  Library: 'library',
  Script: 'script',
  Strategy: 'strategy',
};

// ============================================
// ヘルパー関数
// ============================================

function getRankChangeIcon(rankChange: string) {
  if (rankChange === 'NEW') {
    return <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">NEW</span>;
  }
  if (rankChange.startsWith('↑')) {
    return (
      <span className="flex items-center text-emerald-600 text-sm">
        <TrendingUp className="w-4 h-4 mr-0.5" />
        {rankChange.slice(1)}
      </span>
    );
  }
  if (rankChange.startsWith('↓')) {
    return (
      <span className="flex items-center text-red-500 text-sm">
        <TrendingDown className="w-4 h-4 mr-0.5" />
        {rankChange.slice(1)}
      </span>
    );
  }
  return (
    <span className="flex items-center text-gray-400 text-sm">
      <Minus className="w-4 h-4" />
    </span>
  );
}

function getRankBadgeStyle(rank: number) {
  if (rank === 1) return 'bg-yellow-400 text-yellow-900';
  if (rank === 2) return 'bg-gray-300 text-gray-700';
  if (rank === 3) return 'bg-amber-600 text-white';
  return 'bg-gray-100 text-gray-600';
}

function buildUrl(platform?: Platform, toolType?: ToolType): string {
  const base = '/ranking/weekly';
  if (!platform) return base;
  if (!toolType) return `${base}/${platform}`;
  return `${base}/${platform}/${TOOL_TYPE_TO_URL[toolType]}`;
}

// ============================================
// サブコンポーネント
// ============================================

function PlatformTabs({
  platforms,
  platformNames,
  currentPlatform,
}: {
  platforms: Platform[];
  platformNames: Record<Platform, string>;
  currentPlatform?: Platform;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Link
        href="/ranking/weekly"
        className={cn(
          'px-4 py-2 rounded-lg font-medium transition-colors',
          !currentPlatform
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        )}
      >
        全て
      </Link>
      {platforms.map((platform) => (
        <Link
          key={platform}
          href={buildUrl(platform)}
          className={cn(
            'px-4 py-2 rounded-lg font-medium transition-colors',
            currentPlatform === platform
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {platformNames[platform]}
        </Link>
      ))}
    </div>
  );
}

function ToolTypeFilter({
  toolTypes,
  toolTypeNames,
  currentPlatform,
  currentToolType,
}: {
  toolTypes: ToolType[];
  toolTypeNames: Record<ToolType, string>;
  currentPlatform?: Platform;
  currentToolType?: ToolType;
}) {
  // プラットフォームが選択されていない場合は非表示
  if (!currentPlatform) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Link
        href={buildUrl(currentPlatform)}
        className={cn(
          'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
          !currentToolType
            ? 'bg-blue-100 text-blue-700 border border-blue-300'
            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
        )}
      >
        全タイプ
      </Link>
      {toolTypes.map((toolType) => (
        <Link
          key={toolType}
          href={buildUrl(currentPlatform, toolType)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            currentToolType === toolType
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
          )}
        >
          {toolTypeNames[toolType]}
        </Link>
      ))}
    </div>
  );
}

function RankingCard({ item, rank }: { item: RankingItem; rank: number }) {
  const tool = item.tool;
  
  return (
    <Link href={`/tools/${tool.slug}`} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
        <div className="flex items-start gap-4">
        {/* ランク表示 */}
        <div className="flex flex-col items-center">
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg',
              getRankBadgeStyle(rank)
            )}
          >
            {rank}
          </div>
          <div className="mt-1">
            {getRankChangeIcon(item.rank_change)}
          </div>
        </div>

        {/* ツール画像 */}
        <div className="relative w-16 h-16 flex-shrink-0">
          {tool.image_url ? (
            <Image
              src={tool.image_url}
              alt={tool.name}
              fill
              className="object-cover rounded-lg"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>

        {/* ツール情報 */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
            {tool.name}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
            {tool.short_description}
          </p>
          
          {/* プラットフォーム・タイプバッジ */}
          <div className="flex flex-wrap gap-1 mt-2">
            {(Array.isArray(tool.platform) ? tool.platform : [tool.platform]).map((p) => (
              <span
                key={p}
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
              >
                {String(p).toUpperCase()}
              </span>
            ))}
            <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
              {tool.tool_type}
            </span>
          </div>
        </div>

        {/* スコア・統計 */}
        <div className="hidden sm:flex flex-col items-end gap-1 text-sm">
          <div className="font-bold text-blue-600">
            {item.score.toFixed(1)} pt
          </div>
          <div className="flex items-center text-gray-400 text-xs">
            <Eye className="w-3 h-3 mr-1" />
            {item.week_views}
          </div>
          <div className="flex items-center text-gray-400 text-xs">
            <Share2 className="w-3 h-3 mr-1" />
            {item.week_shares}
          </div>
        </div>
        </div>
      </div>
    </Link>
  );
}

// ============================================
// メインコンポーネント
// ============================================

export function WeeklyRankingClient({
  initialData,
  title,
  currentPlatform,
  currentToolType,
  platforms,
  toolTypes,
  platformNames,
  toolTypeNames,
}: WeeklyRankingClientProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {title}
          </h1>
        </div>
        {initialData.updated_at && (
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            最終更新: {new Date(initialData.updated_at).toLocaleString('ja-JP')}
          </p>
        )}
      </div>

      {/* プラットフォームタブ */}
      <PlatformTabs
        platforms={platforms}
        platformNames={platformNames}
        currentPlatform={currentPlatform}
      />

      {/* ツールタイプフィルター */}
      <ToolTypeFilter
        toolTypes={toolTypes}
        toolTypeNames={toolTypeNames}
        currentPlatform={currentPlatform}
        currentToolType={currentToolType}
      />

      {/* ランキングリスト */}
      {initialData.rankings.length > 0 ? (
        <div className="space-y-3">
          {initialData.rankings.map((item, index) => (
            <RankingCard key={item.tool.id} item={item} rank={index + 1} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            該当するツールが見つかりませんでした
          </p>
          <Link
            href="/ranking/weekly"
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            全体ランキングを見る
          </Link>
        </div>
      )}

      {/* 注釈 */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
        <p className="font-medium mb-2">📊 ランキングについて</p>
        <p>
          週間ランキングは、過去7日間のPV数・シェア数・滞在時間・CTAクリック数を
          独自のスコア計算式で評価しています。毎日深夜2時に自動更新されます。
        </p>
      </div>
    </div>
  );
}
