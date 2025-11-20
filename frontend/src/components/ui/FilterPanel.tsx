'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

/**
 * フィルター状態の型定義
 */
export interface FilterState {
  platforms: string[];      // ['mt4', 'mt5', 'tradingview']
  toolTypes: string[];       // ['EA', 'Indicator', ...]
  priceType?: string;        // 'free' | 'paid' | 'freemium'
  tags: string[];           // ['rsi', 'macd', ...]
}

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;  // URLパラメータからの初期値
  className?: string;
}

/**
 * FilterPanel コンポーネント
 * 
 * ツール検索用の多機能フィルターパネル。
 * Accordion形式で折りたたみ可能、複数条件フィルター、リセット機能対応。
 */
export function FilterPanel({ onFilterChange, initialFilters, className }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters || {
    platforms: [],
    toolTypes: [],
    priceType: undefined,
    tags: [],
  });

  // URLパラメータが変更されたときにフィルターを更新
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  /**
   * フィルター変更ハンドラー
   */
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  /**
   * 全フィルターリセット
   */
  const handleReset = () => {
    const resetFilters: FilterState = {
      platforms: [],
      toolTypes: [],
      priceType: undefined,
      tags: [],
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  // プラットフォーム選択肢
  const platforms = [
    { value: 'mt4', label: 'MT4' },
    { value: 'mt5', label: 'MT5' },
    { value: 'tradingview', label: 'TradingView' },
  ];

  // ツールタイプ選択肢
  const toolTypes = [
    { value: 'EA', label: 'EA' },
    { value: 'Indicator', label: 'Indicator' },
    { value: 'Library', label: 'Library' },
    { value: 'Script', label: 'Script' },
    { value: 'Strategy', label: 'Strategy' },
  ];

  // 価格タイプ選択肢
  const priceTypes = [
    { value: 'free', label: '無料' },
    { value: 'paid', label: '有料' },
    { value: 'freemium', label: 'Freemium' },
  ];

  // 人気タグ（例：実際はAPIから取得想定）
  const popularTags = [
    { value: 'rsi', label: 'RSI' },
    { value: 'macd', label: 'MACD' },
    { value: 'scalping', label: 'スキャルピング' },
    { value: 'trend_following', label: 'トレンドフォロー' },
    { value: 'grid', label: 'グリッド' },
    { value: 'martingale', label: 'マーチンゲール' },
  ];

  return (
    <div className={cn('bg-card border rounded-lg p-4 shadow-sm', className)}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">フィルター</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          クリア
        </Button>
      </div>

      <Separator className="mb-4" />

      <Accordion
        type="multiple"
        defaultValue={['platform', 'type', 'price', 'tags']}
        className="space-y-2"
      >
        {/* プラットフォーム */}
        <AccordionItem value="platform" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline">
            <span className="text-sm font-medium">プラットフォーム</span>
          </AccordionTrigger>
          <AccordionContent className="pb-2">
            <div className="space-y-3 pt-2">
              {platforms.map((platform) => (
                <div key={platform.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`platform-${platform.value}`}
                    checked={filters.platforms.includes(platform.value)}
                    onCheckedChange={(checked) => {
                      const newPlatforms = checked
                        ? [...filters.platforms, platform.value]
                        : filters.platforms.filter((p) => p !== platform.value);
                      handleFilterChange({ platforms: newPlatforms });
                    }}
                  />
                  <Label
                    htmlFor={`platform-${platform.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {platform.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ツールタイプ */}
        <AccordionItem value="type" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline">
            <span className="text-sm font-medium">ツールタイプ</span>
          </AccordionTrigger>
          <AccordionContent className="pb-2">
            <div className="space-y-3 pt-2">
              {toolTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type.value}`}
                    checked={filters.toolTypes.includes(type.value)}
                    onCheckedChange={(checked) => {
                      const newTypes = checked
                        ? [...filters.toolTypes, type.value]
                        : filters.toolTypes.filter((t) => t !== type.value);
                      handleFilterChange({ toolTypes: newTypes });
                    }}
                  />
                  <Label
                    htmlFor={`type-${type.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 価格タイプ */}
        <AccordionItem value="price" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline">
            <span className="text-sm font-medium">価格</span>
          </AccordionTrigger>
          <AccordionContent className="pb-2">
            <RadioGroup
              value={filters.priceType}
              onValueChange={(value) => handleFilterChange({ priceType: value })}
              className="space-y-3 pt-2"
            >
              {priceTypes.map((price) => (
                <div key={price.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={price.value} id={`price-${price.value}`} />
                  <Label
                    htmlFor={`price-${price.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {price.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        {/* タグ */}
        <AccordionItem value="tags" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline">
            <span className="text-sm font-medium">人気タグ</span>
          </AccordionTrigger>
          <AccordionContent className="pb-2">
            <div className="flex flex-wrap gap-2 pt-2">
              {popularTags.map((tag) => (
                <Badge
                  key={tag.value}
                  variant={filters.tags.includes(tag.value) ? 'default' : 'outline'}
                  className="cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => {
                    const newTags = filters.tags.includes(tag.value)
                      ? filters.tags.filter((t) => t !== tag.value)
                      : [...filters.tags, tag.value];
                    handleFilterChange({ tags: newTags });
                  }}
                >
                  {tag.label}
                </Badge>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
