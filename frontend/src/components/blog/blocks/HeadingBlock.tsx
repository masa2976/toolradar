/**
 * Headingブロックコンポーネント
 * 
 * Wagtail StreamFieldの見出しブロックをレンダリングします。
 * h2〜h6レベルの見出しに対応しています。
 */

import React from 'react';
import { generateHeadingId } from '@/lib/tocUtils';

interface HeadingBlockValue {
  text: string;
  level: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

interface HeadingBlockProps {
  value: HeadingBlockValue;
}

export function HeadingBlock({ value }: HeadingBlockProps) {
  const { text, level } = value;
  
  // 見出しIDを生成（目次用）
  const headingId = generateHeadingId(text);
  
  // レベルに応じたスタイル
  const styles = {
    h2: 'text-3xl font-bold mt-8 mb-4',
    h3: 'text-2xl font-bold mt-6 mb-3',
    h4: 'text-xl font-bold mt-4 mb-2',
    h5: 'text-lg font-semibold mt-3 mb-2',
    h6: 'text-base font-semibold mt-2 mb-1',
  };
  
  const HeadingTag = level || 'h2';
  const className = styles[level] || styles.h2;
  
  return React.createElement(
    HeadingTag,
    { 
      id: headingId,
      className 
    },
    text
  );
}
