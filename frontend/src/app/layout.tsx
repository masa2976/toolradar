import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

// Google AdSense パブリッシャーID
const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

export const metadata: Metadata = {
  title: "ToolRadar - 投資ツールのキュレーションプラットフォーム",
  description: "MT4/MT5/TradingViewのツール検索と投資教育コンテンツ",
  // Google AdSense 審査コード
  // 審査申請時から配置、合格後も継続配置
  ...(adsenseClientId && {
    other: {
      "google-adsense-account": adsenseClientId,
    },
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSerifJP.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
