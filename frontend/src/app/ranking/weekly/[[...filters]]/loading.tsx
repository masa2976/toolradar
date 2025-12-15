import { Trophy } from 'lucide-react';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ヘッダースケルトン */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
      </div>

      {/* タブスケルトン */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>

      {/* ランキングカードスケルトン */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex items-start gap-4">
              {/* ランク */}
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
              
              {/* 画像 */}
              <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
              
              {/* テキスト */}
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
                <div className="flex gap-1">
                  <div className="h-5 w-12 bg-gray-100 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
              
              {/* スコア */}
              <div className="hidden sm:block">
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
