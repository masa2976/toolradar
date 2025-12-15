import { notFound } from 'next/navigation'
import Image from 'next/image'
import { placeholderDataUrl } from '@/lib/imageUtils'
import Link from 'next/link'
import { toolsApi } from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ExternalLink, 
  TrendingUp, 
  Eye, 
  Share2,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { ASPAdSpace } from '@/components/ui/ASPAdSpace'
import { AdSense } from '@/components/ui/AdSense'
import { RelatedTools } from '@/components/ui/RelatedTools'
import { ToolEventTracker } from '@/components/features/ToolEventTracker'
import { ShareButtons } from '@/components/features/ShareButtons'
import { CTAButton } from '@/components/features/CTAButton'

// ============================================
// データ取得関数（共通化）
// ============================================

async function getTool(slug: string) {
  try {
    return await toolsApi.getToolBySlug(slug)
  } catch (error) {
    return null  // エラーの場合はnullを返す
  }
}

// ============================================
// ツール詳細ページ
// ============================================

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function ToolDetailPage({ params }: PageProps) {
  // Next.js 15: paramsをawait
  const { slug } = await params
  
  // ツールデータ取得（共通関数を使用）
  const tool = await getTool(slug)
  
  // ツールが見つからない場合は404
  if (!tool) {
    notFound()
  }
  
  // ============================================
  // 構造化データ生成（Phase SEO-2）
  // ============================================
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolradar.jp'
  const apiUrl = process.env.API_URL || 'http://backend:8000'
  const platforms = Array.isArray(tool.platform) ? tool.platform : [tool.platform]
  
  // 画像URLの処理
  const imageUrl = tool.image_url
    ? (tool.image_url.startsWith('http')
        ? tool.image_url
        : `${apiUrl}${tool.image_url}`)
    : `${siteUrl}/default-tool-image.jpg`
  
  // SoftwareApplication構造化データ
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    applicationCategory: 'FinanceApplication',
    applicationSubCategory: 'TradingTool',
    operatingSystem: platforms.map(p => p.toUpperCase()).join(', '),
    description: tool.short_description,
    image: imageUrl,
    url: tool.external_url,
    offers: {
      '@type': 'Offer',
      price: tool.price_type === 'free' ? '0' : (tool.price || '未定'),
      priceCurrency: 'USD',
    },
    ...(tool.week_score && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Math.min((tool.week_score / 50), 5).toFixed(1),
        bestRating: '5',
        ratingCount: tool.stats?.week_views || 0,
      },
    }),
    author: {
      '@type': 'Organization',
      name: tool.metadata?.developer || 'Unknown',
    },
  }
  
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
        name: 'ツール一覧',
        item: `${siteUrl}/tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.name,
        item: `${siteUrl}/tools/${slug}`,
      },
    ],
  }
  
  return (
    <>
      {/* イベントトラッキング（view/duration） */}
      <ToolEventTracker toolId={tool.id} />
      
      {/* 構造化データ（JSON-LD） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8">
      {/* パンくずリスト */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          ホーム
        </Link>
        {' / '}
        <Link href="/tools" className="hover:text-foreground">
          ツール一覧
        </Link>
        {' / '}
        <span className="text-foreground">{tool.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2">
          {/* ツールヘッダー */}
          <div className="mb-8">
            <div className="mb-4 flex flex-wrap gap-2">
              {/* プラットフォームバッジ */}
              {(Array.isArray(tool.platform) ? tool.platform : [tool.platform]).map((p) => (
                <Badge key={p} variant="secondary">
                  {p.toUpperCase()}
                </Badge>
              ))}
              
              {/* リボンバッジ */}
              {tool.ribbons?.map((ribbon) => (
                <Badge 
                  key={ribbon}
                  variant={
                    ribbon === 'new' ? 'destructive' :
                    ribbon === 'popular' ? 'default' :
                    'outline'
                  }
                >
                  {ribbon.toUpperCase()}
                </Badge>
              ))}
            </div>

            <h1 className="mb-4 text-4xl font-bold text-foreground">
              {tool.name}
            </h1>

            <p className="mb-6 text-xl text-muted-foreground">
              {tool.short_description}
            </p>

            {/* タグ */}
            {tool.tags && tool.tags.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* 統計情報 */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-medium">週間{tool.week_rank}位</span>
                {tool.week_rank_change && (
                  <span className="text-muted-foreground">
                    ({tool.week_rank_change})
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span>{tool.week_views} PV</span>
              </div>
              
              {(tool.week_shares ?? 0) > 0 && (
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <span>{tool.week_shares} シェア</span>
                </div>
              )}
            </div>
          </div>

          {/* SNSシェアボタン */}
          <div className="mb-6">
            <ShareButtons 
              toolId={tool.id}
              toolName={tool.name}
              toolSlug={slug}
            />
          </div>

          {/* サムネイル画像 */}
          {tool.image_url && (
            <div className="relative mb-8 aspect-video max-w-2xl mx-auto overflow-hidden rounded-lg border bg-muted">
              <Image
                src={tool.image_url}
                alt={`${tool.name}のスクリーンショット - ${tool.tool_type}ツール`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                className="object-contain"
                priority
                placeholder="blur"
                blurDataURL={placeholderDataUrl}
              />
            </div>
          )}

          {/* 詳細説明 */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>詳細説明</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-gray max-w-none dark:prose-invert whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: tool.long_description ?? '' }}
              />
            </CardContent>
          </Card>

          {/* 技術仕様 */}
          {tool.metadata && Object.keys(tool.metadata).length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>技術仕様</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  {tool.metadata.developer && (
                    <div className="flex border-b pb-3">
                      <dt className="w-1/3 font-medium text-muted-foreground">
                        開発者
                      </dt>
                      <dd className="w-2/3">{tool.metadata.developer}</dd>
                    </div>
                  )}
                  
                  {tool.metadata.version && (
                    <div className="flex border-b pb-3">
                      <dt className="w-1/3 font-medium text-muted-foreground">
                        バージョン
                      </dt>
                      <dd className="w-2/3">{tool.metadata.version}</dd>
                    </div>
                  )}
                  
                  {tool.metadata.last_updated && (
                    <div className="flex border-b pb-3">
                      <dt className="w-1/3 font-medium text-muted-foreground">
                        最終更新
                      </dt>
                      <dd className="w-2/3">{tool.metadata.last_updated}</dd>
                    </div>
                  )}
                  
                  {tool.metadata.requirements && (
                    <div className="flex border-b pb-3">
                      <dt className="w-1/3 font-medium text-muted-foreground">
                        動作環境
                      </dt>
                      <dd className="w-2/3">{tool.metadata.requirements}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          )}

          {/* ========== AdSense広告（ツール詳細中盤） ========== */}
          <AdSense
            adSlot="XXXXXXXXXX"
            adFormat="rectangle"
            placement="tool-detail-middle"
            className="my-8"
          />

          {/* 関連ツールセクション */}
          <RelatedTools toolSlug={slug} />

          {/* ========== ASP広告（ツール詳細下部） ========== */}
          <ASPAdSpace
            placement="tool-detail-bottom"
            className="my-8"
          />
        </div>

        {/* サイドバー */}
        <div className="lg:col-span-1">
          {/* ダウンロード/購入カード */}
          <Card className="sticky top-20 mb-6">
            <CardHeader>
              <CardTitle>入手方法</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 価格 */}
              <div>
                {tool.price_type === 'free' ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    <span className="text-2xl font-bold text-success">
                      無料
                    </span>
                  </div>
                ) : tool.price_type === 'paid' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      有料
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      Freemium
                    </span>
                  </div>
                )}
              </div>

              {/* 外部リンクボタン（クリックトラッキング付き） */}
              <CTAButton
                toolId={tool.id}
                externalUrl={tool.external_url}
                priceType={tool.price_type as 'free' | 'paid' | 'freemium'}
                className="w-full"
              />

              {/* 注意事項 */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                ※掲載情報は変更される場合があります。最新の価格・仕様・動作条件は
                <Link href="/disclaimer" className="underline hover:text-foreground">
                  公式サイト
                </Link>
                でご確認ください。
              </p>
            </CardContent>
          </Card>

          {/* ツール情報カード */}
          <Card>
            <CardHeader>
              <CardTitle>ツール情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">カテゴリ</span>
                <span className="font-medium">{tool.tool_type}</span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">プラットフォーム</span>
                <span className="font-medium">
                  {(Array.isArray(tool.platform) ? tool.platform : [tool.platform]).map(p => p.toUpperCase()).join(', ')}
                </span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">価格タイプ</span>
                <span className="font-medium">
                  {tool.price_type === 'free' ? '無料' :
                   tool.price_type === 'paid' ? '有料' :
                   'Freemium'}
                </span>
              </div>
              
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">登録日</span>
                <span className="font-medium">
                  {new Date(tool.created_at).toLocaleDateString('ja-JP')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">更新日</span>
                <span className="font-medium">
                  {new Date(tool.updated_at).toLocaleDateString('ja-JP')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 情報に関する注記 */}
          <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
            ※掲載情報は{new Date(tool.updated_at).toLocaleDateString('ja-JP')}時点のものです。
            最新情報は提供元サイトでご確認ください。
          </p>
        </div>
      </div>
      </div>
    </>
  )
}

// ============================================
// メタデータ生成（SEO最適化 - Phase SEO-2）
// ============================================

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const apiUrl = process.env.API_URL || 'http://backend:8000'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolradar.jp'
  
  // 共通関数を使用（エラーを投げない）
  const tool = await getTool(slug)
  
  // ツールが見つからない場合は404用メタデータ
  if (!tool) {
    return {
      title: 'ツールが見つかりません | ToolRadar',
      description: '指定されたツールは存在しません。',
    }
  }
  
  // プラットフォーム配列化
  const platforms = Array.isArray(tool.platform) ? tool.platform : [tool.platform]
  
  // 画像URLの処理（相対パスの場合は絶対パスに変換）
  const imageUrl = tool.image_url
    ? (tool.image_url.startsWith('http')
        ? tool.image_url
        : `${apiUrl}${tool.image_url}`)
    : `${siteUrl}/default-tool-image.jpg`
  
  // ページURL
  const pageUrl = `${siteUrl}/tools/${slug}`
  
  // キーワード生成
  const keywords = [
    tool.name,
    ...platforms,
    tool.tool_type,
    ...(tool.tags?.map(tag => tag.name) || []),
  ].join(', ')
  
  // 正常時のメタデータ
  return {
    title: `${tool.name} - ${platforms.join('/')}対応 | ToolRadar`,
    description: tool.short_description,
    keywords: keywords,
    openGraph: {
      title: tool.name,
      description: tool.short_description,
      url: pageUrl,
      siteName: 'ToolRadar',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: tool.name,
        },
      ],
      locale: 'ja_JP',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.name,
      description: tool.short_description,
      images: [imageUrl],
      creator: '@toolradar',
      site: '@toolradar',
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}
