import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { SEO } from '@/components/SEO';
import { useHotSongs } from '@/hooks/useHotSongs';
import { TransmissionCard } from '@/components/TransmissionCard';
import { TransmissionCardSkeleton } from '@/components/TransmissionCardSkeleton';
import { Button } from '@/components/ui/button';

const Hot40 = () => {
  const [displayLimit, setDisplayLimit] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { data: hotSongsData, isLoading } = useHotSongs(40);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    setDisplayLimit(prev => Math.min(prev + 10, 40));
    // Small delay to show loading state
    setTimeout(() => setIsLoadingMore(false), 500);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SEO
        title="HEADY HOT 40 | Top Tracks | HEADY.FM"
        description="Discover the most played tracks on HEADY.FM this week. The freshest indie rock, alternative, and electronic music chart."
        url="https://heady.fm/hot-40"
      />
      
      <Navigation />

      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-4">
            HEADY HOT 40 🔥
          </h1>
          <p className="text-xl opacity-70 max-w-2xl">
            The most played tracks on HEADY.FM from the last 7 days. Updated in real-time.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary mb-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="font-bold">Loading chart data...</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <TransmissionCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : hotSongsData && hotSongsData.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {hotSongsData.slice(0, displayLimit).map((song, index) => (
                <div key={song.id} className="relative group">
                  <div className="absolute -top-3 -left-3 z-10 bg-primary text-primary-foreground font-black text-lg w-10 h-10 flex items-center justify-center rounded-full border-4 border-background shadow-xl transform group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  <TransmissionCard transmission={song} index={index} />
                </div>
              ))}
            </div>
            
            {/* Loading More Skeletons */}
            {isLoadingMore && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-4 md:mt-6 animate-fade-in">
                {Array.from({ length: 4 }).map((_, i) => (
                  <TransmissionCardSkeleton key={`loading-hot-${i}`} />
                ))}
              </div>
            )}
            
            {/* Load More Button */}
            {displayLimit < 40 && hotSongsData.length > displayLimit && (
              <div className="mt-12 text-center animate-fade-in">
                <Button
                  onClick={handleLoadMore}
                  size="lg"
                  variant="outline"
                  className="font-bold px-12 py-6 text-lg border-2 hover:bg-primary hover:text-primary-foreground transition-all"
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Tracks
                      <span className="ml-2 transition-transform group-hover:translate-y-0.5">↓</span>
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {displayLimit >= 40 && (
              <div className="mt-16 text-center p-8 bg-card/50 rounded-2xl border-2 border-dashed border-border/50">
                <p className="text-xl font-bold opacity-60">
                  That's the top 40! Tune in to hear more.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="border-bold rounded-xl p-16 text-center bg-card">
            <p className="text-2xl font-bold opacity-60">No chart data available right now.</p>
            <p className="mt-2 opacity-50">Check back later or tune in live.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Hot40;

