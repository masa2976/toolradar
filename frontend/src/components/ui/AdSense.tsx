'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// ============================================
// Google AdSenseコンポーネント
// ============================================

interface AdSenseProps {
  /**
   * 広告スロットID
   * 例: "1234567890"
   */
  slot: string;
  
  /**
   * 広告フォーマット
   * - "auto": レスポンシブ（推奨）
   * - "rectangle": 300x250
   * - "horizontal": 728x90（デスクトップ）/ 320x50（モバイル）
   * - "vertical": 160x600
   */
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  
  /**
   * 広告の配置場所（トラッキング用）
   */
  placement?: string;
  
  /**
   * 追加のCSSクラス
   */
  className?: string;
  
  /**
   * レスポンシブ対応
   */
  responsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * Google AdSense広告コンポーネント
 * 
 * 使用例:
 * ```tsx
 * <AdSense 
 *   slot="1234567890"
 *   format="rectangle"
 *   placement="blog-toc"
 * />
 * ```
 */
export function AdSense({
  slot,
  format = 'auto',
  placement,
  className,
  responsive = true,
}: AdSenseProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pathname = usePathname();
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const status = process.env.NEXT_PUBLIC_ADSENSE_STATUS || 'pending';
  const isTestMode = process.env.NODE_ENV === 'development';
  
  useEffect(() => {
    // テストモードの場合は広告を表示しない
    if (isTestMode) {
      return;
    }
    
    // 審査前・審査中は広告を表示しない
    if (!clientId || status === 'pending') {
      return;
    }
    
    try {
      // AdSenseスクリプトの初期化（SPA遷移時も再実行）
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense initialization error:', error);
    }
  }, [isTestMode, clientId, status, pathname]); // pathnameを依存配列に追加
  
  // 審査前・審査中: 非表示（return null）
  if (!clientId || status === 'pending') {
    return null;
  }
  
  // テストモード: プレースホルダー表示
  if (isTestMode) {
    return (
      <div 
        className={cn(
          'my-5',
          className
        )}
        data-placement={placement}
      >
        <p className="text-xs text-gray-500 mb-1">スポンサーリンク</p>
        <div 
          className={cn(
            'flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg',
            format === 'rectangle' && 'h-[250px]',
            format === 'horizontal' && 'h-[90px]',
            format === 'vertical' && 'h-[600px]',
            format === 'auto' && 'min-h-[200px]',
          )}
        >
          <div className="text-center text-gray-500">
            <p className="text-sm font-medium">📢 AdSense広告</p>
            <p className="text-xs mt-1">Slot: {slot}</p>
            <p className="text-xs">Format: {format}</p>
            {placement && <p className="text-xs">Placement: {placement}</p>}
          </div>
        </div>
      </div>
    );
  }
  
  // 審査合格後: AdSense広告表示
  return (
    <div 
      className={cn('my-5', className)}
      data-placement={placement}
    >
      <p className="text-xs text-gray-500 mb-1">スポンサーリンク</p>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

/**
 * AdSenseスクリプトをheadに追加するコンポーネント
 * layout.tsxで使用（next/script推奨）
 * 
 * 使用例:
 * ```tsx
 * // app/layout.tsx
 * import Script from 'next/script';
 * 
 * // bodyの最後に配置
 * {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
 *   <Script
 *     src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
 *     strategy="afterInteractive"
 *     crossOrigin="anonymous"
 *   />
 * )}
 * ```
 * 
 * @deprecated next/Scriptを直接使用することを推奨
 */
export function AdSenseScript() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  
  // クライアントIDが設定されていない場合はスクリプトを読み込まない
  if (!clientId || process.env.NODE_ENV === 'development') {
    return null;
  }
  
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
    />
  );
}
