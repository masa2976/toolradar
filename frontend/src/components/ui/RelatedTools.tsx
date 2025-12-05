'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Star } from 'lucide-react';
import { placeholderDataUrl } from '@/lib/imageUtils';

interface RelatedTool {
  slug: string;
  name: string;
  short_description: string;
  platform: string[];
  tool_type: string;
  week_score?: number;
  week_rank?: number;
  image_url: string;
  tags?: Array<{ name: string; slug: string }>;
  view_count?: number;
}

interface RelatedToolsProps {
  toolSlug: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function RelatedTools({ toolSlug }: RelatedToolsProps) {
  const { data, error, isLoading } = useSWR(
    `/api/tools/${toolSlug}/related/`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1分間はキャッシュを使用
    }
  );

  if (error) {
    console.error('関連ツール取得エラー:', error);
    return null;
  }

  if (isLoading) {
    return <RelatedToolsSkeleton />;
  }

  if (!data?.results || data.results.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">関連ツール</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.results.map((tool: RelatedTool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="transition-transform hover:scale-105"
            prefetch={false}
          >
            <Card className="h-full overflow-hidden hover:shadow-lg">
              <div className="aspect-video relative bg-muted">
                <Image
                  src={tool.image_url || '/images/placeholder.png'}
                  alt={`${tool.name} - ${tool.platform.join('/')} ${tool.tool_type}ツール`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={placeholderDataUrl}
                />
                <div className="absolute left-2 top-2 flex gap-1">
                  {tool.platform.map((p) => (
                    <Badge key={p} variant="secondary" className="text-xs">
                      {p.toUpperCase()}
                    </Badge>
                  ))}
                </div>
                {tool.week_rank && tool.week_rank <= 10 && (
                  <div className="absolute right-2 top-2">
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      #{tool.week_rank}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="mb-2 line-clamp-1 font-semibold text-lg">
                  {tool.name}
                </h3>
                <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                  {tool.short_description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {tool.tool_type === 'EA' && 'Expert Advisor'}
                    {tool.tool_type === 'Indicator' && 'インジケーター'}
                    {tool.tool_type === 'Library' && 'ライブラリ'}
                    {tool.tool_type === 'Script' && 'スクリプト'}
                    {tool.tool_type === 'Strategy' && 'ストラテジー'}
                  </Badge>
                  {tool.week_score && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3" />
                      <span>{tool.week_score.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                {tool.tags && tool.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {tool.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag.slug} variant="secondary" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

function RelatedToolsSkeleton() {
  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">関連ツール</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-video" />
            <div className="p-4">
              <Skeleton className="mb-2 h-6 w-3/4" />
              <Skeleton className="mb-3 h-8 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}