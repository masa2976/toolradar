import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function TagPageLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* パンくずリストのスケルトン */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <span>/</span>
        <Skeleton className="h-4 w-16" />
        <span>/</span>
        <Skeleton className="h-4 w-24" />
      </div>
      
      {/* ヘッダーのスケルトン */}
      <div className="mb-8">
        <Skeleton className="h-10 w-64 mb-2" />
        <Skeleton className="h-4 w-full max-w-2xl mb-4" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      
      {/* タブのスケルトン */}
      <div className="mb-6">
        <Skeleton className="h-10 w-full max-w-md" />
      </div>
      
      {/* コンテンツのスケルトン */}
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
