'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import { BlogCard } from '@/components/ui/BlogCard';
import { Skeleton } from '@/components/ui/skeleton';

interface RelatedPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category_name: string;
  investment_type_name: string;
  featured_image_thumbnail?: string | null;
  published_at: string;
  updated_at: string;
  view_count: number;
  tag_names?: string[];
}

interface RelatedPostsProps {
  postSlug: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function RelatedPosts({ postSlug }: RelatedPostsProps) {
  const { data, error, isLoading } = useSWR(
    `/api/blog/posts/${postSlug}/related/`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1分間はキャッシュを使用
    }
  );

  if (error) {
    console.error('関連記事取得エラー:', error);
    return null;
  }

  if (isLoading) {
    return <RelatedPostsSkeleton />;
  }

  if (!data?.results || data.results.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">関連記事</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {data.results.map((post: RelatedPost) => (
          <BlogCard
            key={post.slug}
            post={{
              id: post.id,
              slug: post.slug,
              title: post.title,
              excerpt: post.excerpt,
              category: post.category_name,
              investment_type: post.investment_type_name as 'forex' | 'stock' | 'crypto' | 'commodity' | 'general',
              featured_image: post.featured_image_thumbnail ?? undefined,
              published_at: post.published_at,
              view_count: post.view_count,
              tags: post.tag_names,
            }}
          />
        ))}
      </div>
    </section>
  );
}

function RelatedPostsSkeleton() {
  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">関連記事</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card">
            <Skeleton className="aspect-video" />
            <div className="p-6">
              <Skeleton className="mb-2 h-5 w-20" />
              <Skeleton className="mb-3 h-7 w-full" />
              <Skeleton className="mb-1 h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}