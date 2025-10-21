/**
 * 目次ブロックコンポーネント
 * 
 * 記事内の見出し（h2, h3）を自動抽出して目次を生成します。
 */

'use client';

import { useEffect, useState } from 'react';
import { List } from 'lucide-react';

interface TableOfContentsValue {
  title?: string;
  show_h2?: boolean;
  show_h3?: boolean;
}

interface TableOfContentsBlockProps {
  value: TableOfContentsValue;
}

interface Heading {
  id: string;
  text: string;
  level: 'h2' | 'h3';
}

export function TableOfContentsBlock({ value }: TableOfContentsBlockProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  const title = value.title || '目次';
  const showH2 = value.show_h2 !== false;
  const showH3 = value.show_h3 !== false;

  useEffect(() => {
    // 記事コンテナから見出しを抽出
    const articleElement = document.querySelector('.blog-content');
    if (!articleElement) return;

    // h2, h3要素を取得
    const headingElements = articleElement.querySelectorAll('h2, h3');
    const extractedHeadings: Heading[] = [];

    headingElements.forEach((el, index) => {
      const level = el.tagName.toLowerCase() as 'h2' | 'h3';
      
      // フィルタリング
      if (level === 'h2' && !showH2) return;
      if (level === 'h3' && !showH3) return;

      // IDがない場合は生成
      let id = el.id;
      if (!id) {
        id = `heading-${index}-${el.textContent?.toLowerCase().replace(/\s+/g, '-')}`;
        el.id = id;
      }

      extractedHeadings.push({
        id,
        text: el.textContent || '',
        level,
      });
    });

    setHeadings(extractedHeadings);

    // スクロール監視（アクティブな見出しをハイライト）
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
      }
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [showH2, showH3]);

  if (headings.length === 0) {
    return null;
  }

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // ヘッダー高さ分のオフセット
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="my-8 p-6 rounded-lg border-2 border-gray-200 bg-gradient-to-br from-warm-cream to-white shadow-sm">
      {/* タイトル */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-warm-orange">
        <List className="w-5 h-5 text-warm-orange" />
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>

      {/* 目次リスト */}
      <nav aria-label="目次">
        <ol className="space-y-2">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={heading.level === 'h3' ? 'ml-6' : ''}
            >
              <button
                onClick={() => handleClick(heading.id)}
                className={`
                  text-left w-full px-3 py-2 rounded-md transition-all
                  ${
                    activeId === heading.id
                      ? 'bg-warm-orange text-white font-semibold'
                      : 'text-gray-700 hover:bg-warm-peach/30 hover:text-gray-900'
                  }
                  ${heading.level === 'h2' ? 'font-medium' : 'text-sm'}
                `}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
