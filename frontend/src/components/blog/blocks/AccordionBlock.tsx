'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { AccordionBlockValue } from '@/types/streamfield';

interface AccordionBlockProps {
  value: AccordionBlockValue;
}

/**
 * AccordionBlock コンポーネント
 * 
 * 折りたたみ可能なコンテンツブロック。
 * FAQ、長文説明、ステップガイドなどに使用。
 * 
 * 機能:
 * - クリックで開閉
 * - スムーズなアニメーション
 * - デフォルト開閉状態を設定可能
 * - ライトモード専用（ダークモード非対応）
 * 
 * @param value - AccordionBlockの値（title, content, is_open_by_default）
 */
export const AccordionBlock = React.memo(({ value }: AccordionBlockProps) => {
  const [isOpen, setIsOpen] = useState(value.is_open_by_default);

  return (
    <div className="border border-gray-300 rounded-lg my-4 overflow-hidden">
      {/* ヘッダー（クリック可能） */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        aria-expanded={isOpen}
      >
        <h4 className="font-bold text-base text-left">
          {value.title}
        </h4>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* コンテンツ（折りたたみ可能） */}
      {isOpen && (
        <div
          className="px-4 py-3 border-t border-gray-300 leading-relaxed [&>p]:mb-2 [&_a]:underline [&_a]:font-medium hover:[&_a]:opacity-80"
          dangerouslySetInnerHTML={{ __html: value.content }}
        />
      )}
    </div>
  );
});

AccordionBlock.displayName = 'AccordionBlock';
