import { notFound } from 'next/navigation'
import Image from 'next/image'
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
  
  return (
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
              {tool.ribbons.map((ribbon) => (
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
            <div className="mb-6 flex flex-wrap gap-2">
              {tool.tags.map((tag) => (
                <Badge key={tag.id} variant="outline">
                  {tag.name}
                </Badge>
              ))}
            </div>

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
              
              {tool.week_shares > 0 && (
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <span>{tool.week_shares} シェア</span>
                </div>
              )}
            </div>
          </div>

          {/* サムネイル画像 */}
          {tool.image_url && (
            <div className="relative mb-8 aspect-video overflow-hidden rounded-lg border">
              <Image
                src={tool.image_url}
                alt={tool.name}
                fill
                className="object-contain"
                priority
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
                className="prose prose-gray max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: tool.long_description }}
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

          {/* AdSense: 詳細ページ上部 */}
          <div className="my-8 flex items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 p-8">
            <div className="text-center text-muted-foreground">
              <p className="font-medium">AdSense広告エリア (detail-top)</p>
              <p className="mt-1 text-sm">728×90 または レスポンシブ</p>
            </div>
          </div>

          {/* 関連ツールセクション（将来実装） */}
          <section className="mb-8 border-t pt-6">
            <h2 className="mb-4 text-2xl font-bold">関連ツール</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* プレースホルダー */}
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="mb-2 h-32 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 animate-pulse rounded bg-gray-200" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* AdSense: 詳細ページ下部 */}
          <div className="my-8 flex items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 p-8">
            <div className="text-center text-muted-foreground">
              <p className="font-medium">AdSense広告エリア (detail-bottom)</p>
              <p className="mt-1 text-sm">728×90 または レスポンシブ</p>
            </div>
          </div>
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
                    <span className="text-3xl font-bold text-foreground">
                      ${tool.price}
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

              {/* 外部リンクボタン */}
              <Button 
                asChild
                className="w-full"
                size="lg"
              >
                <a
                  href={tool.external_url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  ダウンロード/購入
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>

              {/* 注意事項 */}
              <p className="text-xs text-muted-foreground">
                ※外部サイトへ移動します。詳細は提供元サイトでご確認ください。
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
                  {(Array.isArray(tool.platform) ? tool.platform : [tool.platform]).join(', ')}
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
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">登録日</span>
                <span className="font-medium">
                  {new Date(tool.created_at).toLocaleDateString('ja-JP')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ============================================
// メタデータ生成（SEO最適化）
// ============================================

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  
  // 共通関数を使用（エラーを投げない）
  const tool = await getTool(slug)
  
  // ツールが見つからない場合は404用メタデータ
  if (!tool) {
    return {
      title: 'ツールが見つかりません | ToolRadar',
      description: '指定されたツールは存在しません。',
    }
  }
  
  // 正常時のメタデータ
  return {
    title: `${tool.name} - ${(Array.isArray(tool.platform) ? tool.platform : [tool.platform]).join('/')}ツール | ToolRadar`,
    description: tool.short_description,
    openGraph: {
      title: tool.name,
      description: tool.short_description,
      images: tool.image_url ? [tool.image_url] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.name,
      description: tool.short_description,
      images: tool.image_url ? [tool.image_url] : [],
    },
  }
}
