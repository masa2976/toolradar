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
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* メインコンテンツ（8/12） */}
            <div className="lg:col-span-8">
              <MainFeed />
            </div>

            {/* サイドバー（4/12） */}
            <div className="lg:col-span-4">
              <Sidebar />
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <Footer />
    </div>
  )
}
