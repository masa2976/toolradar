import React from 'react';
import { Star, Check } from 'lucide-react';
import type { ComparisonTableValue, Broker } from '@/types/streamfield';

/**
 * ComparisonTableBlock
 * 
 * 証券会社、書籍、取引所などの比較表を表示するブロック
 * アフィリエイトリンク付きのCTAボタンを含む
 * 
 * @example
 * ```tsx
 * <ComparisonTableBlock value={{
 *   title: "おすすめFX証券会社TOP3",
 *   description: "初心者におすすめの信頼できる証券会社を比較",
 *   brokers: [...],
 *   layout: "ranking"
 * }} />
 * ```
 */
export const ComparisonTableBlock = React.memo(({ value }: { value: ComparisonTableValue }) => {
  const { title, description, brokers, layout = 'ranking' } = value;

  return (
    <section className="comparison-table my-8 border-t border-border pt-6">
      {/* セクションタイトル */}
      <h2 className="text-2xl font-bold mb-2 text-foreground">
        {title}
      </h2>
      
      {/* 説明文（オプション） */}
      {description && (
        <p className="text-muted-foreground mb-6">
          {description}
        </p>
      )}
      
      {/* 証券会社カードリスト */}
      <div className="space-y-4">
        {brokers.map((broker, index) => (
          <BrokerCard 
            key={broker.name}
            broker={broker}
            rank={index + 1}
          />
        ))}
      </div>
    </section>
  );
});

ComparisonTableBlock.displayName = 'ComparisonTableBlock';

/**
 * BrokerCard
 * 
 * 証券会社（または商品）の詳細情報を表示するカード
 * 
 * @param broker - 証券会社情報
 * @param rank - ランキング順位
 */
function BrokerCard({ broker, rank }: { broker: Broker; rank: number }) {
  return (
    <div className="bg-card border-2 border-accent/20 rounded-lg p-6 hover:border-accent/40 transition-colors">
      <div className="flex items-start gap-4">
        {/* ランキングバッジ */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent flex items-center justify-center">
          <span className="text-xl font-bold text-white">
            {rank}
          </span>
        </div>
        
        <div className="flex-1">
          {/* 証券会社名 */}
          <h3 className="text-xl font-bold mb-3 text-foreground">
            {broker.name}
          </h3>
          
          {/* 評価・価格・ボタン */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* 評価 */}
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold" style={{ color: 'var(--warning)' }}>
                  {broker.rating.toFixed(1)}
                </span>
                <StarRating rating={broker.rating} />
              </div>
              
              {/* コスト */}
              {broker.cost && (
                <span className="text-sm font-semibold text-foreground">
                  {broker.cost}
                </span>
              )}
            </div>
            
            {/* CTAボタン */}
            <a
              href={broker.cta_url}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-md transition-colors inline-block text-center whitespace-nowrap"
              data-tracking-id={broker.tracking_id}
            >
              {broker.cta_text}
            </a>
          </div>
          
          {/* ボーナス情報 */}
          {broker.bonus && (
            <div 
              className="text-sm font-semibold mb-3 inline-block px-3 py-1 rounded"
              style={{ 
                color: 'var(--warning-foreground)', 
                backgroundColor: 'var(--warning-light)' 
              }}
            >
              🎁 {broker.bonus}
            </div>
          )}
          
          {/* 特徴リスト */}
          <ul className="text-sm text-foreground space-y-1">
            {broker.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check 
                  className="w-4 h-4 flex-shrink-0 mt-0.5" 
                  style={{ color: 'var(--success)' }}
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/**
 * StarRating
 * 
 * 5段階の星評価を表示
 * 
 * @param rating - 評価値（0-5）
 * 
 * @example
 * ```tsx
 * <StarRating rating={4.5} />
 * // → ★★★★☆ （黄色の星4つ + 半分の星 + 灰色の星1つ）
 * ```
 */
function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5" aria-label={`評価: ${rating.toFixed(1)}/5.0`}>
      {/* 満点の星（黄色） */}
      {[...Array(fullStars)].map((_, i) => (
        <Star 
          key={`full-${i}`}
          className="w-4 h-4"
          style={{ 
            color: 'var(--warning)',
            fill: 'var(--warning)'
          }}
          aria-hidden="true"
        />
      ))}
      
      {/* 半分の星（オプション） */}
      {hasHalfStar && (
        <div className="relative w-4 h-4">
          {/* 背景: 空の星（灰色） */}
          <Star 
            className="absolute inset-0 w-4 h-4"
            style={{ 
              color: 'var(--muted-foreground)',
              fill: 'none',
              opacity: 0.3
            }}
            aria-hidden="true"
          />
          {/* 前景: 半分の星（黄色） */}
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star 
              className="w-4 h-4"
              style={{ 
                color: 'var(--warning)',
                fill: 'var(--warning)'
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      )}
      
      {/* 空の星（灰色） */}
      {[...Array(emptyStars)].map((_, i) => (
        <Star 
          key={`empty-${i}`}
          className="w-4 h-4"
          style={{ 
            color: 'var(--muted-foreground)',
            fill: 'none',
            opacity: 0.3
          }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
