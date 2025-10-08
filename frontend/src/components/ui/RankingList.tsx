'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RankingItem } from '@/types';
import { TrendingUp, TrendingDown, Minus, Sparkles, Eye, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  // 順位変動アイコンと色
  const getRankChangeDisplay = (rankChange: string) => {
    if (rankChange === 'NEW') {
      return {
        icon: <Sparkles className="w-4 h-4" />,
        text: 'NEW',
        color: 'text-primary bg-primary/10 border-primary/30',
      };
    }
    if (rankChange === '→') {
      return {
        icon: <Minus className="w-4 h-4" />,
        text: '変動なし',
        color: 'text-muted-foreground bg-muted border-border',
      };
    }
    if (rankChange.startsWith('↑')) {
      return {
        icon: <TrendingUp className="w-4 h-4" />,
        text: rankChange,
        color: 'text-success bg-success/10 border-success/30',
      };
    }
    if (rankChange.startsWith('↓')) {
      return {
        icon: <TrendingDown className="w-4 h-4" />,
        text: rankChange,
        color: 'text-destructive bg-destructive/10 border-destructive/30',
      };
    }
    return {
      icon: <Minus className="w-4 h-4" />,
      text: rankChange,
      color: 'text-muted-foreground bg-muted border-border',
    };
  };

  // 順位バッジの色（1-3位は特別）
  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700 text-white shadow-lg';
    if (rank === 2) return 'bg-gradient-to-br from-gray-300 to-gray-500 dark:from-gray-400 dark:to-gray-600 text-white shadow-lg';
    if (rank === 3) return 'bg-gradient-to-br from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700 text-white shadow-lg';
    return 'bg-muted text-foreground';
  };

  // 順位サイズ（1-3位は大きく）
  const getRankSize = (rank: number) => {
    if (rank <= 3) return 'w-16 h-16 text-2xl font-bold';
    return 'w-12 h-12 text-lg font-semibold';
  };

  return (
    <div className="space-y-3">
      {displayRankings.map((item) => {
        const changeDisplay = getRankChangeDisplay(item.rank_change);

        return (
          <Card 
            key={item.tool.id}
            className={cn(
              'group hover:shadow-md transition-all duration-200',
              item.rank <= 3 && 'border-2 border-primary/20'
            )}
          >
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                {/* 順位バッジ */}
                <div className="flex-shrink-0 self-start sm:self-center">
                  <div 
                    className={cn(
                      'rounded-full flex items-center justify-center shadow-sm',
                      getRankBadgeColor(item.rank),
                      getRankSize(item.rank)
                    )}
                  >
                    {item.rank}
                  </div>
                </div>

                {/* ツール情報 */}
                <div className="flex-1 min-w-0">
                  {/* タイトル行 */}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn(
                      'font-bold truncate group-hover:text-primary transition-colors',
                      isCompact ? 'text-sm' : 'text-base'
                    )}>
                      {item.tool.name}
                    </h3>
                  </div>

                  {/* プラットフォーム & タイプ */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge 
                      variant="secondary"
                      className="text-xs"
                    >
                      {item.tool.platform.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.tool.tool_type}
                    </Badge>
                  </div>

                  {/* 統計情報（詳細モード） */}
                  {!isCompact && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{item.week_views.toLocaleString()} PV</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" />
                        <span>{item.week_shares} シェア</span>
                      </div>
                      {showScore && (
                        <div className="font-semibold text-primary">
                          スコア: {item.score.toFixed(1)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 順位変動 */}
                <div className="flex-shrink-0 self-start sm:self-center">
                  <Badge 
                    variant="outline"
                    className={cn(
                      'flex items-center gap-1 px-3 py-1',
                      changeDisplay.color
                    )}
                  >
                    {changeDisplay.icon}
                    <span className="font-semibold text-xs">
                      {changeDisplay.text}
                    </span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
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
