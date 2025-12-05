import React from 'react';
import type { SpacerBlockValue } from '@/types/streamfield';

/**
 * Spacerブロックコンポーネント
 * 
 * セクション間の余白を調整する装飾的要素。
 * アクセシビリティツリーから除外され、
 * スクリーンリーダーには読み上げられません。
 * 
 * @see https://www.joshwcomeau.com/react/modern-spacer-gif/
 * @see https://www.w3.org/WAI/ARIA/apg/practices/hiding-semantics/
 */
interface SpacerBlockProps {
  value: SpacerBlockValue;
}

// サイズとTailwindクラスのマッピング
// Tailwindの任意値構文（Arbitrary Values）を使用
const heightClasses = {
  small: 'h-5',        // 20px (1.25rem)
  medium: 'h-10',      // 40px (2.5rem)
  large: 'h-[60px]',   // 60px (任意値)
  xlarge: 'h-20',      // 80px (5rem)
} as const;

export const SpacerBlock = React.memo(({ value }: SpacerBlockProps) => {
  return (
    <div
      className={heightClasses[value.size]}
      aria-hidden="true"
      role="presentation"
    />
  );
});

SpacerBlock.displayName = 'SpacerBlock';
