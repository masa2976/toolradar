import { Header, HeroSection, Footer, MainFeed, Sidebar } from '@/components/layout'
import { getTools } from '@/lib/api/tools'

export default async function HomePage() {
  // ツール総数を取得（ヒーローセクションの動的表示用）
  let toolCount: number | undefined
  try {
    const toolsResponse = await getTools({ page: 1 })
    toolCount = toolsResponse.count
  } catch (error) {
    // API失敗時はフォールバック（countなし）
    console.error('Failed to fetch tool count:', error)
    toolCount = undefined
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* ヘッダー */}
      <Header />

      {/* メインコンテンツ */}
      <main className="flex-1">
        {/* ヒーローセクション */}
        <HeroSection toolCount={toolCount} />

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
