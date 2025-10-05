'use client';

import { useTools, useWeeklyRanking, useBlogPosts } from '@/hooks';

/**
 * API接続テストページ
 * Django REST Framework APIとの接続を確認
 */
export default function TestApiPage() {
  // カスタムフックでデータ取得
  const { 
    data: tools, 
    isPending: toolsLoading, 
    error: toolsError 
  } = useTools({ limit: 5 });

  const { 
    data: ranking, 
    isPending: rankingLoading, 
    error: rankingError 
  } = useWeeklyRanking();

  const { 
    data: posts, 
    isPending: postsLoading, 
    error: postsError 
  } = useBlogPosts({ limit: 5 });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧪 API接続テスト
          </h1>
          <p className="text-gray-600">
            Django REST Framework APIとTanStack Queryの動作確認
          </p>
        </header>

        <div className="grid gap-8">
          {/* ツール一覧セクション */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              🔧 ツール一覧
              <span className="ml-2 text-sm text-gray-500 font-normal">
                (useTools)
              </span>
            </h2>

            {toolsLoading && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                読み込み中...
              </div>
            )}

            {toolsError && (
              <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
                ❌ エラー: {String(toolsError)}
              </div>
            )}

            {tools && (
              <div>
                <div className="mb-4 text-sm text-gray-600">
                  <span className="font-medium">総件数:</span> {tools.count}
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          名前
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          プラットフォーム
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          タイプ
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          価格
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tools.results.map((tool) => (
                        <tr key={tool.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {tool.id}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {tool.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {tool.platform.toUpperCase()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {tool.tool_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {tool.price_type === 'free' ? (
                              <span className="text-green-600 font-medium">無料</span>
                            ) : (
                              tool.price || '有料'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* 週間ランキングセクション */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              🏆 週間ランキング
              <span className="ml-2 text-sm text-gray-500 font-normal">
                (useWeeklyRanking)
              </span>
            </h2>

            {rankingLoading && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                読み込み中...
              </div>
            )}

            {rankingError && (
              <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
                ❌ エラー: {String(rankingError)}
              </div>
            )}

            {ranking && (
              <div>
                <div className="mb-4 text-sm text-gray-600">
                  <span className="font-medium">更新日時:</span>{' '}
                  {new Date(ranking.updated_at).toLocaleString('ja-JP')}
                </div>

                <div className="space-y-3">
                  {ranking.rankings.slice(0, 10).map((item) => (
                    <div
                      key={item.rank}
                      className="flex items-center justify-between border-b border-gray-200 pb-3 last:border-b-0"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 text-center">
                          <span className="text-2xl font-bold text-gray-900">
                            {item.rank}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            {item.rank_change}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.tool.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.tool.platform.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-blue-600">
                          {item.score.toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-500">
                          PV: {item.week_views} / Share: {item.week_shares}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ブログ記事セクション */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              📝 ブログ記事
              <span className="ml-2 text-sm text-gray-500 font-normal">
                (useBlogPosts)
              </span>
            </h2>

            {postsLoading && (
              <div className="flex items-center text-blue-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                読み込み中...
              </div>
            )}

            {postsError && (
              <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
                ❌ エラー: {String(postsError)}
              </div>
            )}

            {posts && (
              <div>
                <div className="mb-4 text-sm text-gray-600">
                  <span className="font-medium">総件数:</span> {posts.count}
                </div>

                <div className="space-y-4">
                  {posts.results.map((post) => (
                    <div
                      key={post.id}
                      className="border-l-4 border-blue-500 pl-4 hover:bg-gray-50 py-2"
                    >
                      <h3 className="font-medium text-gray-900 mb-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                          {post.category}
                        </span>
                        <span>
                          {new Date(post.published_at).toLocaleDateString('ja-JP')}
                        </span>
                        <span>👁️ {post.view_count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* デバッグ情報 */}
          <section className="bg-gray-100 rounded-lg p-6 text-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              🔍 デバッグ情報
            </h2>
            <div className="space-y-2 text-gray-700">
              <div>
                <span className="font-medium">API Base URL:</span>{' '}
                {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
              </div>
              <div>
                <span className="font-medium">Node ENV:</span>{' '}
                {process.env.NODE_ENV}
              </div>
              <div className="mt-4 p-3 bg-white rounded border border-gray-300">
                <p className="font-medium mb-2">✅ 確認項目:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Django Backend (http://localhost:8000) が起動しているか</li>
                  <li>CORS設定でhttp://localhost:3000が許可されているか</li>
                  <li>データベースにツール・ランキングデータがあるか</li>
                  <li>TanStack Query DevToolsを開いて確認（画面左下）</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
