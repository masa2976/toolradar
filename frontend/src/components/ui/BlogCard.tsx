'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BlogPost } from '@/types';
import { Calendar, Eye, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogCardProps {
  post: BlogPost;
  variant?: 'horizontal' | 'vertical';
  showExcerpt?: boolean;
  showImage?: boolean;
  showAuthor?: boolean;
  onClick?: () => void;
}

export function BlogCard({ 
  post, 
  variant = 'vertical', 
  showExcerpt = true,
  showImage = true,
  showAuthor = true,
  onClick 
}: BlogCardProps) {
  const isHorizontal = variant === 'horizontal';

  // カテゴリバッジの色
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'beginner_guide': 'bg-blue-500',
      'tool_review': 'bg-green-500',
      'trading_strategy': 'bg-purple-500',
      'market_analysis': 'bg-orange-500',
      'ranking_report': 'bg-pink-500',
      'tutorial': 'bg-indigo-500',
      'news': 'bg-red-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  // カテゴリ名の日本語変換
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'beginner_guide': '初心者ガイド',
      'tool_review': 'ツールレビュー',
      'trading_strategy': 'トレード戦略',
      'market_analysis': '市場分析',
      'ranking_report': 'ランキング特集',
      'tutorial': 'チュートリアル',
      'news': 'ニュース',
    };
    return labels[category] || category;
  };

  // 投資タイプバッジの色
  const getInvestmentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'forex': 'bg-emerald-500',
      'stock': 'bg-blue-600',
      'crypto': 'bg-amber-500',
      'commodity': 'bg-rose-500',
      'general': 'bg-slate-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  // 投資タイプ名の日本語変換
  const getInvestmentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'forex': 'FX',
      'stock': '株式',
      'crypto': '仮想通貨',
      'commodity': 'コモディティ',
      'general': '投資全般',
    };
    return labels[type] || type;
  };

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 閲覧数フォーマット
  const formatViewCount = (count: number) => {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万`;
    }
    return count.toLocaleString();
  };

  return (
    <Card 
      className={cn(
        'group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
        'border-border hover:border-primary/50',
        isHorizontal ? 'flex flex-row' : 'flex flex-col',
        'h-full overflow-hidden'
      )}
      onClick={onClick}
    >
      {/* アイキャッチ画像 */}
      {showImage && (
        <div className={cn(
          'relative overflow-hidden bg-muted',
          isHorizontal ? 'w-2/5 min-h-full' : 'w-full aspect-video'
        )}>
          <img 
            src={post.featured_image || '/placeholder-blog.png'} 
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* カテゴリバッジ（画像上） */}
          <div className="absolute top-2 left-2">
            <Badge 
              className={cn(
                getCategoryColor(post.category),
                'text-white text-xs px-2 py-1 shadow-md'
              )}
            >
              {getCategoryLabel(post.category)}
            </Badge>
          </div>
        </div>
      )}

      <div className={cn(
        'flex flex-col',
        isHorizontal ? 'w-3/5' : 'w-full'
      )}>
        <CardHeader className="p-4 pb-2">
          {/* 投資タイプバッジ */}
          <div className="flex flex-wrap gap-1 mb-2">
            <Badge 
              className={cn(
                getInvestmentTypeColor(post.investment_type),
                'text-white text-xs px-2 py-0.5'
              )}
            >
              {getInvestmentTypeLabel(post.investment_type)}
            </Badge>
            
            {/* タグ表示 */}
            {post.tags && post.tags.length > 0 && (
              <>
                {post.tags.slice(0, 2).map((tag, idx) => (
                  <Badge 
                    key={idx}
                    variant="secondary"
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
                {post.tags.length > 2 && (
                  <span className="text-xs text-muted-foreground self-center">
                    +{post.tags.length - 2}
                  </span>
                )}
              </>
            )}
          </div>

          {/* タイトル */}
          <CardTitle className={cn(
            'font-bold line-clamp-2 group-hover:text-primary transition-colors',
            isHorizontal ? 'text-base' : 'text-lg'
          )}>
            {post.title}
          </CardTitle>

          {/* 抜粋 */}
          {showExcerpt && (
            <CardDescription className={cn(
              'mt-2 text-sm',
              isHorizontal ? 'line-clamp-2' : 'line-clamp-3'
            )}>
              {post.excerpt}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="p-4 pt-0 mt-auto">
          {/* メタ情報 */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {/* 公開日 */}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(post.published_at)}</span>
            </div>

            {/* 閲覧数 */}
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{formatViewCount(post.view_count)}</span>
            </div>

            {/* 著者情報 */}
            {showAuthor && post.author && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{post.author.name}</span>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
