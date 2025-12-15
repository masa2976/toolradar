'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RankingItem } from '@/types';
import { TrendingUp, TrendingDown, Minus, Sparkles, Eye, Share2, ImageIcon } from 'lucide-react';
import { cn, normalizePlatforms } from '@/lib/utils';
import { useState } from 'react';

interface RankingListProps {
  rankings: RankingItem[];
  limit?: number;
  showScore?: boolean;
  variant?: 'compact' | 'detailed';
}

export function RankingList({ 
  rankings, 
  limit, 
  showScore = true,
  variant = 'detailed' 
}: RankingListProps) {
  const isCompact = variant === 'compact';
  const displayRankings = limit ? rankings.slice(0, limit) : rankings;

  // ランク層（Tier）を判定
  // Tier 1: 1-3位（フィーチャード - 画像あり、詳細情報）
  // Tier 2: 4-5位（スタンダード - 画像なし、基本情報）
  // Tier 3: 6位以降（コンパクト - 最小限の情報）
  const getRankTier = (rank: number): 1 | 2 | 3 => {
    if (rank <= 3) return 1;
    if (rank <= 5) return 2;
    return 3;
  };

  // 順位変動アイコンと色
  const getRankChangeDisplay = (rankChange: string, tier: 1 | 2 | 3) => {
    const iconSize = tier === 3 ? 'w-2.5 h-2.5' : 'w-3 h-3';
    
    if (rankChange === 'NEW') {
      return {
        icon: <Sparkles className={iconSize} />,
        text: 'NEW',
        color: 'text-primary bg-primary/10 border-primary/30',
      };
    }
    if (rankChange === '→') {
      return {
        icon: <Minus className={iconSize} />,
        text: '−',
        color: 'text-muted-foreground bg-muted border-border',
      };
    }
    if (rankChange.startsWith('↑')) {
      return {
        icon: <TrendingUp className={iconSize} />,
        text: rankChange,
        color: 'text-success bg-success/10 border-success/30',
      };
    }
    if (rankChange.startsWith('↓')) {
      return {
        icon: <TrendingDown className={iconSize} />,
        text: rankChange,
        color: 'text-destructive bg-destructive/10 border-destructive/30',
      };
    }
    return {
      icon: <Minus className={iconSize} />,
      text: rankChange,
      color: 'text-muted-foreground bg-muted border-border',
    };
  };

  // 順位バッジの色（1-3位は特別）
  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-sm';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-sm';
    if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-sm';
    return 'bg-muted text-foreground';
  };

  // 順位バッジサイズ（Tier別）
  const getRankSize = (tier: 1 | 2 | 3) => {
    if (tier === 1) return 'w-7 h-7 text-sm font-bold';
    if (tier === 2) return 'w-6 h-6 text-xs font-semibold';
    return 'w-5 h-5 text-xs font-medium';
  };

  // カードのパディング（Tier別）
  const getCardPadding = (tier: 1 | 2 | 3) => {
    if (tier === 1) return 'p-3';
    if (tier === 2) return 'px-3 py-2';
    return 'px-3 py-1.5';
  };

  // ギャップサイズ（Tier別）
  const getGapSize = (tier: 1 | 2 | 3) => {
    if (tier === 1) return 'gap-3';
    if (tier === 2) return 'gap-2.5';
    return 'gap-2';
  };

  return (
    <div className="space-y-1.5">
      {displayRankings.map((item) => {
        const tier = getRankTier(item.rank);
        const changeDisplay = getRankChangeDisplay(item.rank_change, tier);

        return (
          <Link 
            key={item.tool.id}
            href={`/tools/${item.tool.slug}`}
            className="block"
          >
            <Card 
              className={cn(
                'group cursor-pointer hover:shadow-md hover:border-primary/40 transition-all duration-200',
                tier === 1 && 'border-primary/20'
              )}
            >
              <CardContent className={getCardPadding(tier)}>
                <div className={cn('flex items-center overflow-hidden', getGapSize(tier))}>
                  {/* 順位バッジ */}
                  <div className="flex-shrink-0">
                    <div 
                      className={cn(
                        'rounded-full flex items-center justify-center',
                        getRankBadgeColor(item.rank),
                        getRankSize(tier)
                      )}
                    >
                      {item.rank}
                    </div>
                  </div>

                  {/* ツール画像（Tier 1のみ表示） */}
                  {tier === 1 && (
                    <div className="flex-shrink-0">
                      <ToolImage 
                        src={item.tool.image_url} 
                        alt={item.tool.name}
                        size={isCompact ? 40 : 44}
                      />
                    </div>
                  )}

                  {/* ツール情報 */}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    {/* タイトル行 */}
                    <h3 className={cn(
                      'truncate group-hover:text-primary transition-colors',
                      tier === 1 && 'text-base font-semibold',
                      tier === 2 && 'text-sm font-semibold',
                      tier === 3 && 'text-sm font-medium'
                    )}>
                      {item.tool.name}
                    </h3>

                    {/* プラットフォーム & タイプ（Tier 1-2のみ） */}
                    {tier <= 2 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {normalizePlatforms(item.tool.platform).map(p => p.toUpperCase()).join('/')}
                        </span>
                        {tier === 1 && (
                          <>
                            <span className="text-xs text-muted-foreground">·</span>
                            <span className="text-xs text-muted-foreground">
                              {item.tool.tool_type}
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {/* 統計情報（Tier 1 + 詳細モードのみ） */}
                    {tier === 1 && !isCompact && (
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-0.5">
                          <Eye className="w-3 h-3" />
                          <span>{item.week_views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <Share2 className="w-3 h-3" />
                          <span>{item.week_shares}</span>
                        </div>
                        {showScore && (
                          <span className="font-medium text-primary">
                            {item.score.toFixed(1)}pt
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 順位変動 */}
                  <div className="flex-shrink-0">
                    <Badge 
                      variant="outline"
                      className={cn(
                        'flex items-center gap-0.5',
                        tier === 3 ? 'px-1 py-0 text-[10px]' : 'px-1.5 py-0.5 text-xs',
                        changeDisplay.color
                      )}
                    >
                      {changeDisplay.icon}
                      <span className="font-medium">
                        {changeDisplay.text}
                      </span>
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}

      {/* 表示件数制限の表示 */}
      {limit && rankings.length > limit && (
        <div className="text-center text-sm text-muted-foreground py-2">
          他 {rankings.length - limit} 件のツールがランクイン中
        </div>
      )}
    </div>
  );
}

// ツール画像コンポーネント（フォールバック対応）
function ToolImage({ src, alt, size = 48 }: { src: string; alt: string; size?: number }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div 
        className="bg-muted rounded-lg flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <ImageIcon className="w-5 h-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div 
      className="relative rounded-lg overflow-hidden bg-muted"
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={`${size}px`}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
