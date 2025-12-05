import { Metadata } from 'next';
import { ContactFormWrapper } from '@/components/contact/ContactFormWrapper';
import { Header, Footer } from '@/components/layout';
import type { ContactFormField } from '@/types';

export const metadata: Metadata = {
  title: 'お問い合わせ | ToolRadar',
  description: 'ToolRadarへのお問い合わせフォーム。ご質問やご要望がございましたらお気軽にお問い合わせください。',
};

// Wagtail APIからContactPageデータを取得
async function getContactPageData() {
  const baseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  try {
    const res = await fetch(
      `${baseUrl}/api/v2/pages/?slug=contact&type=core.contactpage&fields=intro,thank_you_text,form_fields`,
      { next: { revalidate: 3600 } }
    );
    
    if (res.ok) {
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        return data.items[0];
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch contact page:', error);
    return null;
  }
}

export default async function ContactPage() {
  // Wagtail APIからお問い合わせページのデータを取得
  const pageData = await getContactPageData();
  
  // introのStreamFieldをHTMLに変換
  const introHtml = pageData?.intro
    ? pageData.intro
        .map((block: { type: string; value: string }) => {
          if (block.type === 'rich_text' || block.type === 'raw_html') {
            return block.value;
          }
          return '';
        })
        .join('')
    : '';

  // thank_you_textのStreamFieldをHTMLに変換
  const thankYouHtml = pageData?.thank_you_text
    ? pageData.thank_you_text
        .map((block: { type: string; value: string }) => {
          if (block.type === 'rich_text' || block.type === 'raw_html') {
            return block.value;
          }
          return '';
        })
        .join('')
    : '';

  // フォームフィールド
  const formFields: ContactFormField[] = pageData?.form_fields || [];

  return (
    <div className="flex min-h-screen flex-col">
      {/* ヘッダー */}
      <Header />

      {/* メインコンテンツ */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="space-y-6">
            {/* ページヘッダー */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {pageData?.title || 'お問い合わせ'}
              </h1>
            </div>

            {/* Wagtail CMSからのintro（説明文） */}
            {introHtml && (
              <div 
                className="prose prose-sm max-w-none
                  prose-headings:font-bold
                  prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
                  prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-3
                  prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-3
                  prose-li:text-gray-700 prose-li:mb-1
                  prose-a:text-blue-600 prose-a:underline
                  [&_small]:text-sm [&_small]:text-gray-500"
                dangerouslySetInnerHTML={{ __html: introHtml }}
              />
            )}

            {/* お問い合わせフォーム */}
            <div className="mt-8">
              <ContactFormWrapper 
                formFields={formFields}
                thankYouHtml={thankYouHtml}
              />
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <Footer />
    </div>
  );
}
