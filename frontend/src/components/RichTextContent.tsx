'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

interface RichTextContentProps {
  html: string;
  className?: string;
}

/**
 * Wagtailのリッチテキストコンテンツを表示するコンポーネント
 * 内部リンクをNext.jsのクライアントサイドルーティングで処理
 */
export function RichTextContent({ html, className = '' }: RichTextContentProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('[RichTextContent] Component mounted');
    console.log('[RichTextContent] contentRef.current:', contentRef.current);
    
    if (!contentRef.current) {
      console.log('[RichTextContent] contentRef is null, returning');
      return;
    }

    // コンテンツ内のリンクを確認
    const links = contentRef.current.querySelectorAll('a');
    console.log('[RichTextContent] Found links:', links.length);
    links.forEach((link, index) => {
      console.log(`[RichTextContent] Link ${index}:`, {
        href: link.getAttribute('href'),
        text: link.textContent,
        element: link
      });
    });

    const handleClick = (e: MouseEvent) => {
      console.log('[RichTextContent] Click detected');
      console.log('[RichTextContent] Event target:', e.target);
      
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      console.log('[RichTextContent] Closest link:', link);

      if (!link) {
        console.log('[RichTextContent] No link found');
        return;
      }

      const href = link.getAttribute('href');
      console.log('[RichTextContent] Link href:', href);
      
      if (!href) {
        console.log('[RichTextContent] No href attribute');
        return;
      }

      // 外部リンクの場合はデフォルト動作
      if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) {
        console.log('[RichTextContent] External link, using default behavior');
        return;
      }

      // 内部リンクの場合はクライアントサイドルーティング
      console.log('[RichTextContent] Internal link detected, preventing default');
      e.preventDefault();
      console.log('[RichTextContent] Calling router.push with:', href);
      router.push(href);
    };

    const content = contentRef.current;
    console.log('[RichTextContent] Adding click event listener');
    content.addEventListener('click', handleClick);

    return () => {
      console.log('[RichTextContent] Component unmounting, removing event listener');
      content.removeEventListener('click', handleClick);
    };
  }, [router, html]); // htmlも依存配列に追加

  return (
    <div
      ref={contentRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
