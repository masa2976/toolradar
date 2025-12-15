'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Grid3x3, List, SlidersHorizontal, X, Loader2, ArrowUpDown } from 'lucide-react';
import { ToolCard } from '@/components/ui/ToolCard';
import { SearchBar } from '@/components/ui/SearchBar';
import { FilterPanel, FilterState } from '@/components/ui/FilterPanel';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ASPWidget } from '@/components/ui/ASPWidget';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getToolsClient } from '@/lib/api/tools';
import type { Tool, ToolsOrdering } from '@/types';

interface ToolsClientProps {
  initialTools: Tool[];
  initialCount: number;
  initialFilters?: {
    q?: string;
    platform?: string;
    tool_type?: string;
    price_type?: string;
    tags?: string;
    ordering?: string;
  };
}

// ソートオプションの定義
const SORT_OPTIONS: { value: ToolsOrdering; label: string }[] = [
  { value: '-week_score', label: '人気順' },
  { value: '-created_at', label: '新着順' },
  { value: 'name', label: '名前順' },
];

export function ToolsClient({ initialTools, initialCount, initialFilters = {} }: ToolsClientProps) {
  const router = useRouter();
  
  // フィルター状態管理
  const [searchQuery, setSearchQuery] = useState(initialFilters.q || '');
  const [filters, setFilters] = useState<FilterState>({
    platforms: initialFilters.platform ? initialFilters.platform.split(',') : [],
    toolTypes: initialFilters.tool_type ? initialFilters.tool_type.split(',') : [],
    priceType: initialFilters.price_type as 'free' | 'paid' | 'freemium' | undefined,
    tags: initialFilters.tags ? initialFilters.tags.split(',') : [],
  });
  
  // ソート状態
  const [sortOrder, setSortOrder] = useState<ToolsOrdering>(
    (initialFilters.ordering as ToolsOrdering) || '-week_score'
  );
  
  // 表示モード
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Load More用の状態
  const [displayedTools, setDisplayedTools] = useState<Tool[]>(initialTools);
  const [totalCount, setTotalCount] = useState(initialCount);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialCount > initialTools.length);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // フィルターキーを生成（URLパラメータの変更検知用）
  const filterKey = JSON.stringify({
    q: initialFilters.q || '',
    platform: initialFilters.platform || '',
    tool_type: initialFilters.tool_type || '',
    price_type: initialFilters.price_type || '',
    tags: initialFilters.tags || '',
    ordering: initialFilters.ordering || '',
  });
  
  // URLパラメータ（initialFilters）が変更されたときに状態を同期
  useEffect(() => {
    setFilters({
      platforms: initialFilters.platform ? initialFilters.platform.split(',') : [],
      toolTypes: initialFilters.tool_type ? initialFilters.tool_type.split(',') : [],
      priceType: initialFilters.price_type as 'free' | 'paid' | 'freemium' | undefined,
      tags: initialFilters.tags ? initialFilters.tags.split(',') : [],
    });
    setSearchQuery(initialFilters.q || '');
    setSortOrder((initialFilters.ordering as ToolsOrdering) || '-week_score');
    
    // フィルターが変更されたらツールリストをリセット
    setDisplayedTools(initialTools);
    setTotalCount(initialCount);
    setCurrentPage(1);
    setHasMore(initialCount > initialTools.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]); // filterKeyのみを依存配列に使用（initialTools/initialCountは含めない）

  /**
   * フィルター状態からURLパラメータを構築してナビゲート
   */
  const updateUrlWithFilters = useCallback((
    newFilters: FilterState,
    query?: string,
    ordering?: ToolsOrdering
  ) => {
    const params = new URLSearchParams();
    
    // 検索クエリ
    if (query) {
      params.set('q', query);
    }
    
    // プラットフォーム
    if (newFilters.platforms.length > 0) {
      params.set('platform', newFilters.platforms.join(','));
    }
    
    // ツールタイプ
    if (newFilters.toolTypes.length > 0) {
      params.set('tool_type', newFilters.toolTypes.join(','));
    }
    
    // 価格タイプ
    if (newFilters.priceType) {
      params.set('price_type', newFilters.priceType);
    }
    
    // タグ
    if (newFilters.tags.length > 0) {
      params.set('tags', newFilters.tags.join(','));
    }
    
    // ソート順（デフォルト以外の場合のみURLに含める）
    if (ordering && ordering !== '-week_score') {
      params.set('ordering', ordering);
    }
    
    const queryString = params.toString();
    router.push(`/tools${queryString ? `?${queryString}` : ''}`);
  }, [router]);
  
  // 検索ハンドラー
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    updateUrlWithFilters(filters, query, sortOrder);
  }, [filters, sortOrder, updateUrlWithFilters]);
  
  // フィルター変更ハンドラー（URLも更新）
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    updateUrlWithFilters(newFilters, searchQuery, sortOrder);
  }, [searchQuery, sortOrder, updateUrlWithFilters]);
  
  // ソート変更ハンドラー
  const handleSortChange = useCallback((value: ToolsOrdering) => {
    setSortOrder(value);
    updateUrlWithFilters(filters, searchQuery, value);
  }, [filters, searchQuery, updateUrlWithFilters]);
  
  // Load More ハンドラー
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
    try {
      const nextPage = currentPage + 1;
      
      // APIパラメータを構築
      const params: Record<string, string | number> = {
        page: nextPage,
        ordering: sortOrder,
      };
      
      if (searchQuery) params.q = searchQuery;
      if (filters.platforms.length > 0) params.platform = filters.platforms.join(',');
      if (filters.toolTypes.length > 0) params.tool_type = filters.toolTypes.join(',');
      if (filters.priceType) params.price_type = filters.priceType;
      if (filters.tags.length > 0) params.tags = filters.tags.join(',');
      
      const data = await getToolsClient(params as any);
      
      setDisplayedTools(prev => [...prev, ...data.results]);
      setCurrentPage(nextPage);
      setHasMore(data.next !== null);
    } catch (error) {
      console.error('Failed to load more tools:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, currentPage, sortOrder, searchQuery, filters]);
  
  // アクティブなフィルター数を計算
  const activeFilterCount = 
    filters.platforms.length + 
    filters.toolTypes.length + 
    (filters.priceType ? 1 : 0) + 
    filters.tags.length;
  
  // フィルタークリア
  const handleClearFilters = useCallback(() => {
    const clearedFilters: FilterState = {
      platforms: [],
      toolTypes: [],
      priceType: undefined,
      tags: [],
    };
    setSearchQuery('');
    setFilters(clearedFilters);
    setSortOrder('-week_score');
    router.push('/tools');
  }, [router]);
  
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
                filters={filters}
                onChange={handleFilterChange}
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
            {/* ツールバー（モバイルフィルター・ソート・表示切替・件数） */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
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
                filters={filters}
                onChange={handleFilterChange}
              />
                  </SheetContent>
                </Sheet>
                
                {/* 件数表示 */}
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{totalCount}</span> 件のツール
                </p>
              </div>
              
              {/* 右側：ソート + 表示切替 */}
              <div className="flex items-center gap-2">
                {/* ソートセレクト */}
                <Select value={sortOrder} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[130px]">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="並び替え" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* 表示切替 */}
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
                      const newFilters = {
                        ...filters,
                        platforms: filters.platforms.filter(p => p !== platform)
                      };
                      handleFilterChange(newFilters);
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
                      const newFilters = {
                        ...filters,
                        toolTypes: filters.toolTypes.filter(t => t !== type)
                      };
                      handleFilterChange(newFilters);
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
                      const newFilters = { ...filters, priceType: undefined };
                      handleFilterChange(newFilters);
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
                      const newFilters = {
                        ...filters,
                        tags: filters.tags.filter(t => t !== tag)
                      };
                      handleFilterChange(newFilters);
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
              {displayedTools.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted-foreground mb-4">
                    条件に一致するツールが見つかりませんでした
                  </p>
                  <Button 
                    variant="outline"
                    onClick={handleClearFilters}
                  >
                    フィルターをクリア
                  </Button>
                </div>
              )}
              
              {/* ツールグリッド */}
              {displayedTools.length > 0 && (
                <>
                  <div 
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                        : 'space-y-4'
                    }
                  >
                    {displayedTools.map((tool) => (
                      <ToolCard
                        key={tool.id}
                        tool={tool}
                        variant={viewMode === 'grid' ? 'detailed' : 'compact'}
                      />
                    ))}
                  </div>
                  
                  {/* 進捗表示 & Load More */}
                  <div className="mt-8 space-y-4">
                    {/* 進捗表示 */}
                    <div className="text-center text-sm text-muted-foreground">
                      📦 {displayedTools.length}件 / 全{totalCount}件を表示中
                    </div>
                    
                    {/* Load More ボタン */}
                    {hasMore && (
                      <div className="flex justify-center">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                          className="min-w-[200px]"
                        >
                          {isLoadingMore ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              読み込み中...
                            </>
                          ) : (
                            'さらに読み込む'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
