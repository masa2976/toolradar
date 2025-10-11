/**
 * CTAブロックコンポーネント
 * 
 * Wagtail StreamFieldのCTAブロックをレンダリングします。
 * Phase 5: 基本実装（スタイルバリエーション、サイズバリエーション、A/Bテスト対応）
 * 
 * 2025年ベストプラクティス対応:
 * - マイクロインタラクション（ホバー時の拡大・影）
 * - トランジション（duration-200）
 * - 視認性（背景色・ボーダー）
 * - アクセシビリティ（フォーカスリング）
 */

import React from 'react';
import { CTAValue } from '@/types/streamfield';

interface CTABlockProps {
  value: CTAValue;
}

export function CTABlock({ value }: CTABlockProps) {
  const {
    heading,
    text,
    button_text,
    url,
    style = 'primary',
    size = 'medium',
    ab_variant,
  } = value;

  // スタイルバリエーション
  const styleClasses = {
    primary: 'bg-primary hover:bg-primary-hover text-white',
    success: 'bg-success hover:bg-success/90 text-white',
    warning: 'bg-warning hover:bg-warning/90 text-white',
  };

  // サイズバリエーション
  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };

  return (
    <div className="my-6 p-6 rounded-lg border-2 border-accent/20 bg-accent/5">
      {/* 見出し（オプション） */}
      {heading && (
        <h3 className="text-xl font-bold mb-3 text-foreground">
          {heading}
        </h3>
      )}

      {/* 説明文 */}
      <p className="text-muted-foreground mb-4 leading-relaxed">
        {text}
      </p>

      {/* CTAボタン */}
      <a
        href={url}
        target="_blank"
        rel="nofollow noopener noreferrer"
        data-ab-variant={ab_variant}
        className="inline-block"
      >
        <button
          className={`
            ${styleClasses[style]}
            ${sizeClasses[size]}
            font-bold rounded-lg
            transition-all duration-200
            hover:scale-105 hover:shadow-lg
            focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent
          `}
        >
          {button_text}
        </button>
      </a>
    </div>
  );
}
