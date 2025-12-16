import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { SEO } from '@/components/SEO';
import { useTransmissionHistory } from '@/hooks/useTransmissionHistory';
import { TransmissionLog } from '@/components/TransmissionLog';
import { TransmissionSearch } from '@/components/TransmissionSearch';
import { TransmissionDateTimeFilter } from '@/components/TransmissionDateTimeFilter';
import { TransmissionCardSkeleton } from '@/components/TransmissionCardSkeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const PlaylistPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedHour, setSelectedHour] = useState('all');
  const [displayLimit, setDisplayLimit] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const { data: historyData, isLoading, isFetching, refetch } = useTransmissionHistory({
    limit: displayLimit,
    searchQuery,
    selectedDate,
    selectedHour,
  });

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    setDisplayLimit(prev => prev + 12);
    // Small delay to show loading state
    setTimeout(() => setIsLoadingMore(false), 500);
  };

  const transmissions = historyData
    ?.filter(h => {
      const artist = h.artist?.toLowerCase() || '';
      const title = h.title?.toLowerCase() || '';
      return artist !== 'unknown artist' && title !== '- extraterrestrial radio';
    })
    .map(h => ({
      id: h.id,
      title: h.title,
      artist: h.artist,
      album: h.album,
      play_started_at: h.play_started_at,
      duration: h.duration,
      album_art_url: h.album_art_url,
      genre: h.genre,
      year: h.year,
      artwork_id: h.artwork_id,
      created_at: h.created_at,
    })) || [];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <SEO
        title="Playlist | Transmission Log | HEADY.FM"
        description="Browse the complete HEADY.FM broadcast history. Search for songs, artists, and explore what we've played recently."
        url="https://heady.fm/playlist"
      />
      
      <Navigation />

      <main className="container mx-auto px-4 py-8 lg:py-12">
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-4">
              PLAYLIST
            </h1>
            <p className="text-xl opacity-70 max-w-2xl">
              Complete transmission history. Every track, every artist, every moment.
            </p>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  size="lg"
                  disabled={isFetching}
                  className="font-bold border-2"
                >
                  <RefreshCw className={`h-5 w-5 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                  Refresh Log
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Click to check for the very latest tracks played on air.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Filters */}
        <div className="mb-8 md:mb-10 bg-card p-6 rounded-2xl border-2 border-border shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <TransmissionSearch 
                value={searchQuery} 
                onChange={setSearchQuery}
              />
            </div>
            <div className="lg:col-span-2">
              <TransmissionDateTimeFilter
                selectedDate={selectedDate}
                selectedHour={selectedHour}
                onDateChange={setSelectedDate}
                onHourChange={setSelectedHour}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading && transmissions.length === 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-primary mb-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="font-bold">Loading transmission log...</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <TransmissionCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : (
          <TransmissionLog 
            transmissions={transmissions}
            displayLimit={displayLimit}
            isLoadingMore={isLoadingMore}
            isFetching={isFetching}
            handleLoadMore={handleLoadMore}
            totalCount={historyData?.length || 0}
          />
        )}
      </main>
    </div>
  );
};

export default PlaylistPage;

