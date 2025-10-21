'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// Google AdSenseコンポーネント
// ============================================

interface AdSenseProps {
  /**
   * 広告スロットID
   * 例: "1234567890"
   */
  adSlot: string;
  
  /**
   * 広告フォーマット
   * - "auto": レスポンシブ（推奨）
   * - "rectangle": 300x250
   * - "horizontal": 728x90（デスクトップ）/ 320x50（モバイル）
   * - "vertical": 160x600
   */
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  
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
  
  /**
   * テストモード（開発環境用）
   */
  testMode?: boolean;
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
 *   adSlot="1234567890"
 *   adFormat="rectangle"
 *   placement="tool-detail-middle"
 * />
 * ```
 */
export function AdSense({
  adSlot,
  adFormat = 'auto',
  placement,
  className,
  responsive = true,
  testMode = process.env.NODE_ENV === 'development',
}: AdSenseProps) {
  const adRef = useRef<HTMLModElement>(null);
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const status = process.env.NEXT_PUBLIC_ADSENSE_STATUS || 'pending';
  
  useEffect(() => {
    // テストモードの場合は広告を表示しない
    if (testMode) {
      return;
    }
    
    // 審査前・審査中は広告を表示しない
    if (!clientId || status === 'pending') {
      return;
    }
    
    try {
      // AdSenseスクリプトの初期化
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense initialization error:', error);
    }
  }, [testMode, clientId, status]);
  
  // 審査前・審査中: 非表示（return null）
  if (!clientId || status === 'pending') {
    return null;
  }
  
  // テストモード: プレースホルダー表示
  if (testMode) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg',
          adFormat === 'rectangle' && 'h-[250px]',
          adFormat === 'horizontal' && 'h-[90px]',
          adFormat === 'vertical' && 'h-[600px]',
          adFormat === 'auto' && 'min-h-[250px]',
          className
        )}
        data-placement={placement}
      >
        <div className="text-center text-gray-500">
          <p className="text-sm font-medium">AdSense広告プレースホルダー</p>
          <p className="text-xs mt-1">Slot: {adSlot}</p>
          <p className="text-xs">Format: {adFormat}</p>
          {placement && <p className="text-xs">Placement: {placement}</p>}
        </div>
      </div>
    );
  }
  
  // 審査合格後: AdSense広告表示
  return (
    <div 
      className={cn('flex justify-center items-center', className)}
      data-placement={placement}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

/**
 * AdSenseスクリプトをheadに追加するコンポーネント
 * layout.tsxで使用
 * 
 * 使用例:
 * ```tsx
 * // app/layout.tsx
 * import { AdSenseScript } from '@/components/ui/AdSense';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <head>
 *         <AdSenseScript />
 *       </head>
 *       <body>{children}</body>
 *     </html>
 *   );
 * }
 * ```
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
