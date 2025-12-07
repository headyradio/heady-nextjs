import { useState, useEffect } from 'react';
import { useRadioBoss } from '@/hooks/useRadioBoss';
import { useTransmissionHistory } from '@/hooks/useTransmissionHistory';
import { useHotSongs } from '@/hooks/useHotSongs';
import Navigation from '@/components/Navigation';
import { SEO } from '@/components/SEO';
import { HeroCarousel } from '@/components/HeroCarousel';
import { FeaturesSection } from '@/components/FeaturesSection';
import { SupportSection } from '@/components/SupportSection';
import { SupportSidebar } from '@/components/SupportSidebar';
import { NowPlaying } from '@/components/NowPlaying';
import { NowPlayingSkeleton } from '@/components/NowPlayingSkeleton';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobileSupportTab } from '@/components/MobileSupportTab';
import { FloatingChatWidget } from '@/components/FloatingChatWidget';
import { DonationBanner } from '@/components/DonationBanner';
import { TransmissionLog } from '@/components/TransmissionLog';
import { TransmissionCard } from '@/components/TransmissionCard';
import { TransmissionCardSkeleton } from '@/components/TransmissionCardSkeleton';
import { TransmissionSearch } from '@/components/TransmissionSearch';
import { TransmissionDateTimeFilter } from '@/components/TransmissionDateTimeFilter';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { RefreshCw } from 'lucide-react';
import rouxbaisImage from '@/assets/rouxbais.png';
import daleImage from '@/assets/dale.png';

const Index = () => {
  const [mobileTab, setMobileTab] = useState<'player' | 'history' | 'hot40' | 'shows' | 'support'>('player');
  const { nowPlaying, stationName, listenersCount, isLive, isLoading, error } = useRadioBoss();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedHour, setSelectedHour] = useState('all');
  const [displayLimit, setDisplayLimit] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Hot Songs state
  const [hotSongsDisplayLimit, setHotSongsDisplayLimit] = useState(10);
  const [isLoadingMoreHot, setIsLoadingMoreHot] = useState(false);
  
  const { data: historyData, isLoading: historyLoading, isFetching, refetch } = useTransmissionHistory({
    limit: displayLimit,
    searchQuery,
    selectedDate,
    selectedHour,
  });

  const { data: hotSongsData, isLoading: hotSongsLoading } = useHotSongs(40);

  // Update browser tab title with currently playing song
  useEffect(() => {
    if (nowPlaying && nowPlaying.artist && nowPlaying.title) {
      document.title = `${nowPlaying.artist} - ${nowPlaying.title} | HEADY.FM`;
    } else {
      document.title = 'HEADY.FM - Commercial-Free Indie Rock Radio';
    }
    
    // Cleanup on unmount
    return () => {
      document.title = 'HEADY.FM - Commercial-Free Indie Rock Radio';
    };
  }, [nowPlaying]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    setDisplayLimit(prev => prev + 12);
    // Small delay to show loading state
    setTimeout(() => setIsLoadingMore(false), 800);
  };

  const handleLoadMoreHot = async () => {
    setIsLoadingMoreHot(true);
    setHotSongsDisplayLimit(prev => Math.min(prev + 10, 40));
    // Small delay to show loading state
    setTimeout(() => setIsLoadingMoreHot(false), 800);
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
        title={nowPlaying && nowPlaying.artist && nowPlaying.title 
          ? `${nowPlaying.artist} - ${nowPlaying.title} | HEADY.FM`
          : "HEADY.FM - Commercial-Free Indie Rock Radio"}
        description="Stream commercial-free music 24/7 on HEADY.FM. Discover underground music, your favorite tracks, emerging artists, and deep cuts without interruptions. Listen online now."
        url="https://heady.fm"
        type="website"
      />
      {/* Navigation with Audio Player */}
      <Navigation />

      {/* Mobile: Tab Content */}
      <div className="md:hidden">
        {mobileTab === 'player' && (
          <section className="px-4 pt-6 pb-4">
            {isLoading && !nowPlaying ? (
              <NowPlayingSkeleton />
            ) : (
              <NowPlaying transmission={nowPlaying} isLive={isLive} />
            )}
          </section>
        )}
        
        {mobileTab === 'history' && (
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="px-4 py-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black uppercase tracking-tight">Transmission History</h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => refetch()}
                        variant="ghost"
                        size="icon"
                        disabled={isFetching}
                      >
                        <RefreshCw className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">
                        Not seeing recent updates? Your browser may be displaying cached data. Click to refresh and load the latest transmission log.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              {/* Filters */}
              <div className="mb-4 flex flex-col gap-3">
                <TransmissionSearch 
                  value={searchQuery} 
                  onChange={setSearchQuery}
                />
                <TransmissionDateTimeFilter
                  selectedDate={selectedDate}
                  selectedHour={selectedHour}
                  onDateChange={setSelectedDate}
                  onHourChange={setSelectedHour}
                />
              </div>

              {/* Content */}
              {historyLoading && transmissions.length === 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="font-bold">Loading...</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
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
            </div>
          </ScrollArea>
        )}

        {mobileTab === 'hot40' && (
          <div className="px-4 py-6">
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight">HEADY HOT 40 🔥</h2>
            <p className="mb-4 opacity-70">Top tracks from the last 7 days</p>

            {/* Content */}
            {hotSongsLoading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="font-bold">Loading hot tracks...</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <TransmissionCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            ) : hotSongsData && hotSongsData.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hotSongsData.slice(0, hotSongsDisplayLimit).map((song, index) => (
                    <div key={song.id} className="relative">
                      <div className="absolute -top-2 -left-2 z-10 bg-primary text-primary-foreground font-black text-sm px-3 py-1 rounded-full border-2 border-background shadow-lg">
                        #{index + 1}
                      </div>
                      <TransmissionCard transmission={song} index={index} />
                    </div>
                  ))}
                </div>
                
                {isLoadingMoreHot && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 animate-fade-in">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <TransmissionCardSkeleton key={`loading-hot-${i}`} />
                    ))}
                  </div>
                )}
                
                {hotSongsDisplayLimit < 40 && hotSongsData.length > hotSongsDisplayLimit && (
                  <div className="mt-6 text-center animate-fade-in">
                    <Button
                      onClick={handleLoadMoreHot}
                      size="lg"
                      variant="outline"
                      className="font-bold px-8 group hover-scale w-full"
                      disabled={isLoadingMoreHot}
                    >
                      {isLoadingMoreHot ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          Load More Hot Tracks
                          <span className="ml-2 transition-transform group-hover:translate-y-0.5">↓</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="border-bold rounded-xl p-12 text-center bg-card">
                <p className="text-lg opacity-60">No hot tracks available yet</p>
              </div>
            )}
          </div>
        )}

        {mobileTab === 'shows' && (
          <div className="px-4 py-6">
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight">Shows</h2>
            <p className="mb-6 opacity-70">Your guide to HEADY.FM programming</p>

            <div className="space-y-6">
              {/* Night Treats Show */}
              <div className="border-bold rounded-xl overflow-hidden bg-card">
                <div className="p-6 space-y-4">
                  <h3 className="text-2xl font-bold">Night Treats</h3>
                  <p className="opacity-80">
                    Late night electronic music journey featuring deep house, progressive house, tech house, and experimental beats.
                  </p>

                  {/* DJs */}
                  <div className="space-y-3">
                    <h4 className="font-bold uppercase text-sm tracking-wide opacity-60">Featured DJs</h4>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={rouxbaisImage} 
                          alt="Rouxbais"
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                        />
                        <p className="font-bold">Rouxbais</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <img 
                          src={daleImage} 
                          alt="Dale"
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                        />
                        <p className="font-bold">Dale</p>
                      </div>
                    </div>
                  </div>

                  {/* Air Time */}
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-sm font-bold mb-2 uppercase tracking-wide opacity-60">Air Time</p>
                    <p className="text-lg font-bold text-primary">Friday at 10:00 PM ET</p>
                  </div>

                  {/* Replays */}
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-sm font-bold mb-2 uppercase tracking-wide opacity-60">Replays</p>
                    <ul className="space-y-1 text-sm opacity-80">
                      <li>• Fridays: 11:00 PM</li>
                      <li>• Saturdays: 12:00 AM, 1:00 AM, 3:00 AM</li>
                      <li>• Sundays: 1:00 AM</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {mobileTab === 'support' && <MobileSupportTab />}
      </div>

      {/* Hero Section with Carousel and Support Sidebar - Desktop Only */}
      <section className="relative w-full overflow-hidden hidden md:block">
        {/* SEO H1 - Visually hidden but present for SEO */}
        <h1 className="sr-only">HEADY.FM: Commercial-Free Indie Rock Radio</h1>
        
        <div className="flex flex-col lg:flex-row">
          {/* Vertical Carousel - 75% width on desktop */}
          <div className="w-full lg:w-3/4">
            <HeroCarousel />
          </div>
          
          {/* Support Sidebar - 25% width on desktop */}
          <div className="w-full lg:w-1/4 lg:h-[80vh] lg:min-h-[600px] p-4 lg:p-6 bg-background/50">
            <SupportSidebar />
          </div>
        </div>
      </section>

      {/* Features Section - Desktop Only */}
      <div className="hidden md:block">
        <FeaturesSection />
      </div>

      {/* Desktop: Main Content with On Air Now */}
      <main className="container mx-auto px-4 py-8 lg:py-12 hidden md:block">
        {error && (
          <div className="mb-8 p-6 rounded-xl bg-destructive/10 border-4 border-destructive">
            <p className="font-bold text-lg mb-1">Transmission Error</p>
            <p className="opacity-80">{error}</p>
          </div>
        )}

        {/* Now Playing Section - Desktop */}
        <section className="mb-16 bg-gradient-sunrise p-8 rounded-2xl border-bold-primary">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-1 flex-1 bg-foreground/20 rounded-full" />
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-foreground">
              On Air Now
            </h2>
            <div className="h-1 flex-1 bg-foreground/20 rounded-full" />
          </div>
          
          {isLoading && !nowPlaying ? (
            <NowPlayingSkeleton />
          ) : (
            <NowPlaying transmission={nowPlaying} isLive={isLive} />
          )}
        </section>
      </main>

      {/* Support Section - Desktop Only */}
      <div className="hidden md:block">
        <SupportSection />
      </div>

      {/* Desktop: Main Content with Hot Songs and Transmission History */}
      <main className="container mx-auto px-4 pb-8 lg:pb-12 hidden md:block">
        {/* HEADY HOT 40 Section */}
        <section id="hot-40-section" className="mt-8 md:mt-16">
          {/* Section Header */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight">
              HEADY HOT 40 🔥
            </h2>
            <p className="mt-2 text-lg opacity-70">Top tracks from the last 7 days</p>
          </div>

          {/* Content */}
          {hotSongsLoading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="font-bold">Loading hot tracks...</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <TransmissionCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : hotSongsData && hotSongsData.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {hotSongsData.slice(0, hotSongsDisplayLimit).map((song, index) => (
                  <div key={song.id} className="relative">
                    <div className="absolute -top-2 -left-2 z-10 bg-primary text-primary-foreground font-black text-sm px-3 py-1 rounded-full border-2 border-background shadow-lg">
                      #{index + 1}
                    </div>
                    <TransmissionCard transmission={song} index={index} />
                  </div>
                ))}
              </div>
              
              {/* Loading More Skeletons */}
              {isLoadingMoreHot && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-4 md:mt-6 animate-fade-in">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <TransmissionCardSkeleton key={`loading-hot-${i}`} />
                  ))}
                </div>
              )}
              
              {/* Load More Button */}
              {hotSongsDisplayLimit < 40 && hotSongsData.length > hotSongsDisplayLimit && (
                <div className="mt-6 md:mt-8 text-center animate-fade-in">
                  <Button
                    onClick={handleLoadMoreHot}
                    size="lg"
                    variant="outline"
                    className="font-bold px-8 group hover-scale"
                    disabled={isLoadingMoreHot}
                  >
                    {isLoadingMoreHot ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Hot Tracks
                        <span className="ml-2 transition-transform group-hover:translate-y-0.5">↓</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="border-bold rounded-xl p-12 text-center bg-card">
              <p className="text-lg opacity-60">No hot tracks available yet</p>
            </div>
          )}
        </section>

        {/* Transmission History Section */}
        <section id="transmission-history" className="mt-16 md:mt-24">
          {/* Section Header */}
          <div className="mb-6 md:mb-8 flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight">
              Transmission History
            </h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    size="sm"
                    disabled={isFetching}
                    className="font-bold"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    Not seeing recent updates? Your browser may be displaying cached data. Click the refresh button to load the latest transmission log.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Filters */}
          <div className="mb-4 md:mb-6 flex flex-col gap-3 md:gap-4">
            <div className="w-full">
              <TransmissionSearch 
                value={searchQuery} 
                onChange={setSearchQuery}
              />
            </div>
            <TransmissionDateTimeFilter
              selectedDate={selectedDate}
              selectedHour={selectedHour}
              onDateChange={setSelectedDate}
              onHourChange={setSelectedHour}
            />
          </div>

          {/* Content */}
          {historyLoading && !transmissions.length ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-primary">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="font-bold">Loading transmissions...</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <TransmissionCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : transmissions.length > 0 ? (
              <TransmissionLog 
                transmissions={transmissions}
                displayLimit={displayLimit}
                isLoadingMore={isLoadingMore}
                isFetching={isFetching}
                handleLoadMore={handleLoadMore}
              />
          ) : (
            <div className="border-bold rounded-xl p-12 text-center bg-card">
              <p className="text-lg opacity-60">
                {searchQuery || selectedDate !== 'all' || selectedHour !== 'all' 
                  ? 'No tracks found matching your filters' 
                  : 'No transmission history yet'}
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Footer - Desktop Only */}
      <footer className="hidden md:block border-t-4 border-primary bg-secondary py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-black text-secondary-foreground">
              HEADY EXTRATERRESTRIAL RADIO
            </h3>
            <div className="pt-4 text-sm text-secondary-foreground/60">
              © {new Date().getFullYear()} HEADY Radio. All transmissions received and logged.
            </div>
          </div>
        </div>
      </footer>

      <FloatingChatWidget />
      <DonationBanner />
      <MobileBottomNav activeTab={mobileTab} onTabChange={setMobileTab} />
    </div>
  );
};

export default Index;
