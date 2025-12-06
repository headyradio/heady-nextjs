import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const TransmissionCardSkeleton = () => {
  return (
    <Card className="border-bold overflow-hidden hover-lift bg-card">
      <div className="aspect-square relative">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </Card>
  );
};
