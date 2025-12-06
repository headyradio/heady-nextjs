import { useRef, useEffect } from 'react';
import { Transmission } from '@/hooks/useRadioBoss';
import { TransmissionCard } from './TransmissionCard';
import { TransmissionCardSkeleton } from './TransmissionCardSkeleton';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface TransmissionLogProps {
  transmissions: Transmission[];
  displayLimit?: number;
  isLoadingMore?: boolean;
  isFetching?: boolean;
  handleLoadMore?: () => void;
  totalCount?: number;
}

export const TransmissionLog = ({ 
  transmissions,
  displayLimit,
  isLoadingMore,
  isFetching,
  handleLoadMore,
  totalCount
}: TransmissionLogProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousCountRef = useRef(transmissions.length);
  const scrollPositionRef = useRef(0);

  // Save scroll position before loading more
  useEffect(() => {
    if (isLoadingMore && containerRef.current) {
      const scrollParent = containerRef.current.closest('[data-radix-scroll-area-viewport]');
      if (scrollParent) {
        scrollPositionRef.current = scrollParent.scrollTop;
      }
    }
  }, [isLoadingMore]);

  // Restore scroll position after new items load
  useEffect(() => {
    if (!isLoadingMore && transmissions.length > previousCountRef.current && containerRef.current) {
      const scrollParent = containerRef.current.closest('[data-radix-scroll-area-viewport]');
      if (scrollParent && scrollPositionRef.current > 0) {
        // Keep the scroll position where it was
        scrollParent.scrollTop = scrollPositionRef.current;
      }
    }
    previousCountRef.current = transmissions.length;
  }, [transmissions.length, isLoadingMore]);

  if (transmissions.length === 0) {
    return (
      <div className="border-bold rounded-xl p-12 text-center bg-card">
        <p className="text-lg opacity-60">No recent transmissions detected</p>
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {transmissions.map((transmission, index) => (
          <TransmissionCard key={transmission.id} transmission={transmission} index={index} />
        ))}
      </div>
      
      {/* Loading More Skeletons */}
      {isLoadingMore && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-4 md:mt-6 animate-fade-in">
          {Array.from({ length: 8 }).map((_, i) => (
            <TransmissionCardSkeleton key={`loading-${i}`} />
          ))}
        </div>
      )}
      
      {/* Load More Button */}
      {handleLoadMore && displayLimit && !isLoadingMore && displayLimit < 168 && transmissions.length > 0 && (
        <div className="mt-6 md:mt-8 text-center animate-fade-in">
          <Button
            onClick={handleLoadMore}
            size="lg"
            variant="outline"
            className="font-bold px-8 group hover-scale"
            disabled={isFetching}
          >
            {isFetching ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                Loading...
              </>
            ) : (
              <>
                Load More Transmissions
                <span className="ml-2 transition-transform group-hover:translate-y-0.5">↓</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
