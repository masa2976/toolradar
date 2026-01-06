// ============================================
// ブログ記事詳細ページ（Draft Mode対応）
// ============================================

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import { Badge } from '@/components/ui/badge';
import { Calendar, Eye, Clock, AlertCircle, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { placeholderDataUrl } from '@/lib/imageUtils';
import { StreamFieldRenderer } from '@/components/blog/StreamFieldRenderer';
import { calculateReadingTime } from '@/lib/readingTime';
import { RelatedPosts } from '@/components/ui/RelatedPosts';
import { AdSense } from '@/components/ui/AdSense';


// ============================================
// メタデータ生成
// ============================================

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const apiUrl = process.env.API_URL || 'http://backend:8000';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolradar.jp';
  
  try {
    const response = await fetch(
      `${apiUrl}/api/blog/posts/${decodedSlug}/`,
      {
        next: { revalidate: 3600 },
      }
    );
    
    if (!response.ok) {
      return {
        title: '記事が見つかりません | ToolRadar',
        description: 'お探しの記事は見つかりませんでした。',
      };
    }
    
    const post = await response.json();
    const pageUrl = `${siteUrl}/blog/${slug}`;
    
    // アイキャッチ画像のURL取得
    const imageUrl = post.featured_image?.url 
      ? (post.featured_image.url.startsWith('http') 
          ? post.featured_image.url 
          : `${apiUrl}${post.featured_image.url}`)
      : `${siteUrl}/default-blog-image.jpg`;
    
    return {
      title: `${post.title} | ToolRadar`,
      description: post.excerpt || post.title,
      keywords: post.tags?.map((tag: any) => tag.name).join(', '),
      authors: [{ name: 'ToolRadar編集部' }],
      openGraph: {
        title: post.title,
        description: post.excerpt || post.title,
        url: pageUrl,
        siteName: 'ToolRadar',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        locale: 'ja_JP',
        type: 'article',
        publishedTime: post.first_published_at,
        modifiedTime: post.last_published_at,
        authors: ['ToolRadar編集部'],
        tags: post.tags?.map((tag: any) => tag.name),
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt || post.title,
        images: [imageUrl],
        creator: '@toolradar',
        site: '@toolradar',
      },
      alternates: {
        canonical: pageUrl,
      },
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      title: '記事 | ToolRadar',
      description: '投資ツール・トレード戦略の解説記事',
    };
  }
}

// ============================================
// ページコンポーネント
// ============================================

export default async function BlogPostPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  const { isEnabled } = await draftMode();
  
  // URLエンコードされたslugをデコード
  const decodedSlug = decodeURIComponent(slug);
  
  // プレビューパラメータを取得
  const isPreview = searchParamsResolved.preview === 'true';
  const previewToken = typeof searchParamsResolved.token === 'string' ? searchParamsResolved.token : undefined;
  const contentType = typeof searchParamsResolved.content_type === 'string' ? searchParamsResolved.content_type : 'blog.blogpage';
  
  // APIからデータ取得
  // サーバーサイド: Docker内部通信用URL（backend:8000）
  const apiUrl = process.env.API_URL || 'http://backend:8000';
  
  try {
    let post;
    
    // プレビューモード: WagtailプレビューAPIを使用
    if (isPreview && previewToken) {
      console.log('Fetching preview data:', { token: previewToken, contentType });
      
      const previewUrl = `${apiUrl}/api/v2/page_preview/1/?token=${previewToken}&content_type=${contentType}`;
      const response = await fetch(previewUrl, {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        console.error('Preview API failed:', response.status, response.statusText);
        notFound();
      }
      
      const previewData = await response.json();
      console.log('Preview data received:', { title: previewData.title, hasBody: !!previewData.body });
      
      // WagtailプレビューAPIのレスポンスを通常の記事形式に変換
      post = transformPreviewData(previewData, apiUrl);
    } else {
      // 通常モード: Django APIを使用
      const response = await fetch(
        `${apiUrl}/api/blog/posts/${decodedSlug}/`,
        {
          headers: isEnabled ? {
            'X-Draft-Mode': 'true',
          } : {},
          cache: isEnabled ? 'no-store' : 'default',
          next: isEnabled ? { revalidate: 0 } : { revalidate: 3600 },
        }
      );
      
      if (!response.ok) {
        notFound();
      }
      
      post = await response.json();
    }
    
    // 構造化データ（Article Schema）
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolradar.jp';
    const pageUrl = `${siteUrl}/blog/${decodedSlug}`;
    const imageUrl = post.featured_image?.url 
      ? (post.featured_image.url.startsWith('http') 
          ? post.featured_image.url 
          : `${apiUrl}${post.featured_image.url}`)
      : `${siteUrl}/default-blog-image.jpg`;
    
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt || post.title,
      image: imageUrl,
      datePublished: post.first_published_at,
      dateModified: post.last_published_at || post.first_published_at,
      author: {
        '@type': 'Organization',
        name: 'ToolRadar編集部',
        url: siteUrl,
      },
      publisher: {
        '@type': 'Organization',
        name: 'ToolRadar',
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/logo.png`,
        },
        url: siteUrl,
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': pageUrl,
      },
      articleSection: post.category?.name || 'ブログ',
      keywords: post.tags?.map((tag: any) => tag.name).join(', '),
    };
    
    // BreadcrumbList構造化データ
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'ホーム',
          item: siteUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'ブログ',
          item: `${siteUrl}/blog`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: post.title,
          item: pageUrl,
        },
      ],
    };
    
    return (
      <>
        {/* 構造化データ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        
        <article className="container mx-auto px-4 py-6 max-w-4xl blog-content">
          {/* Draft Modeインジケーター */}
          {isEnabled && <DraftModeIndicator />}
        
        {/* 記事ヘッダー */}
        <BlogPostHeader post={post} />

        {/* 記事本文 */}
        <BlogPostContent post={post} />

          {/* 関連ツール */}
          <RelatedTools tools={post.related_tools || []} />

          {/* 関連記事セクション */}
          <div className="border-t border-border pt-8 mt-8">
            <RelatedPosts postSlug={decodedSlug} />
          </div>
        </article>
      </>
    );
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
    notFound();
  }
}

// ============================================
// Draft Modeインジケーター
// ============================================

function DraftModeIndicator() {
  return (
    <div className="fixed top-0 left-0 right-0 bg-warning text-warning-foreground p-3 text-center z-50 flex items-center justify-center gap-4 shadow-lg">
      <AlertCircle className="w-5 h-5" />
      <span className="font-medium">プレビューモード（下書き表示中）</span>
      <Link 
        href="/api/preview/disable"
        className="flex items-center gap-1 px-3 py-1 bg-background text-warning rounded hover:bg-muted transition-colors"
      >
        終了
        <X className="w-4 h-4" />
      </Link>
    </div>
  );
}

// ============================================
// ヘッダーコンポーネント
// ============================================

function BlogPostHeader({ post }: { post: any }) {
  return (
    <div className="mb-6 border-b border-border pb-5">
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="default">{post.category?.name || 'カテゴリ'}</Badge>
        <Badge variant="secondary">{post.investment_type?.name || 'FX'}</Badge>
      </div>

      <h1 className="text-4xl font-extrabold text-foreground mb-4">
        {post.title}
      </h1>

      <p className="text-lg text-muted-foreground mb-6">
        {post.excerpt || '記事の概要がここに表示されます。'}
      </p>

      {/* メタ情報 */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{new Date(post.published_at || post.first_published_at).toLocaleDateString('ja-JP')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{calculateReadingTime(post.body)}分で読めます</span>
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>{post.view_count?.toLocaleString() || 0} PV</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// コンテンツコンポーネント
// ============================================

function BlogPostContent({ post }: { post: any }) {
  // 環境変数から広告スロットIDを取得
  const adSlotToc = process.env.NEXT_PUBLIC_AD_SLOT_TOC || '';
  const adSlotMiddle = process.env.NEXT_PUBLIC_AD_SLOT_MIDDLE || '';
  const adSlotBottom = process.env.NEXT_PUBLIC_AD_SLOT_BOTTOM || '';
  
  return (
    <div className="prose prose-lg max-w-none mb-8">
      {/* アイキャッチ画像 */}
      {post.featured_image && (
        <div className="relative mb-6 aspect-video rounded-lg overflow-hidden">
          <Image 
            src={post.featured_image.url || post.featured_image} 
            alt={post.featured_image.alt || `${post.title}のアイキャッチ画像`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px"
            className="object-cover"
            priority
            placeholder="blur"
            blurDataURL={placeholderDataUrl}
          />
        </div>
      )}
      
      {/* StreamFieldブロックのレンダリング */}
      {post.body ? (
        Array.isArray(post.body) ? (
          // ✅ 新実装: StreamFieldRenderer（型安全・XSS対策済み）
          <div className="prose prose-lg max-w-none mb-8 blog-content
                   prose-headings:font-bold 
                   prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-l-4 prose-h2:border-blue-600 prose-h2:pl-4 prose-h2:text-gray-900
                   prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-gray-800
                   prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                   prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
                   prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4
                   prose-li:text-gray-700 prose-li:mb-2 prose-li:leading-relaxed
                   prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
                   prose-strong:font-semibold prose-strong:text-gray-900
                   prose-code:bg-gray-100 prose-code:text-gray-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono
                   prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-pre:border prose-pre:border-gray-700 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                   [&_h2]:text-2xl [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:font-bold [&_h2]:border-l-4 [&_h2]:border-blue-600 [&_h2]:pl-4 [&_h2]:text-gray-900
                   [&_h3]:text-xl [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:font-bold [&_h3]:text-gray-800
                   [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-4
                   [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4
                   [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
                   [&_li]:text-gray-700 [&_li]:mb-2 [&_li]:leading-relaxed
                   [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800
                   [&_strong]:font-semibold [&_strong]:text-gray-900">
            <StreamFieldRenderer 
              blocks={post.body}
              adSlotAfterToc={adSlotToc}
              adSlotMiddle={adSlotMiddle}
            />
          </div>
        ) : (
          // ⚠️ 後方互換性: HTMLとして返された場合（非推奨）
          <div 
            dangerouslySetInnerHTML={{ __html: post.body }}
            className="prose-headings:font-bold prose-a:text-primary prose-a:underline prose-code:bg-muted prose-code:text-accent-foreground prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-pre:bg-muted prose-pre:text-foreground prose-pre:border prose-pre:border-border prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-mark:bg-warning/20 prose-mark:text-warning-foreground prose-strong:text-foreground prose-th:text-foreground prose-td:text-foreground prose-li:text-foreground"
          />
        )
      ) : (
        <>
          <p className="text-foreground">記事本文がここに表示されます。</p>
          
          <div className="bg-muted border border-border rounded p-4 my-6">
            <p className="text-sm text-muted-foreground">
              記事本文が取得できませんでした。
            </p>
          </div>
        </>
      )}
      
      {/* 記事末尾のAdSense広告 */}
      {adSlotBottom && (
        <AdSense 
          slot={adSlotBottom}
          placement="blog-bottom"
          format="auto"
        />
      )}
    </div>
  );
}

// ============================================
// 関連ツールコンポーネント
// ============================================

function RelatedTools({ tools }: { tools: any[] }) {
  if (!tools || tools.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border pt-8">
      <h2 className="text-2xl font-bold text-foreground mb-4">関連ツール</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.id || tool.slug}
            href={`/tools/${tool.slug}`}
            className="p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow"
          >
            <h3 className="font-bold text-lg text-foreground mb-2">{tool.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {tool.short_description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ============================================
// WagtailプレビューAPIレスポンス変換
// ============================================

function transformPreviewData(previewData: any, apiUrl: string) {
  // WagtailプレビューAPIのレスポンスを通常の記事形式に変換
  // Wagtail API v2のレスポンス形式に対応
  
  // 画像URLの処理
  let featuredImage = null;
  if (previewData.featured_image) {
    // Wagtail API v2形式: { id: 1, meta: { download_url: "..." } }
    if (previewData.featured_image.meta?.download_url) {
      const imageUrl = previewData.featured_image.meta.download_url;
      featuredImage = {
        url: imageUrl.startsWith('http') ? imageUrl : `${apiUrl}${imageUrl}`,
        alt: previewData.featured_image.title || previewData.title,
      };
    } else if (previewData.featured_image.url) {
      // 既にURL形式の場合
      featuredImage = {
        url: previewData.featured_image.url.startsWith('http') 
          ? previewData.featured_image.url 
          : `${apiUrl}${previewData.featured_image.url}`,
        alt: previewData.featured_image.alt || previewData.title,
      };
    }
  }
  
  // カテゴリの処理
  let category = null;
  if (previewData.category) {
    // 文字列の場合はそのまま使用
    if (typeof previewData.category === 'string') {
      category = { name: previewData.category };
    } else if (previewData.category.name) {
      category = previewData.category;
    }
  }
  
  // 投資タイプの処理
  let investmentType = null;
  if (previewData.investment_type) {
    if (typeof previewData.investment_type === 'string') {
      investmentType = { name: previewData.investment_type };
    } else if (previewData.investment_type.name) {
      investmentType = previewData.investment_type;
    }
  }
  
  // タグの処理
  let tags: any[] = [];
  if (previewData.tags && Array.isArray(previewData.tags)) {
    tags = previewData.tags.map((tag: any) => {
      if (typeof tag === 'string') {
        return { name: tag, slug: tag };
      }
      return tag;
    });
  }
  
  return {
    id: previewData.id,
    title: previewData.title || '無題',
    slug: previewData.meta?.slug || previewData.slug || '',
    excerpt: previewData.excerpt || '',
    body: previewData.body || [],
    featured_image: featuredImage,
    category: category,
    investment_type: investmentType,
    tags: tags,
    view_count: previewData.view_count || 0,
    first_published_at: previewData.meta?.first_published_at || previewData.first_published_at || new Date().toISOString(),
    last_published_at: previewData.meta?.last_published_at || previewData.last_published_at,
    published_at: previewData.meta?.first_published_at || previewData.first_published_at || new Date().toISOString(),
    related_tools: previewData.related_tools || [],
    related_posts: previewData.related_posts || [],
    // プレビューフラグ
    _isPreview: true,
  };
}
