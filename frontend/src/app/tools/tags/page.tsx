import { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  tool_count: number;
  category?: string;
  category_detail?: {
    id: number;
    name: string;
    slug: string;
  };
}

interface TagCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  tag_count: number;
}

interface PageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  // デフォルトのメタデータを先に定義
  const defaultTitle = 'タグ一覧 | ToolRadar';
  const defaultDescription = 'MT4/MT5/TradingView対応の投資ツールをタグ別に検索。RSI、MACD、スキャルピングなど機能やスタイル別にツールを探せます。';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolradar.jp';
  
  try {
    const resolvedParams = await searchParams;
    const categorySlug = resolvedParams?.category;
    
    // カテゴリ名を取得
    let categoryName = '';
    if (categorySlug) {
      const apiUrl = process.env.API_URL || 'http://backend:8000';
      try {
        const res = await fetch(`${apiUrl}/api/tag-categories/`, { 
          next: { revalidate: 3600 },
          signal: AbortSignal.timeout(5000) // 5秒タイムアウト
        });
        if (res.ok) {
          const categories: TagCategory[] = await res.json();
          const found = categories.find(c => c.slug === categorySlug);
          if (found) categoryName = found.name;
        }
      } catch (error) {
        console.error('generateMetadata: Failed to fetch categories:', error);
        // カテゴリ取得失敗時もページは表示する
      }
    }
    
    const title = categoryName ? `${categoryName}のタグ一覧` : 'タグ一覧';
    const description = categoryName 
      ? `${categoryName}に関連するタグでツールを検索。`
      : defaultDescription;
    
    return {
      title: `${title} | ToolRadar`,
      description,
      alternates: {
        canonical: `${siteUrl}/tools/tags${categorySlug ? `?category=${categorySlug}` : ''}`
      },
      openGraph: {
        title: `${title} | ToolRadar`,
        description,
        url: `${siteUrl}/tools/tags`,
        siteName: 'ToolRadar',
        locale: 'ja_JP',
        type: 'website',
      },
    };
  } catch (error) {
    // searchParamsの解決に失敗した場合でもデフォルトメタデータを返す
    console.error('generateMetadata error:', error);
    return {
      title: defaultTitle,
      description: defaultDescription,
      openGraph: {
        title: defaultTitle,
        description: defaultDescription,
        url: `${siteUrl}/tools/tags`,
        siteName: 'ToolRadar',
        locale: 'ja_JP',
        type: 'website',
      },
    };
  }
}

export default async function TagsIndexPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const categorySlug = resolvedParams.category;
  
  const apiUrl = process.env.API_URL || 'http://backend:8000';
  
  let tags: Tag[] = [];
  let categories: TagCategory[] = [];
  let currentCategory: TagCategory | null = null;
  
  try {
    // カテゴリ一覧を取得
    const catRes = await fetch(`${apiUrl}/api/tag-categories/`, {
      next: { revalidate: 3600 }
    });
    if (catRes.ok) {
      categories = await catRes.json();
      if (categorySlug) {
        currentCategory = categories.find(c => c.slug === categorySlug) || null;
      }
    }
    
    // タグ一覧を取得（カテゴリフィルタあり/なし）
    const tagUrl = categorySlug 
      ? `${apiUrl}/api/tags/?tag_category__slug=${categorySlug}`
      : `${apiUrl}/api/tags/`;
    
    const res = await fetch(tagUrl, {
      next: { revalidate: 3600 }
    });
    
    if (res.ok) {
      const data = await res.json();
      tags = Array.isArray(data) ? data : (data.results || []);
    }
  } catch (error) {
    console.error('Error fetching tags:', error);
  }
  
  // カテゴリごとにタグをグルーピング（カテゴリ指定がない場合）
  const groupedTags: Record<string, Tag[]> = {};
  if (!categorySlug) {
    tags.forEach(tag => {
      const catSlug = tag.category_detail?.slug || tag.category || 'other';
      if (!groupedTags[catSlug]) {
        groupedTags[catSlug] = [];
      }
      groupedTags[catSlug].push(tag);
    });
  }
  
  const pageTitle = currentCategory ? `${currentCategory.name}のタグ一覧` : 'タグ一覧';
  
  // 構造化データ（BreadcrumbList）
  const breadcrumbItems = [
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
      name: 'タグ',
      item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://toolradar.jp'}/tools/tags`
    }
  ];
  
  if (currentCategory) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 4,
      name: currentCategory.name,
      item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://toolradar.jp'}/tools/tags?category=${currentCategory.slug}`
    });
  }
  
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems
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
          {currentCategory ? (
            <>
              <li>
                <Link href="/tools/tags" className="hover:text-foreground">
                  タグ
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground font-medium">{currentCategory.name}</li>
            </>
          ) : (
            <li className="text-foreground font-medium">タグ</li>
          )}
        </ol>
      </nav>
      
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{pageTitle}</h1>
        <p className="text-muted-foreground">
          {currentCategory 
            ? `${currentCategory.name}に関連するタグからツールを探せます。`
            : '機能やスタイル別にツールを探せます。タグを選択してください。'
          }
        </p>
      </div>
      
      {/* カテゴリタブ（カテゴリ指定時は「すべて」リンク表示） */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link 
          href="/tools/tags"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !categorySlug 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-muted/80'
          }`}
        >
          すべて
        </Link>
        {categories.map(cat => (
          <Link 
            key={cat.slug}
            href={`/tools/tags?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              categorySlug === cat.slug 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {cat.name} ({cat.tag_count})
          </Link>
        ))}
      </div>
      
      {/* タグ一覧 */}
      {categorySlug ? (
        // カテゴリ指定時：フラットに表示
        <div className="flex flex-wrap gap-3">
          {tags.map(tag => (
            <Link key={tag.id} href={`/tools/tags/${tag.slug}`}>
              <Badge 
                variant="secondary" 
                className="text-base px-4 py-2 hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
              >
                {tag.name}
                <span className="ml-2 text-xs opacity-70">({tag.tool_count})</span>
              </Badge>
            </Link>
          ))}
        </div>
      ) : (
        // カテゴリ未指定時：カテゴリごとにグルーピング
        <div className="space-y-8">
          {categories.map(cat => {
            const catTags = groupedTags[cat.slug] || [];
            if (catTags.length === 0) return null;
            
            return (
              <div key={cat.slug}>
                <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Link 
                    href={`/tools/tags?category=${cat.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                  <span className="text-sm font-normal text-muted-foreground">
                    ({catTags.length})
                  </span>
                </h2>
                <div className="flex flex-wrap gap-3">
                  {catTags.map(tag => (
                    <Link key={tag.id} href={`/tools/tags/${tag.slug}`}>
                      <Badge 
                        variant="secondary" 
                        className="text-base px-4 py-2 hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
                      >
                        {tag.name}
                        <span className="ml-2 text-xs opacity-70">({tag.tool_count})</span>
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {tags.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>タグがまだ登録されていません。</p>
        </div>
      )}
    </div>
  );
}
