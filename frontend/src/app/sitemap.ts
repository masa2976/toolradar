import type { MetadataRoute } from 'next'

// ============================================
// 動的サイトマップ生成
// Phase SEO-3: sitemap.xml自動生成
// ============================================

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolradar.jp'
const apiUrl = process.env.API_URL || 'http://backend:8000'

/**
 * ツールAPIレスポンスの型定義
 */
interface ToolApiItem {
  slug: string
  updated_at?: string
  created_at?: string
}

/**
 * ブログAPIレスポンスの型定義
 */
interface BlogApiItem {
  slug: string
  updated_at?: string
  published_at?: string
}

/**
 * ツール一覧のサイトマップエントリを取得
 * 
 * @returns ツールページのサイトマップエントリ配列
 */
async function getToolSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    // 全ツールを取得（limit=1000で十分な件数をカバー）
    const response = await fetch(`${apiUrl}/api/tools/?limit=1000`, {
      next: { revalidate: 3600 }, // 1時間キャッシュ
    })

    if (!response.ok) {
      console.error(`[sitemap] Failed to fetch tools: ${response.status}`)
      return []
    }

    const data = await response.json()
    const tools: ToolApiItem[] = data.results || []

    return tools.map((tool) => ({
      url: `${siteUrl}/tools/${tool.slug}`,
      // SEO: 最終更新日を優先（updated_at → created_at → 現在日時）
      lastModified: new Date(tool.updated_at || tool.created_at || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('[sitemap] Error fetching tools:', error)
    return []
  }
}

/**
 * ブログ記事一覧のサイトマップエントリを取得
 * 
 * @returns ブログページのサイトマップエントリ配列
 */
async function getBlogSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    // 全ブログ記事を取得（limit=1000で十分な件数をカバー）
    const response = await fetch(`${apiUrl}/api/blog/posts/?limit=1000`, {
      next: { revalidate: 3600 }, // 1時間キャッシュ
    })

    if (!response.ok) {
      console.error(`[sitemap] Failed to fetch blog posts: ${response.status}`)
      return []
    }

    const data = await response.json()
    const posts: BlogApiItem[] = data.results || []

    return posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      // SEO: 最終更新日を優先（updated_at → published_at → 現在日時）
      lastModified: new Date(post.updated_at || post.published_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch (error) {
    console.error('[sitemap] Error fetching blog posts:', error)
    return []
  }
}

/**
 * サイトマップ生成
 * 
 * Next.js App Routerの組み込み機能を使用して動的サイトマップを生成
 * アクセス: /sitemap.xml
 * 
 * 構成:
 * - 静的ページ（ホーム、ツール一覧、ブログ一覧、週間ランキング）
 * - 動的ページ（各ツール詳細、各ブログ記事）
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/ranking/weekly`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // カテゴリ別ランキングページ（SEO用）
  // MT5を優先表示
  const platforms = ['mt5', 'mt4', 'tradingview'] as const
  
  // プラットフォームごとの有効なツールタイプ
  // MT4/MT5: EA, Indicator, Script, Library（MQL5公式サイトより）
  // TradingView: Indicator, Strategy, Library（Pine Script公式ドキュメントより）
  const toolTypesByPlatform: Record<string, readonly string[]> = {
    mt4: ['ea', 'indicator', 'script', 'library'],
    mt5: ['ea', 'indicator', 'script', 'library'],
    tradingview: ['indicator', 'strategy', 'library'],
  }
  
  const rankingPages: MetadataRoute.Sitemap = []
  
  for (const platform of platforms) {
    // プラットフォーム別ランキング
    rankingPages.push({
      url: `${siteUrl}/ranking/weekly/${platform}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })
    
    // プラットフォーム + ツールタイプ別ランキング（有効な組み合わせのみ）
    const validToolTypes = toolTypesByPlatform[platform]
    for (const toolType of validToolTypes) {
      rankingPages.push({
        url: `${siteUrl}/ranking/weekly/${platform}/${toolType}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }
  }

  // 動的ページを並列取得（パフォーマンス最適化）
  const [toolPages, blogPages] = await Promise.all([
    getToolSitemapEntries(),
    getBlogSitemapEntries(),
  ])

  console.log(`[sitemap] Generated: ${staticPages.length} static + ${rankingPages.length} ranking + ${toolPages.length} tools + ${blogPages.length} blog posts`)

  // 全ページを統合して返却
  return [...staticPages, ...rankingPages, ...toolPages, ...blogPages]
}
