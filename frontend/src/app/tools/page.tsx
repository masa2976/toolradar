'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Loader2, Grid3x3, List, SlidersHorizontal, X } from 'lucide-react';
import { useTools } from '@/hooks';
import { ToolCard } from '@/components/ui/ToolCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterPanel, FilterState } from '@/components/ui/FilterPanel';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ToolsParams } from '@/types';

// ============================================
// ツール一覧ページ
// ============================================

export default function ToolsListPage() {
  // フィルター状態管理
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    platforms: [],
    toolTypes: [],
    priceType: undefined,
    tags: [],
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // APIパラメータ構築
  const apiParams: ToolsParams = {
    q: searchQuery || undefined,
    platform: filters.platforms.length > 0 ? filters.platforms.join(',') : undefined,
    tool_type: filters.toolTypes.length > 0 ? filters.toolTypes.join(',') : undefined,
    price_type: filters.priceType || undefined,
    tags: filters.tags.length > 0 ? filters.tags.join(',') : undefined,
  };
  
  // API呼び出し
  const { data, isPending, error } = useTools(apiParams);
  
  // 検索ハンドラー
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  
  // フィルター変更ハンドラー
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);
  
  // アクティブなフィルター数を計算
  const activeFilterCount = 
    filters.platforms.length + 
    filters.toolTypes.length + 
    (filters.priceType ? 1 : 0) + 
    filters.tags.length;
  
  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          {/* パンくずリスト */}
          <nav className="mb-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              ホーム
            </Link>
            {' / '}
            <span className="text-foreground font-medium">ツール一覧</span>
          </nav>
          
          {/* タイトル・説明 */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">
              投資ツール一覧
            </h1>
            <p className="text-muted-foreground">
              MT4/MT5/TradingViewの優良ツールを検索・比較できます
            </p>
          </div>
          
          {/* 検索バー */}
          <div className="max-w-2xl">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="ツール名、タグで検索..."
              isLoading={isPending}
            />
          </div>
        </div>
      </div>
      
      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左サイドバー（デスクトップ） */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20">
              <FilterPanel onFilterChange={handleFilterChange} />
            </div>
          </aside>
          
          {/* メインコンテンツエリア */}
          <main className="lg:col-span-9">
            {/* ツールバー（モバイルフィルター・表示切替・件数） */}
            <div className="flex items-center justify-between mb-6">
              {/* 左側：モバイルフィルター + 件数 */}
              <div className="flex items-center gap-4">
                {/* モバイルフィルター（Sheet） */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="lg:hidden"
                    >
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      フィルター
                      {activeFilterCount > 0 && (
                        <Badge 
                          variant="default" 
                          className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                        >
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>フィルター</SheetTitle>
                    </SheetHeader>
                    <Separator className="my-4" />
                    <FilterPanel onFilterChange={handleFilterChange} />
                  </SheetContent>
                </Sheet>
                
                {/* 件数表示 */}
                {data && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{data.count}</span> 件のツール
                  </p>
                )}
              </div>
              
              {/* 右側：表示切替 */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="hidden sm:flex"
                >
                  <Grid3x3 className="h-4 w-4" />
                  <span className="sr-only">グリッド表示</span>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="hidden sm:flex"
                >
                  <List className="h-4 w-4" />
                  <span className="sr-only">リスト表示</span>
                </Button>
              </div>
            </div>
            
            {/* アクティブフィルターバッジ（デスクトップのみ） */}
            {activeFilterCount > 0 && (
              <div className="hidden lg:flex flex-wrap gap-2 mb-6">
                {filters.platforms.map((platform) => (
                  <Badge 
                    key={platform} 
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => {
                      setFilters({
                        ...filters,
                        platforms: filters.platforms.filter(p => p !== platform)
                      });
                    }}
                  >
                    {platform.toUpperCase()}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {filters.toolTypes.map((type) => (
                  <Badge 
                    key={type} 
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => {
                      setFilters({
                        ...filters,
                        toolTypes: filters.toolTypes.filter(t => t !== type)
                      });
                    }}
                  >
                    {type}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                {filters.priceType && (
                  <Badge 
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => {
                      setFilters({ ...filters, priceType: undefined });
                    }}
                  >
                    {filters.priceType === 'free' ? '無料' : filters.priceType === 'paid' ? '有料' : 'Freemium'}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                )}
                {filters.tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => {
                      setFilters({
                        ...filters,
                        tags: filters.tags.filter(t => t !== tag)
                      });
                    }}
                  >
                    {tag}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
            
            {/* ツール表示エリア */}
            <div>
              {/* ローディング状態 */}
              {isPending && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">読み込み中...</span>
                </div>
              )}
              
              {/* エラー状態 */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    ツールの読み込みに失敗しました。ページを再読み込みしてください。
                  </AlertDescription>
                </Alert>
              )}
              
              {/* 結果なし */}
              {!isPending && !error && data && data.results.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted-foreground mb-4">
                    条件に一致するツールが見つかりませんでした
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({
                        platforms: [],
                        toolTypes: [],
                        priceType: undefined,
                        tags: [],
                      });
                    }}
                  >
                    フィルターをクリア
                  </Button>
                </div>
              )}
              
              {/* ツールグリッド */}
              {!isPending && !error && data && data.results.length > 0 && (
                <div 
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {data.results.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      variant={viewMode === 'grid' ? 'detailed' : 'compact'}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* ページネーション（将来実装） */}
            {/* TODO: ページネーションコンポーネント実装 */}
          </main>
        </div>
      </div>
    </div>
  );
}
