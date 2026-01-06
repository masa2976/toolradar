import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { normalizePlatforms } from '@/lib/utils';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  tool_count: number;
}

interface Tool {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  platform: string;
  tool_type: string;
  price_type: string;
  image_url?: string;
  ribbons?: string[];
}

// カテゴリを事前生成
export async function generateStaticParams() {
  try {
    const apiUrl = process.env.API_URL || 'http://backend:8000';
    const res = await fetch(`${apiUrl}/api/categories/`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      console.error('Failed to fetch categories for static params');
      return [];
    }
    
    const data = await res.json();
    const categories: Category[] = Array.isArray(data) ? data : (data.results || []);
    
    return categories.map(cat => ({
      slug: cat.slug
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// メタデータ生成
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const apiUrl = process.env.API_URL || 'http://backend:8000';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolradar.jp';
  
  try {
    const res = await fetch(`${apiUrl}/api/categories/${slug}/`, {
      next: { revalidate: 60 }
    });
    
    if (!res.ok) {
      return {
        title: 'カテゴリが見つかりません | ToolRadar',
      };
    }
    
    const category: Category = await res.json();
    
    return {
      title: `${category.name}のツール一覧（${category.tool_count}件） | ToolRadar`,
      description: category.description || `${category.name}に関連する投資ツール（${category.tool_count}件）をご紹介。MT4/MT5のEA、インジケーターなど。`,
      alternates: {
        canonical: `${siteUrl}/tools/category/${slug}`
      },
      openGraph: {
        title: `${category.name}のツール一覧 | ToolRadar`,
        description: category.description || `${category.name}に関連する投資ツール`,
        url: `${siteUrl}/tools/category/${slug}`,
        siteName: 'ToolRadar',
        locale: 'ja_JP',
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: `${category.name}のツール | ToolRadar`,
        description: category.description || `${category.name}に関連する投資ツール`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'カテゴリが見つかりません | ToolRadar',
    };
  }
}

// カテゴリページコンポーネント
export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const apiUrl = process.env.API_URL || 'http://backend:8000';
  
  try {
    // カテゴリとツールを並列取得
    const [categoryRes, toolsRes] = await Promise.all([
      fetch(`${apiUrl}/api/categories/${slug}/`, { 
        next: { revalidate: 60 } 
      }),
      fetch(`${apiUrl}/api/tools/?category=${slug}`, { 
        next: { revalidate: 60 } 
      })
    ]);
    
    if (!categoryRes.ok) {
      notFound();
    }
    
    const category: Category = await categoryRes.json();
    const toolsData = toolsRes.ok ? await toolsRes.json() : { results: [] };
    const tools: Tool[] = toolsData.results || toolsData;
    
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
          name: 'ツール',
          item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://toolradar.jp'}/tools`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'カテゴリ',
          item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://toolradar.jp'}/tools/category`
        },
        {
          '@type': 'ListItem',
          position: 4,
          name: category.name,
          item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://toolradar.jp'}/tools/category/${slug}`
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
              <Link href="/tools" className="hover:text-foreground">
                ツール
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/tools/category" className="hover:text-foreground">
                カテゴリ
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">{category.name}</li>
          </ol>
        </nav>
        
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-muted-foreground mb-4">{category.description}</p>
          )}
          <div className="text-sm text-muted-foreground">
            <span>ツール: {category.tool_count}件</span>
          </div>
        </div>
        
        {/* ツール一覧 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                  {tool.ribbons?.map(ribbon => (
                    <Badge key={ribbon} variant="destructive">{ribbon}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {tools.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>このカテゴリに属するツールはまだありません。</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error fetching category page data:', error);
    notFound();
  }
}
