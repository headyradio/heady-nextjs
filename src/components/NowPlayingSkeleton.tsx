import { Skeleton } from '@/components/ui/skeleton';

export const NowPlayingSkeleton = () => {
  return (
    <div className="border-striped rounded-2xl overflow-hidden">
      <div className="bg-card">
        <div className="grid md:grid-cols-2 gap-8 p-8 lg:p-12">
          {/* Album Art Skeleton */}
          <div className="flex items-center justify-center relative">
            <div className="w-full max-w-md aspect-square">
              <Skeleton className="w-full h-full rounded-xl" />
            </div>
          </div>

          {/* Track Info Skeleton */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
            
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-8 w-2/3" />
            </div>

            <div className="flex gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>

            <div className="flex gap-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>

            <Skeleton className="h-6 w-48" />
          </div>
        </div>
      </div>
    </div>
  );
};
