import React from 'react';
import type { ParagraphBlockValue } from '@/types/streamfield';

/**
 * Paragraphブロックコンポーネント
 * 
 * 最もシンプルなStreamFieldブロック。
 * 段落テキストをレンダリングします。
 */
interface ParagraphBlockProps {
  value: ParagraphBlockValue;
}

export const ParagraphBlock = React.memo(({ value }: ParagraphBlockProps) => {
  return (
    <p className="text-base leading-relaxed text-foreground mb-4">
      {value.text}
    </p>
  );
});

ParagraphBlock.displayName = 'ParagraphBlock';
