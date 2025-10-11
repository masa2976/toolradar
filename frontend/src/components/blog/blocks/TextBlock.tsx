/**
 * Textブロックコンポーネント
 * 
 * Wagtail StreamFieldのリッチテキストブロックをレンダリングします。
 * HTMLを含むリッチテキストに対応しています。
 */

import React from 'react';

interface TextBlockValue {
  text?: string;
  // RichTextBlockの場合、HTML文字列が直接valueに入る可能性もある
  [key: string]: any;
}

interface TextBlockProps {
  value: TextBlockValue | string;
}

export function TextBlock({ value }: TextBlockProps) {
  // valueが文字列の場合（RichTextBlockのHTML）
  if (typeof value === 'string') {
    return (
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  }
  
  // valueがオブジェクトの場合
  if (typeof value === 'object' && value !== null) {
    // textプロパティがある場合
    if ('text' in value && typeof value.text === 'string') {
      return (
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: value.text }}
        />
      );
    }
  }
  
  // フォールバック：そのまま文字列として表示
  return (
    <p className="text-base text-foreground leading-relaxed">
      {String(value)}
    </p>
  );
}
