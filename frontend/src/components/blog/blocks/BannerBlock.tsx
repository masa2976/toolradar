'use client';

/**
 * Bannerブロックコンポーネント
 * 
 * Wagtail StreamFieldのBannerブロックをレンダリングします。
 * ASP（A8.net、もしもアフィリエイト等）から提供されたバナー広告の
 * HTMLコードをそのまま表示します。
 * 
 * セキュリティ対策:
 * - dangerouslySetInnerHTMLを使用（ASPコードにスクリプトが含まれる可能性があるため）
 * - トラッキングコードが正常に動作するようにする
 * 
 * Note: 'use client'ディレクティブを使用（Next.js 15 + React 19でのhydrationエラー対策）
 */

import React from 'react';
import { BannerValue } from '@/types/streamfield';

interface BannerBlockProps {
  value: BannerValue;
}

export function BannerBlock({ value }: BannerBlockProps) {
  const { html_code } = value;

  // デバッグ: 実際のデータを確認
  console.log('BannerBlock value:', value);
  console.log('html_code:', html_code);
  console.log('html_code type:', typeof html_code);

  // html_codeが文字列でない場合の安全処理
  const htmlContent = typeof html_code === 'string' ? html_code : String(html_code || '');

  return (
    <div 
      className="my-6"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
