// ============================================
// ブログ一覧ページ
// ============================================

import { Metadata } from 'next';
import { BlogFeed } from '@/components/layout/BlogFeed';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// ============================================
// メタデータ
// ============================================

export const metadata: Metadata = {
  title: 'ブログ | ToolRadar',
  description: 'FX・株式・仮想通貨の投資ツール解説、トレード戦略、市場分析など投資に役立つ情報をお届けします。',
  openGraph: {
    title: 'ブログ | ToolRadar',
    description: 'FX・株式・仮想通貨の投資ツール解説、トレード戦略、市場分析など投資に役立つ情報をお届けします。',
    type: 'website',
  },
};

// ============================================
// ページコンポーネント
// ============================================

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold mb-4">
          ブログ
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl">
          投資ツールの使い方、トレード戦略、市場分析など、投資に役立つ情報を発信しています。
        </p>
      </div>

      {/* ブログフィード */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <BlogFeed />
      </Suspense>
    </div>
  );
}
