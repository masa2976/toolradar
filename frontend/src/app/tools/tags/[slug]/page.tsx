import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { normalizePlatforms } from '@/lib/utils';

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  tool_count: number;
  post_count: number;
}

interface Tool {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  platform: string[];
  tool_type: string;
  price_type: string;
  image_url?: string;
  week_score?: number;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  published_date: string;
  featured_image?: string;
}

// 主要タグを事前生成（10件以上のコンテンツがあるタグ）
export async function generateStaticParams() {
  try {
    const apiUrl = process.env.API_URL || 'http://backend:8000';
    const res = await fetch(`${apiUrl}/api/tags/`, {
      next: { revalidate: 3600 } // 1時間ごとに再検証
    });
    
    if (!res.ok) {
      console.error('Failed to fetch tags for static params');
      return [];
    }
    
    const data = await res.json();
    // APIレスポンスが {results: Tag[]} 形式か Tag[] 形式かを確認
    const tags: Tag[] = Array.isArray(data) ? data : (data.results || []);
    
    // 10件以上のコンテンツがあるタグのみ事前生成
    return tags
      .filter(tag => (tag.tool_count + tag.post_count) >= 10)
      .map(tag => ({
        slug: tag.slug
      }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// メタデータ生成
export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const apiUrl = process.env.API_URL || 'http://backend:8000';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolradar.jp';
  
  try {
    const res = await fetch(`${apiUrl}/api/tags/${slug}/`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      return {
        title: 'タグが見つかりません | ToolRadar',
      };
    }
    
    const tag: Tag = await res.json();
    const contentCount = tag.tool_count + tag.post_count;
    
    return {
      title: `${tag.name}の投資ツール・記事一覧（${contentCount}件） | ToolRadar`,
      description: tag.description || `${tag.name}に関連する投資ツール（${tag.tool_count}件）と記事（${tag.post_count}件）をご紹介。MT4/MT5のEA、インジケーター、トレード戦略など。`,
      robots: contentCount >= 10 ? 'index,follow' : 'noindex,follow',
      alternates: {
        canonical: `${siteUrl}/tools/tags/${slug}`
      },
      openGraph: {
        title: `${tag.name}の投資ツール・記事一覧 | ToolRadar`,
        description: tag.description || `${tag.name}に関連する投資ツールと記事`,
        url: `${siteUrl}/tools/tags/${slug}`,
        siteName: 'ToolRadar',
        locale: 'ja_JP',
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: `${tag.name}の投資ツール・記事 | ToolRadar`,
        description: tag.description || `${tag.name}に関連する投資ツールと記事`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'タグが見つかりません | ToolRadar',
    };
  }
}

// タグページコンポーネント
export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const apiUrl = process.env.API_URL || 'http://backend:8000';
  
  try {
    // タグ、ツール、記事を並列取得（ISR: 60秒）
    const [tagRes, toolsRes, postsRes] = await Promise.all([
      fetch(`${apiUrl}/api/tags/${slug}/`, { 
        next: { revalidate: 60 } 
      }),
      fetch(`${apiUrl}/api/tools/?tags=${slug}`, { 
        next: { revalidate: 60 } 
      }),
      fetch(`${apiUrl}/api/blog/posts/?tags=${slug}`, { 
        next: { revalidate: 60 } 
      })
    ]);
    
    if (!tagRes.ok) {
      notFound();
    }
    
    const tag: Tag = await tagRes.json();
    const toolsData = toolsRes.ok ? await toolsRes.json() : { results: [] };
    const postsData = postsRes.ok ? await postsRes.json() : { results: [] };
    
    const tools: Tool[] = toolsData.results || toolsData;
    const posts: BlogPost[] = postsData.results || postsData;
    
    const contentCount = tag.tool_count + tag.post_count;
    
    // 構造化データ（BreadcrumbList）
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'ホーム',
          item: process.env.NEXT_PUBLIC_SITE_URL || 'https://toolradar.jp'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'タグ',
          item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://toolradar.jp'}/tags`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: tag.name,
          item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://toolradar.jp'}/tools/tags/${slug}`
        }
      ]
    };
    
    return (
      <div className="container mx-auto px-4 py-8">
        {/* 構造化データ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        
        {/* パンくずリスト */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-foreground">
                ホーム
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/tools/tags" className="hover:text-foreground">
                タグ
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">{tag.name}</li>
          </ol>
        </nav>
        
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{tag.name}</h1>
          {tag.description && (
            <p className="text-muted-foreground mb-4">{tag.description}</p>
          )}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>ツール: {tag.tool_count}件</span>
            <span>記事: {tag.post_count}件</span>
            <span>合計: {contentCount}件</span>
          </div>
        </div>
        
        {/* タブUI */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">
              すべて ({contentCount})
            </TabsTrigger>
            <TabsTrigger value="tools">
              ツール ({tag.tool_count})
            </TabsTrigger>
            <TabsTrigger value="posts">
              記事 ({tag.post_count})
            </TabsTrigger>
          </TabsList>
          
          {/* すべて */}
          <TabsContent value="all" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* ツール */}
              {tools.map(tool => (
                <Card key={tool.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          <Link 
                            href={`/tools/${tool.slug}`}
                            className="hover:text-primary"
                          >
                            {tool.name}
                          </Link>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {tool.short_description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">{tool.tool_type}</Badge>
                      {normalizePlatforms(tool.platform).map(p => (
                        <Badge key={p} variant="outline">{p}</Badge>
                      ))}
                      <Badge variant="default">{tool.price_type}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* 記事 */}
              {posts.map(post => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          <Link 
                            href={`/blog/${post.slug}`}
                            className="hover:text-primary"
                          >
                            {post.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {post.excerpt}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">{post.category}</Badge>
                      <Badge variant="outline">
                        {new Date(post.published_date).toLocaleDateString('ja-JP')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {contentCount === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>このタグに関連するコンテンツはまだありません。</p>
              </div>
            )}
          </TabsContent>
          
          {/* ツールのみ */}
          <TabsContent value="tools" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {tools.map(tool => (
                <Card key={tool.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          <Link 
                            href={`/tools/${tool.slug}`}
                            className="hover:text-primary"
                          >
                            {tool.name}
                          </Link>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {tool.short_description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">{tool.tool_type}</Badge>
                      {normalizePlatforms(tool.platform).map(p => (
                        <Badge key={p} variant="outline">{p}</Badge>
                      ))}
                      <Badge variant="default">{tool.price_type}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {tools.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>このタグに関連するツールはまだありません。</p>
              </div>
            )}
          </TabsContent>
          
          {/* 記事のみ */}
          <TabsContent value="posts" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {posts.map(post => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          <Link 
                            href={`/blog/${post.slug}`}
                            className="hover:text-primary"
                          >
                            {post.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {post.excerpt}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">{post.category}</Badge>
                      <Badge variant="outline">
                        {new Date(post.published_date).toLocaleDateString('ja-JP')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {posts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>このタグに関連する記事はまだありません。</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (error) {
    console.error('Error fetching tag page data:', error);
    notFound();
  }
}
