'use client';

import { useTools, useWeeklyRanking } from '@/hooks';
import { ToolCard } from '@/components/ui/ToolCard';
import { RankingList } from '@/components/ui/RankingList';
import { BlogCard } from '@/components/ui/BlogCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterPanel } from '@/components/ui/FilterPanel';
import { BlogPost } from '@/types';
import { useState } from 'react';

export default function ComponentsTestPage() {
  // ツールデータ取得
  const { data, isPending, error } = useTools();
  
  // ランキングデータ取得
  const { data: rankingData, isPending: rankingPending, error: rankingError } = useWeeklyRanking();

  // SearchBar用のステート
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // BlogCard用のモックデータ
  const mockBlogPosts: BlogPost[] = [
    {
      id: 1,
      title: '【初心者向け】FXトレードの始め方完全ガイド2025',
      slug: 'fx-beginners-guide-2025',
      excerpt: 'FX取引を始めたい方へ、口座開設から最初のトレードまでを詳しく解説。リスク管理の基本も網羅した決定版ガイドです。',
      category: 'beginner_guide',
      investment_type: 'forex',
      featured_image: '/placeholder-blog.png',
      published_at: '2025-01-15T10:00:00Z',
      view_count: 12500,
      author: {
        name: '投資アドバイザー 山田太郎'
      },
      tags: ['FX', '初心者', 'リスク管理']
    },
    {
      id: 2,
      title: '【徹底レビュー】Grid Master EAの実績を検証してみた',
      slug: 'grid-master-ea-review',
      excerpt: '話題のGrid Master EAを3ヶ月間実運用。バックテストと実際の成績を比較し、メリット・デメリットを正直にレビューします。',
      category: 'tool_review',
      investment_type: 'forex',
      featured_image: '/placeholder-blog.png',
      published_at: '2025-01-20T14:30:00Z',
      view_count: 8450,
      author: {
        name: 'EA検証チーム'
      },
      tags: ['EA', 'Grid Master', 'レビュー', 'バックテスト']
    },
    {
      id: 3,
      title: 'ビットコイン急騰の理由と今後の展望【2025年1月最新分析】',
      slug: 'bitcoin-analysis-jan-2025',
      excerpt: 'ビットコインが90,000ドル突破。ETF承認の影響や機関投資家の動向を踏まえ、テクニカル・ファンダメンタル両面から分析します。',
      category: 'market_analysis',
      investment_type: 'crypto',
      featured_image: '/placeholder-blog.png',
      published_at: '2025-01-22T09:00:00Z',
      view_count: 15600,
      author: {
        name: '暗号資産アナリスト 佐藤花子'
      },
      tags: ['ビットコイン', '仮想通貨', 'テクニカル分析']
    },
    {
      id: 4,
      title: 'MT5で使える無料RSIインジケーターTOP10【2025年版】',
      slug: 'mt5-free-rsi-indicators-2025',
      excerpt: 'MT5対応の無料RSIインジケーターを厳選。ダイバージェンス検出、マルチタイムフレーム対応など、実用的な機能を比較します。',
      category: 'ranking_report',
      investment_type: 'general',
      featured_image: '/placeholder-blog.png',
      published_at: '2025-01-18T16:00:00Z',
      view_count: 9800,
      tags: ['MT5', 'RSI', 'インジケーター', '無料']
    }
  ];

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <p className="text-destructive font-semibold mb-2">エラーが発生しました</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const tools = data?.results || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">UIコンポーネントテスト</h1>
        <p className="text-muted-foreground">
          shadcn/ui + Tailwind CSS 4を使用したToolCard・RankingListコンポーネントの動作確認
        </p>
      </div>

      {/* 統計 */}
      <div className="mb-8 p-4 bg-muted rounded-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">総ツール数</p>
            <p className="text-2xl font-bold">{data?.count || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">表示件数</p>
            <p className="text-2xl font-bold">{tools.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">コンポーネント</p>
            <p className="text-2xl font-bold">5種類</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ステータス</p>
            <p className="text-2xl font-bold text-green-600">✓ OK</p>
          </div>
        </div>
      </div>

      {/* Detailed バリアント */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Detailed バリアント（デフォルト）</h2>
        <p className="text-muted-foreground mb-6">
          詳細情報を含む完全版のカード表示。一覧ページで使用。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <ToolCard 
              key={tool.id} 
              tool={tool} 
              variant="detailed"
              onClick={() => console.log('Clicked:', tool.name)}
            />
          ))}
        </div>
      </section>

      {/* Compact バリアント */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Compact バリアント</h2>
        <p className="text-muted-foreground mb-6">
          コンパクトな表示。サイドバーやランキング表示で使用。
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <ToolCard 
              key={tool.id} 
              tool={tool} 
              variant="compact"
              showRibbon={false}
              onClick={() => console.log('Clicked:', tool.name)}
            />
          ))}
        </div>
      </section>

      {/* インタラクション確認 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">インタラクション確認</h2>
        <p className="text-muted-foreground mb-6">
          ホバー効果、クリックイベントなどの動作確認
        </p>
        <div className="bg-muted p-6 rounded-lg">
          <ul className="space-y-2 text-sm">
            <li>✓ ホバー時に影が表示される</li>
            <li>✓ ホバー時にカードが少し浮き上がる</li>
            <li>✓ ホバー時に画像が拡大される</li>
            <li>✓ ホバー時にタイトルの色が変わる</li>
            <li>✓ クリック時にコンソールにログが出力される（開発者ツールで確認）</li>
          </ul>
        </div>
      </section>

      {/* RankingList コンポーネント */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">RankingList コンポーネント</h2>
        <p className="text-muted-foreground mb-6">
          週間ランキング表示コンポーネント。順位変動の視覚化、スコア表示。
        </p>

        {rankingPending ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">ランキング読み込み中...</p>
          </div>
        ) : rankingError ? (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <p className="text-destructive">ランキングエラー: {rankingError.message}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Detailed バリアント */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Detailed バリアント（デフォルト）</h3>
              <p className="text-sm text-muted-foreground mb-4">
                詳細情報を含む完全版。週間PV、シェア数、スコアを表示。
              </p>
              <RankingList 
                rankings={rankingData?.rankings || []}
                variant="detailed"
                showScore={true}
              />
            </div>

            {/* Compact バリアント */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Compact バリアント</h3>
              <p className="text-sm text-muted-foreground mb-4">
                コンパクト表示。統計情報は非表示。サイドバー用。
              </p>
              <RankingList 
                rankings={rankingData?.rankings || []}
                variant="compact"
                limit={5}
              />
            </div>

            {/* TOP3のみ表示 */}
            <div>
              <h3 className="text-xl font-semibold mb-4">TOP3のみ表示（limit使用）</h3>
              <p className="text-sm text-muted-foreground mb-4">
                1-3位は特別なグラデーションバッジで表示。
              </p>
              <RankingList 
                rankings={rankingData?.rankings || []}
                variant="detailed"
                limit={3}
              />
            </div>
          </div>
        )}
      </section>

      {/* BlogCard コンポーネント */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">BlogCard コンポーネント</h2>
        <p className="text-muted-foreground mb-6">
          ブログ記事カード。Vertical/Horizontal バリアント対応、カテゴリ・投資タイプ別の色分け。
        </p>

        <div className="space-y-8">
          {/* Vertical バリアント */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Vertical バリアント</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockBlogPosts.slice(0, 3).map((post) => (
                <BlogCard
                  key={post.slug}
                  post={post}
                  variant="vertical"
                  showExcerpt={true}
                  showImage={true}
                  showAuthor={true}
                  onClick={() => console.log('Clicked:', post.slug)}
                />
              ))}
            </div>
          </div>

          {/* Horizontal バリアント */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Horizontal バリアント</h3>
            <div className="space-y-4">
              {mockBlogPosts.slice(0, 2).map((post) => (
                <BlogCard
                  key={post.slug}
                  post={post}
                  variant="horizontal"
                  showExcerpt={true}
                  showImage={true}
                  onClick={() => console.log('Clicked:', post.slug)}
                />
              ))}
            </div>
          </div>

          {/* Compact バリアント（画像なし） */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Compact バリアント（画像なし）</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockBlogPosts.slice(0, 4).map((post) => (
                <BlogCard
                  key={post.slug}
                  post={post}
                  variant="vertical"
                  showImage={false}
                  showExcerpt={false}
                  onClick={() => console.log('Clicked:', post.slug)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SearchBar コンポーネント */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">SearchBar コンポーネント</h2>
        <p className="text-muted-foreground mb-6">
          リアルタイム検索バー。デバウンス処理（300ms）、クリアボタン、キーボードショートカット（Ctrl+K / Cmd+K）対応。
        </p>

        <div className="space-y-8">
          {/* 基本的な使い方 */}
          <div>
            <h3 className="text-xl font-semibold mb-4">基本的な使い方</h3>
            <SearchBar 
              onSearch={(query) => console.log('Search:', query)}
              placeholder="ツールを検索..."
            />
          </div>

          {/* ローディング状態 */}
          <div>
            <h3 className="text-xl font-semibold mb-4">ローディング状態</h3>
            <SearchBar 
              onSearch={(query) => console.log('Search with loading:', query)}
              isLoading={true}
              placeholder="ツールを検索..."
            />
          </div>

          {/* カスタムプレースホルダー */}
          <div>
            <h3 className="text-xl font-semibold mb-4">カスタムプレースホルダー</h3>
            <SearchBar 
              onSearch={(query) => console.log('Search with custom placeholder:', query)}
              placeholder="EA、インジケーター、ストラテジーを検索..."
              debounceMs={500}
            />
          </div>

          {/* 幅指定 */}
          <div>
            <h3 className="text-xl font-semibold mb-4">幅指定（max-w-md）</h3>
            <SearchBar 
              onSearch={(query) => console.log('Search with custom width:', query)}
              placeholder="ツールを検索..."
              className="max-w-md"
            />
          </div>
        </div>
      </section>

      {/* FilterPanel コンポーネント */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">FilterPanel コンポーネント</h2>
        <p className="text-muted-foreground mb-6">
          多機能フィルターパネル。Accordion形式、複数条件フィルター、リセット機能対応。
        </p>

        <div className="space-y-8">
          {/* 基本的な使い方 */}
          <div>
            <h3 className="text-xl font-semibold mb-4">基本的な使い方</h3>
            <FilterPanel 
              onFilterChange={(filters) => console.log('Filter changed:', filters)}
            />
          </div>

          {/* 幅制限 */}
          <div>
            <h3 className="text-xl font-semibold mb-4">幅制限（max-w-sm）</h3>
            <FilterPanel 
              onFilterChange={(filters) => console.log('Filter changed (narrow):', filters)}
              className="max-w-sm"
            />
          </div>

          {/* 使い方ガイド */}
          <div className="bg-muted p-6 rounded-lg">
            <h4 className="font-semibold mb-3">機能テスト項目</h4>
            <ul className="space-y-2 text-sm">
              <li>✓ プラットフォームフィルター（チェックボックス・複数選択可能）</li>
              <li>✓ ツールタイプフィルター（チェックボックス・複数選択可能）</li>
              <li>✓ 価格タイプフィルター（ラジオボタン・単一選択）</li>
              <li>✓ タグフィルター（バッジ形式・クリックでトグル）</li>
              <li>✓ クリアボタン（全フィルターリセット）</li>
              <li>✓ Accordion形式（折りたたみ可能）</li>
              <li>✓ 初期状態は全セクション展開</li>
              <li>✓ フィルター変更時にコンソールにログ出力</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 実装済み機能サマリー */}
      <section>
        <h2 className="text-2xl font-bold mb-4">実装済み機能サマリー</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* ToolCard */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-primary">ToolCard</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ サムネイル画像</li>
              <li>✓ プラットフォームバッジ</li>
              <li>✓ ツールタイプ</li>
              <li>✓ 価格表示</li>
              <li>✓ リボン（NEW/人気/注目）</li>
              <li>✓ タグ（最大5個）</li>
              <li>✓ 2バリアント対応</li>
            </ul>
          </div>

          {/* RankingList */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-primary">RankingList</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ 順位バッジ（1-3位特別色）</li>
              <li>✓ 順位変動表示</li>
              <li>✓ 週間PV・シェア数</li>
              <li>✓ スコア表示</li>
              <li>✓ グラデーションバッジ</li>
              <li>✓ 件数制限機能</li>
              <li>✓ 2バリアント対応</li>
            </ul>
          </div>

          {/* BlogCard */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-primary">BlogCard</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ アイキャッチ画像（16:9）</li>
              <li>✓ カテゴリバッジ</li>
              <li>✓ 投資タイプバッジ</li>
              <li>✓ 公開日・閲覧数</li>
              <li>✓ 著者情報</li>
              <li>✓ タグ（最大2個）</li>
              <li>✓ 2バリアント対応</li>
            </ul>
          </div>

          {/* SearchBar */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-primary">SearchBar</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ リアルタイム検索</li>
              <li>✓ デバウンス処理</li>
              <li>✓ 検索アイコン</li>
              <li>✓ クリアボタン</li>
              <li>✓ ローディング表示</li>
              <li>✓ キーボードショートカット</li>
              <li>✓ フォーカス管理</li>
            </ul>
          </div>

          {/* FilterPanel */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-primary">FilterPanel</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ プラットフォームフィルター</li>
              <li>✓ ツールタイプフィルター</li>
              <li>✓ 価格タイプフィルター</li>
              <li>✓ タグフィルター（バッジ）</li>
              <li>✓ クリアボタン</li>
              <li>✓ Accordion形式</li>
              <li>✓ 複数条件対応</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
