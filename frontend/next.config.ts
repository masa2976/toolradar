import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // WebP・AVIF自動変換を有効化（SEO・パフォーマンス向上）
    formats: ['image/avif', 'image/webp'],
    
    // 画像最適化の品質設定
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    remotePatterns: [
      // 開発環境: Django Backend
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'backend',
        port: '8000',
        pathname: '/**',
      },
      // MQL5 (MT4/MT5ツール画像)
      {
        protocol: 'https',
        hostname: 'c.mql5.com',
        pathname: '/**',
      },
      // TradingView
      {
        protocol: 'https',
        hostname: 's3.tradingview.com',
        pathname: '/**',
      },
      // Unsplash (ブログ・カテゴリ画像)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      // Supabase Storage
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // プレースホルダー
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        pathname: '/**',
      },
      // 汎用（将来の拡張用）
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
