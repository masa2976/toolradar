'use client';

import { useState, useEffect } from 'react';
import { TocItem } from '@/lib/tocUtils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TableOfContentsProps {
  headings: TocItem[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Intersection Observerで現在表示中の見出しを追跡
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
        threshold: 0.5,
      }
    );

    // 全ての見出し要素を監視
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  // スムーズスクロール
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // ヘッダーの高さ分オフセット
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav
      className="toc-container mb-8 rounded-lg border border-border bg-card p-6"
      role="navigation"
      aria-label="目次"
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          📑 目次
        </h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 hover:bg-muted rounded-md transition-colors"
          aria-label={isOpen ? '目次を閉じる' : '目次を開く'}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* 目次リスト */}
      <ol
        className={`space-y-2 transition-all duration-300 ${
          isOpen ? 'block' : 'hidden lg:block'
        }`}
      >
        {headings.map((heading, index) => (
          <li
            key={heading.id}
            className={`${
              heading.level === 3 ? 'ml-4' : ''
            }`}
          >
            <a
              href={`#${heading.id}`}
              onClick={(e) => handleClick(e, heading.id)}
              className={`
                block py-1.5 px-3 rounded-md text-sm transition-all duration-200
                ${
                  activeId === heading.id
                    ? 'bg-accent text-accent-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }
                ${heading.level === 2 ? 'font-medium' : 'font-normal'}
              `}
            >
              {heading.level === 3 && (
                <span className="text-muted-foreground mr-2">└</span>
              )}
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
