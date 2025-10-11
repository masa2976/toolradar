import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StandardPage, StandardPageAPIResponse } from '@/types/wagtail';

interface StandardPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * API取得関数
 */
async function getStandardPage(slug: string): Promise<StandardPage | null> {
  // サーバーサイド（Docker内部）ではAPI_URL、クライアントサイドではNEXT_PUBLIC_API_URL
  const baseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const url = `${baseUrl}/api/v2/pages/?slug=${slug}&type=blog.StandardPage&fields=body`;
  
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 } // 1時間キャッシュ
    });
    
    if (!res.ok) {
      console.error(`API Error: ${res.status} ${res.statusText}`);
      return null;
    }
    
    const data: StandardPageAPIResponse = await res.json();
    
    if (!data.items || data.items.length === 0) {
      return null;
    }
    
    return data.items[0];
  } catch (error) {
    console.error('Failed to fetch page:', error);
    return null;
  }
}

/**
 * メタデータ生成
 */
export async function generateMetadata({ params }: StandardPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getStandardPage(slug);
  
  if (!page) {
    return {
      title: 'Page Not Found | ToolRadar',
    };
  }
  
  // description を150-160文字に制限
  const description = page.meta.search_description || '';
  const truncatedDescription = description.length > 160 
    ? description.substring(0, 157) + '...'
    : description;
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolradar.jp';
  const pageUrl = `${siteUrl}/${slug}`;
  
  return {
    title: page.meta.seo_title || page.title,
    description: truncatedDescription,
    openGraph: {
      title: page.meta.seo_title || page.title,
      description: truncatedDescription,
      type: 'website',
      url: pageUrl,
      siteName: 'ToolRadar',
      images: [
        {
          url: `${siteUrl}/og-default.png`,
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.meta.seo_title || page.title,
      description: truncatedDescription,
      images: [`${siteUrl}/og-default.png`],
    },
  };
}

/**
 * ページコンポーネント
 */
export default async function StandardPageView({ params }: StandardPageProps) {
  const { slug } = await params;
  const page = await getStandardPage(slug);
  
  if (!page) {
    notFound();
  }
  
  // 構造化データ（BreadcrumbList）
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolradar.jp';
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: page.title,
        item: `${siteUrl}/${slug}`,
      },
    ],
  };
  
  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <article className="container mx-auto px-4 py-8 max-w-4xl">
      {/* タイトル */}
      <h1 className="text-4xl font-bold mb-8 text-gray-900">
        {page.title}
      </h1>
      
      {/* 本文（RichText） */}
      <div 
        className="prose prose-lg max-w-none
                   prose-headings:font-bold 
                   prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-l-4 prose-h2:border-blue-600 prose-h2:pl-4 prose-h2:text-gray-900
                   prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-gray-800
                   prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                   prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
                   prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4
                   prose-li:text-gray-700 prose-li:mb-2 prose-li:leading-relaxed
                   prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
                   prose-strong:font-semibold prose-strong:text-gray-900
                   [&_h2]:text-2xl [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:font-bold [&_h2]:border-l-4 [&_h2]:border-blue-600 [&_h2]:pl-4 [&_h2]:text-gray-900
                   [&_h3]:text-xl [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:font-bold [&_h3]:text-gray-800
                   [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-4
                   [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4
                   [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
                   [&_li]:text-gray-700 [&_li]:mb-2 [&_li]:leading-relaxed
                   [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800
                   [&_strong]:font-semibold [&_strong]:text-gray-900"
        dangerouslySetInnerHTML={{ __html: page.body }}
      />
      
      {/* 更新日時 */}
      {page.meta.first_published_at && (
        <div className="mt-12 pt-6 border-t text-sm text-gray-500">
          最終更新日: {new Date(page.meta.first_published_at).toLocaleDateString('ja-JP')}
        </div>
      )}
    </article>
    </>
  );
}

/**
 * 静的パス生成（本番用）
 */
export async function generateStaticParams() {
  // 4つの静的ページ
  return [
    { slug: 'privacy' },
    { slug: 'terms' },
    { slug: 'about' },
    { slug: 'contact' },
  ];
}
