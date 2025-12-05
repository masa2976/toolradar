import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { RichTextContent } from '@/components/RichTextContent';

// ページ型定義（StandardPageとBasicPage両方に対応）
interface BasePage {
  id: number;
  title: string;
  meta: {
    type: string;
    seo_title: string;
    search_description: string;
    first_published_at: string;
  };
}

interface StandardPage extends BasePage {
  body: string; // RichTextField
}

interface BasicPage extends BasePage {
  body: Array<{
    type: string;
    value: string;
    id: string;
  }>; // StreamField
  show_disclaimer: boolean;
}

interface ContactPage extends BasePage {
  intro: Array<{
    type: string;
    value: string;
    id: string;
  }>; // StreamField
  thank_you_text: Array<{
    type: string;
    value: string;
    id: string;
  }>; // StreamField
  form_fields: Array<{
    id: number;
    label: string;
    field_type: string;
    required: boolean;
    help_text: string;
    choices: string;
    default_value: string;
  }>;
}

type PageData = StandardPage | BasicPage | ContactPage;

interface PageAPIResponse {
  meta: {
    total_count: number;
  };
  items: PageData[];
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * StreamFieldかRichTextFieldかを判定
 */
function isBasicPage(page: PageData): page is BasicPage {
  return Array.isArray((page as BasicPage).body);
}

/**
 * ContactPageかを判定
 */
function isContactPage(page: PageData): page is ContactPage {
  return 'form_fields' in page;
}

/**
 * StreamFieldのbodyをHTMLに変換
 */
function renderStreamFieldBody(body: BasicPage['body']): string {
  return body
    .map((block) => {
      if (block.type === 'rich_text' || block.type === 'raw_html') {
        return block.value;
      }
      return '';
    })
    .join('');
}

/**
 * API取得関数（StandardPage、BasicPage、ContactPageを検索）
 */
async function getPage(slug: string): Promise<PageData | null> {
  const baseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    // まずBasicPage（法的ページ）を検索
    let res = await fetch(`${baseUrl}/api/v2/pages/?slug=${slug}&type=core.basicpage&fields=body,show_disclaimer`, {
      next: { revalidate: 3600 }
    });

    if (res.ok) {
      const data: PageAPIResponse = await res.json();
      if (data.items && data.items.length > 0) {
        return data.items[0];
      }
    }

    // ContactPageを検索
    res = await fetch(`${baseUrl}/api/v2/pages/?slug=${slug}&type=core.contactpage&fields=intro,thank_you_text,form_fields`, {
      next: { revalidate: 3600 }
    });

    if (res.ok) {
      const data: PageAPIResponse = await res.json();
      if (data.items && data.items.length > 0) {
        return data.items[0];
      }
    }

    // StandardPageを検索
    res = await fetch(`${baseUrl}/api/v2/pages/?slug=${slug}&type=blog.standardpage&fields=body`, {
      next: { revalidate: 3600 }
    });

    if (res.ok) {
      const data: PageAPIResponse = await res.json();
      if (data.items && data.items.length > 0) {
        return data.items[0];
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch page:', error);
    return null;
  }
}

/**
 * メタデータ生成
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    return {
      title: 'Page Not Found | ToolRadar',
    };
  }

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
export default async function PageView({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  // bodyのHTML取得（各ページタイプに対応）
  let bodyHtml = '';
  
  if (isContactPage(page)) {
    // ContactPageの場合、intro（StreamField）をHTML化
    bodyHtml = renderStreamFieldBody(page.intro);
  } else if (isBasicPage(page)) {
    // BasicPageの場合、StreamFieldをHTML化
    bodyHtml = renderStreamFieldBody(page.body);
  } else {
    // StandardPageの場合、bodyをそのまま使用
    bodyHtml = (page as StandardPage).body;
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
    <div className="flex min-h-screen flex-col" suppressHydrationWarning>
      {/* ヘッダー */}
      <Header />

      {/* メインコンテンツ */}
      <main className="flex-1">
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

        {/* 本文 */}
        <RichTextContent
          html={bodyHtml}
          className="prose prose-lg max-w-none
                     prose-headings:font-bold
                     prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-l-4 prose-h2:border-blue-600 prose-h2:pl-4 prose-h2:text-gray-900
                     prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-gray-800
                     prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                     prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
                     prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4
                     prose-li:text-gray-700 prose-li:mb-2 prose-li:leading-relaxed
                     prose-a:text-blue-600 prose-a:underline prose-a:cursor-pointer hover:prose-a:text-blue-800
                     prose-strong:font-semibold prose-strong:text-gray-900
                     [&_h2]:text-2xl [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:font-bold [&_h2]:border-l-4 [&_h2]:border-blue-600 [&_h2]:pl-4 [&_h2]:text-gray-900
                     [&_h3]:text-xl [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:font-bold [&_h3]:text-gray-800
                     [&_p]:text-gray-700 [&_p]:leading-relaxed [&_p]:mb-4
                     [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4
                     [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
                     [&_li]:text-gray-700 [&_li]:mb-2 [&_li]:leading-relaxed
                     [&_a]:text-blue-600 [&_a]:underline [&_a]:cursor-pointer hover:[&_a]:text-blue-800
                     [&_strong]:font-semibold [&_strong]:text-gray-900"
        />

        {/* 免責事項（BasicPageのみ） */}
        {isBasicPage(page) && page.show_disclaimer && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ 免責事項:</strong> 投資は元本保証がございません。リスクを理解した上でご利用ください。
            </p>
          </div>
        )}

        {/* お問い合わせフォーム（ContactPageのみ） */}
        {isContactPage(page) && (
          <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-600 mb-4">
              現在、お問い合わせフォームは準備中です。
            </p>
            <p className="text-sm text-gray-500">
              お急ぎの方は、Twitter（X）のDMまたはメールにてお問い合わせください。
            </p>
          </div>
        )}

        {/* 更新日時 */}
        {page.meta.first_published_at && (
          <div className="mt-12 pt-6 border-t text-sm text-gray-500">
            最終更新日: {new Date(page.meta.first_published_at).toLocaleDateString('ja-JP')}
          </div>
        )}
        </article>
      </main>

      {/* フッター */}
      <Footer />
    </div>
  );
}

/**
 * 静的パス生成（本番用）
 */
export async function generateStaticParams() {
  return [
    { slug: 'privacy' },
    { slug: 'terms' },
    { slug: 'disclaimer' },
    { slug: 'about' },
    { slug: 'contact' },
  ];
}
