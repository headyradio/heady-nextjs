import { Skeleton } from '@/components/ui/skeleton';

export const NowPlayingSkeleton = () => {
  return (
    <div className="rounded-2xl overflow-hidden border-4" style={{ borderColor: '#4a148c' }}>
      <div className="bg-card h-[60vh] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-muted/30"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="font-bold text-lg text-muted-foreground animate-pulse">Establishing Connection...</p>
        </div>
      </div>
    </div>
  );
};
