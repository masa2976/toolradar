// ============================================
// ブログ記事詳細ページ（Draft Mode対応）
// ============================================

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import { Badge } from '@/components/ui/badge';
import { Calendar, Eye, Clock, AlertCircle, X } from 'lucide-react';
import Link from 'next/link';
import { StreamFieldRenderer } from '@/components/blog/StreamFieldRenderer';
import { calculateReadingTime } from '@/lib/readingTime';


// ============================================
// メタデータ生成
// ============================================

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // TODO: APIから記事情報を取得してメタデータ生成
  // 現時点では静的なメタデータを返す
  return {
    title: `記事 | ToolRadar`,
    description: '投資ツール・トレード戦略の解説記事',
  };
}

// ============================================
// ページコンポーネント
// ============================================

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const { isEnabled } = await draftMode();
  
  // URLエンコードされたslugをデコード
  const decodedSlug = decodeURIComponent(slug);
  
  // APIからデータ取得
  // サーバーサイド: Docker内部通信用URL（backend:8000）
  // クライアントサイド: 外部アクセス用URL（localhost:8000）
  const apiUrl = process.env.API_URL || 'http://backend:8000';
  
  try {
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
    
    const post = await response.json();
    
    return (
      <article className="container mx-auto px-4 py-6 max-w-4xl blog-content">
        {/* Draft Modeインジケーター */}
        {isEnabled && <DraftModeIndicator />}
        
        {/* 記事ヘッダー */}
        <BlogPostHeader post={post} />

        {/* 記事本文 */}
        <BlogPostContent post={post} />

        {/* 関連ツール */}
        <RelatedTools tools={post.related_tools || []} />
      </article>
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
  return (
    <div className="prose prose-lg max-w-none mb-8">
      {/* アイキャッチ画像 */}
      {post.featured_image && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img 
            src={post.featured_image.url || post.featured_image} 
            alt={post.featured_image.alt || post.title}
            className="w-full h-auto"
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
            <StreamFieldRenderer blocks={post.body} />
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
