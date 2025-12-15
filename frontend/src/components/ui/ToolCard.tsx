'use client';

import Image from 'next/image';
import { placeholderDataUrl } from '@/lib/imageUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tool } from '@/types';
import { ExternalLink, Tag, DollarSign } from 'lucide-react';
import { cn, normalizePlatforms } from '@/lib/utils';
import Link from 'next/link';

interface ToolCardProps {
  tool: Tool;
  variant?: 'compact' | 'detailed';
  showRibbon?: boolean;
}

export function ToolCard({ 
  tool, 
  variant = 'detailed', 
  showRibbon = true 
}: ToolCardProps) {
  const isCompact = variant === 'compact';
  
  // APIが文字列または配列を返す可能性があるため正規化
  const platforms = normalizePlatforms(tool.platform);

  // プラットフォームバッジの色
  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      mt4: 'bg-blue-500',
      mt5: 'bg-green-500',
      tradingview: 'bg-purple-500',
    };
    return colors[platform.toLowerCase()] || 'bg-gray-500';
  };

  // 価格表示
  const renderPrice = () => {
    if (tool.price_type === 'free') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          無料
        </Badge>
      );
    }
    if (tool.price_type === 'freemium') {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          Freemium
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
        <DollarSign className="w-3 h-3 mr-1" />
        有料
      </Badge>
    );
  };

  // リボンの色
  const getRibbonColor = (ribbon: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-500',
      popular: 'bg-red-500',
      featured: 'bg-yellow-500',
    };
    return colors[ribbon.toLowerCase()] || 'bg-gray-500';
  };

  return (
    <Link 
      href={`/tools/${tool.slug}`}
      className="block"
    >
      <Card 
        className={cn(
          'group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
          'border-border hover:border-primary/50',
          isCompact ? 'h-auto' : 'h-full'
        )}
      >
      {/* サムネイル画像 */}
      <div className="relative w-full aspect-video overflow-hidden rounded-t-lg bg-muted">
        <Image 
          src={tool.image_url || '/placeholder-tool.png'} 
          alt={`${tool.name}のサムネイル画像`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          placeholder="blur"
          blurDataURL={placeholderDataUrl}
        />
        
        {/* リボン表示 */}
        {showRibbon && tool.ribbons && tool.ribbons.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {tool.ribbons.slice(0, 2).map((ribbon, idx) => (
              <Badge 
                key={idx}
                className={cn(
                  getRibbonColor(ribbon),
                  'text-white text-xs px-2 py-1 shadow-md'
                )}
              >
                {ribbon.toUpperCase()}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <CardHeader className="p-4">
        {/* プラットフォームバッジ */}
        <div className="flex flex-wrap gap-1 mb-2">
          {platforms.map((p, idx) => (
            <Badge 
              key={idx}
              className={cn(
                getPlatformColor(p),
                'text-white text-xs px-2 py-0.5'
              )}
            >
              {p.toUpperCase()}
            </Badge>
          ))}
          
          {/* ツールタイプ */}
          <Badge variant="secondary" className="text-xs">
            {tool.tool_type}
          </Badge>

          {/* 価格 */}
          {renderPrice()}
        </div>

        {/* タイトル */}
        <CardTitle className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">
          {tool.name}
        </CardTitle>

        {/* 説明文 */}
        {!isCompact && (
          <CardDescription className="mt-2 line-clamp-3 text-sm">
            {tool.short_description}
          </CardDescription>
        )}
      </CardHeader>

      {/* タグ */}
      {!isCompact && tool.tag_names && tool.tag_names.length > 0 && (
        <CardContent className="p-4 pt-0">
          <div className="flex flex-wrap gap-1">
            <Tag className="w-3 h-3 text-muted-foreground mr-1" />
            {tool.tag_names.slice(0, 5).map((tag, idx) => (
              <Badge 
                key={idx}
                variant="outline"
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
            {tool.tag_names.length > 5 && (
              <span className="text-xs text-muted-foreground">
                +{tool.tag_names.length - 5}
              </span>
            )}
          </div>
        </CardContent>
      )}

      {/* フッター - 外部リンク */}
      {!isCompact && tool.external_url && (
        <CardContent className="p-4 pt-0">
          <div className="flex items-center text-xs text-muted-foreground group-hover:text-primary transition-colors">
            <ExternalLink className="w-3 h-3 mr-1" />
            詳細を見る
          </div>
        </CardContent>
      )}
    </Card>
    </Link>
  );
}
