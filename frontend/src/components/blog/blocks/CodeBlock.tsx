/**
 * Codeブロックコンポーネント
 * 
 * Wagtail StreamFieldのコードブロックをレンダリングします。
 * Phase 4: 基本実装（モノスペースフォント、言語ラベル）
 * Phase 8: シンタックスハイライト追加予定
 */

import React from 'react';

interface CodeBlockValue {
  language: string;
  code: string;
  caption?: string;
}

interface CodeBlockProps {
  value: CodeBlockValue;
}

export function CodeBlock({ value }: CodeBlockProps) {
  const { language, code, caption } = value;
  
  return (
    <div className="my-6">
      {/* キャプション */}
      {caption && (
        <div className="text-sm text-muted-foreground mb-2 font-medium">
          {caption}
        </div>
      )}
      
      {/* コードブロック */}
      <div className="relative">
        {/* 言語ラベル */}
        <div className="absolute top-2 right-2 px-2 py-1 text-xs font-mono bg-muted/80 backdrop-blur-sm rounded border border-border z-10">
          {language}
        </div>
        
        {/* コード本体 */}
        <pre className="bg-muted text-foreground border border-border p-4 rounded-lg overflow-x-auto">
          <code className={`language-${language} font-mono text-sm leading-relaxed`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
