'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Grid3x3, List, SlidersHorizontal, X } from 'lucide-react';
import { ToolCard } from '@/components/ui/ToolCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterPanel, FilterState } from '@/components/ui/FilterPanel';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ASPWidget } from '@/components/ui/ASPWidget';
import type { Tool } from '@/types';

interface ToolsClientProps {
  initialTools: Tool[];
  initialCount: number;
  initialFilters?: {
    q?: string;
    platform?: string;
    tool_type?: string;
    price_type?: string;
  };
}

export function ToolsClient({ initialTools, initialCount, initialFilters = {} }: ToolsClientProps) {
  // フィルター状態管理
  const [searchQuery, setSearchQuery] = useState(initialFilters.q || '');
  const [filters, setFilters] = useState<FilterState>({
    platforms: initialFilters.platform ? initialFilters.platform.split(',') : [],
    toolTypes: initialFilters.tool_type ? initialFilters.tool_type.split(',') : [],
    priceType: initialFilters.price_type as 'free' | 'paid' | 'freemium' | undefined,
    tags: [],
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // クライアント側でのフィルタリング（簡易実装）
  const filteredTools = initialTools.filter(tool => {
    // 検索クエリフィルタ
    if (searchQuery && !tool.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // プラットフォームフィルタ
    if (filters.platforms.length > 0) {
      const hasMatchingPlatform = tool.platform.some(p => 
        filters.platforms.includes(p.toLowerCase())
      );
      if (!hasMatchingPlatform) return false;
    }
    
    // ツールタイプフィルタ
    if (filters.toolTypes.length > 0 && !filters.toolTypes.includes(tool.tool_type)) {
      return false;
    }
    
    // 価格タイプフィルタ
    if (filters.priceType && tool.price_type !== filters.priceType) {
      return false;
    }
    
    return true;
  });
  
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
              defaultValue={searchQuery}
            />
          </div>
        </div>
      </div>
      
      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左サイドバー（デスクトップ） */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20 space-y-6">
              <FilterPanel 
                onFilterChange={handleFilterChange} 
                initialFilters={filters}
              />
              
              {/* ASPウィジェット */}
              <ASPWidget 
                placement="sidebar-top"
                className="mt-6"
              />
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
                    <FilterPanel 
                      onFilterChange={handleFilterChange} 
                      initialFilters={filters}
                    />
                  </SheetContent>
                </Sheet>
                
                {/* 件数表示 */}
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{filteredTools.length}</span> 件のツール
                </p>
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
              {/* 結果なし */}
              {filteredTools.length === 0 && (
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
              {filteredTools.length > 0 && (
                <div 
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {filteredTools.map((tool) => (
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
