import { Header, HeroSection, Footer, MainFeed, Sidebar } from '@/components/layout'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ヘッダー */}
      <Header />

      {/* メインコンテンツ */}
      <main className="flex-1">
        {/* ヒーローセクション */}
        <HeroSection />

        {/* コンテンツエリア */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* サイドバー（3/12） - 左側 - デスクトップのみ表示 */}
            <div className="hidden lg:block lg:col-span-3">
              <Sidebar />
            </div>

            {/* メインコンテンツ（9/12） - 右側 - モバイルは全幅 */}
            <div className="lg:col-span-9">
              <MainFeed />
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <Footer />
    </div>
  )
}
