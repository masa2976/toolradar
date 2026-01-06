import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Skeleton className="h-4 w-48" />
      </div>
      
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-lg p-6">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
