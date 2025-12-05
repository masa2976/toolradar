import type { MetadataRoute } from 'next'

// ============================================
// robots.txt 動的生成
// Phase SEO-4: robots.txt自動生成
// ============================================

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://toolradar.jp'

/**
 * robots.txt生成
 * 
 * Next.js App Routerの組み込み機能を使用して動的robots.txtを生成
 * アクセス: /robots.txt
 * 
 * 設定内容:
 * - 管理画面（/admin/, /cms/）をクロール禁止
 * - APIエンドポイント（/api/）をクロール禁止
 * - Next.js内部ファイル（/_next/）をクロール禁止
 * - テストページをクロール禁止
 * - サイトマップへの参照を含む
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',           // Django Admin
          '/cms/',             // Wagtail Admin
          '/api/',             // API endpoints
          '/_next/',           // Next.js internal files
          '/test-api/',        // テストページ
          '/components-test/', // コンポーネントテストページ
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
