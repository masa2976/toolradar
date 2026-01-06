import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Skeleton className="h-4 w-64" />
      </div>
      
      <div className="mb-8">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-full max-w-md mb-4" />
        <Skeleton className="h-4 w-24" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
