import { useState, useEffect } from 'react';
import { useRadioBoss } from '@/hooks/useRadioBoss';
import { useTransmissionHistory } from '@/hooks/useTransmissionHistory';
import { useHotSongs } from '@/hooks/useHotSongs';
import Navigation from '@/components/Navigation';
import { SEO } from '@/components/SEO';
import { VideoHero } from '@/components/VideoHero';
import { FeaturedCard } from '@/components/FeaturedCard';
import { ExperienceCard } from '@/components/ExperienceCard';
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
import { SongCarousel } from '@/components/SongCarousel';
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
  
  // Data hooks - fetch more data for mobile scrolling
  const { data: historyData, isLoading: historyLoading, isFetching, refetch } = useTransmissionHistory({
    limit: 50, // Increased from 20 to allow loading more items
    searchQuery: '',
    selectedDate: 'all',
    selectedHour: 'all',
  });

  const { data: hotSongsData, isLoading: hotSongsLoading } = useHotSongs(40); // Increased from 20 to support full Hot 40

  // ... rest of the component ...

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

  // Listen for logo click to reset mobile tab to 'player'
  useEffect(() => {
    const handleResetMobileTab = () => {
      setMobileTab('player');
    };
    
    window.addEventListener('resetMobileTab', handleResetMobileTab);
    return () => {
      window.removeEventListener('resetMobileTab', handleResetMobileTab);
    };
  }, []);

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
    <div className="min-h-screen bg-black pb-20 md:pb-0">
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
      <div className="md:hidden bg-black">
        {mobileTab === 'player' && (
          <section className="px-4 pt-6 pb-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {isLoading && !nowPlaying ? (
              <NowPlayingSkeleton />
            ) : (
              <NowPlaying transmission={nowPlaying} isLive={isLive} />
            )}
          </section>
        )}
        
        {mobileTab === 'history' && (
          <ScrollArea className="h-[calc(100vh-180px)] bg-black">
            <div className="px-4 py-6">
              <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">PLAYLIST</h2>
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
          <ScrollArea className="h-[calc(100vh-180px)] bg-black">
            <div className="px-4 py-6">
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-white">HEADY HOT 40 🔥</h2>
            <p className="mb-4 text-white/70">Top tracks from the last 7 days</p>

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
                    <div key={song.id} className="relative pt-3">
                      <div className="absolute top-0 -left-1 z-20 bg-primary text-primary-foreground font-black text-sm px-3 py-1 rounded-full border-2 border-background shadow-lg">
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
              <div className="border border-white/20 rounded-xl p-12 text-center bg-gray-900/50">
                <p className="text-lg text-white/60">No hot tracks available yet</p>
              </div>
            )}
            </div>
          </ScrollArea>
        )}

        {mobileTab === 'shows' && (
          <ScrollArea className="h-[calc(100vh-180px)] bg-black">
            <div className="px-4 py-6">
            <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-white">Shows</h2>
            <p className="mb-6 text-white/70">Your guide to HEADY.FM programming</p>

            <div className="space-y-6">
              {/* Night Treats Show */}
              <div className="border border-white/20 rounded-xl overflow-hidden bg-gray-900/80">
                <div className="p-6 space-y-4">
                  <h3 className="text-2xl font-bold text-white">Night Treats</h3>
                  <p className="text-white/80">
                    Late night electronic music journey featuring deep house, progressive house, tech house, and experimental beats.
                  </p>

                  {/* DJs */}
                  <div className="space-y-3">
                    <h4 className="font-bold uppercase text-sm tracking-wide text-white/60">Featured DJs</h4>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={rouxbaisImage} 
                          alt="Rouxbais"
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                        />
                        <p className="font-bold text-white">Rouxbais</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <img 
                          src={daleImage} 
                          alt="Dale"
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                        />
                        <p className="font-bold text-white">Dale</p>
                      </div>
                    </div>
                  </div>

                  {/* Air Time */}
                  <div className="pt-4 border-t border-white/20">
                    <p className="text-sm font-bold mb-2 uppercase tracking-wide text-white/60">Air Time</p>
                    <p className="text-lg font-bold text-primary">Friday at 10:00 PM ET</p>
                  </div>

                  {/* Replays */}
                  <div className="pt-4 border-t border-white/20">
                    <p className="text-sm font-bold mb-2 uppercase tracking-wide text-white/60">Replays</p>
                    <ul className="space-y-1 text-sm text-white/80">
                      <li>• Fridays: 11:00 PM</li>
                      <li>• Saturdays: 12:00 AM, 1:00 AM, 3:00 AM</li>
                      <li>• Sundays: 1:00 AM</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </ScrollArea>
        )}
        
        {mobileTab === 'support' && <MobileSupportTab />}
      </div>

      {/* ===== SECTION 1: HERO - Full Width Video ===== */}
      <section className="relative w-full overflow-visible hidden md:block">
        {/* SEO H1 - Visually hidden but present for SEO */}
        <h1 className="sr-only">HEADY.FM: Commercial-Free Indie Rock Radio</h1>
        <VideoHero />
      </section>

      {/* ===== SECTION 2: ON AIR NOW (with Experience Card) ===== */}
      <section className="hidden md:block py-4 lg:py-6">
        <div className="px-4">
          {error && (
            <div className="mb-8 p-6 rounded-xl bg-destructive/10 border-4 border-destructive">
              <p className="font-bold text-lg mb-1 text-white">Transmission Error</p>
              <p className="opacity-80 text-white">{error}</p>
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Experience Card - 25% */}
            <div className="w-full lg:w-1/4">
              <ExperienceCard />
            </div>
            
            {/* On Air Now - 75% */}
            <div className="w-full lg:w-3/4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 rounded-2xl border border-white/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-white/20 rounded-full" />
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-white">
                  On Air Now
                </h2>
                <div className="h-px flex-1 bg-white/20 rounded-full" />
              </div>
              
              {isLoading && !nowPlaying ? (
                <NowPlayingSkeleton />
              ) : (
                <NowPlaying transmission={nowPlaying} isLive={isLive} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 3: FEATURED + SUPPORT (75/25 split) ===== */}
      <section className="hidden md:block py-4 lg:py-6">
        <div className="px-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Featured Card - 75% */}
            <div className="w-full lg:w-3/4">
              <FeaturedCard />
            </div>
            
            {/* Support Sidebar - 25% */}
            <div className="w-full lg:w-1/4 min-h-[500px]">
              <SupportSidebar />
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 4: RECENTLY PLAYED ===== */}
      <section id="transmission-history" className="hidden md:block py-4 lg:py-6">
        <div className="px-4">
          <div className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 p-8 rounded-2xl border border-white/10">
            <SongCarousel
              title="PLAYLIST"
              subtitle="Recently played tracks"
              items={transmissions}
              isLoading={historyLoading}
              viewAllLink="/playlist"
              viewAllText="Browse Full History"
              limit={20}
            />
          </div>
        </div>
      </section>

      {/* ===== SECTION 5: HOT 40 ===== */}
      <section id="hot-40-section" className="hidden md:block py-4 lg:py-6">
        <div className="px-4">
          <div className="bg-gradient-to-br from-gray-900/80 via-gray-800/60 to-gray-900/80 p-8 rounded-2xl border border-white/10">
            <SongCarousel
              title="HEADY HOT 40 🔥"
              subtitle="Top tracks from the last 7 days"
              items={hotSongsData || []}
              isLoading={hotSongsLoading}
              viewAllLink="/hot-40"
              viewAllText="Browse Full Chart"
              numbered={true}
              limit={20}
            />
          </div>
        </div>
      </section>

      {/* Footer - Desktop Only */}
      <footer className="hidden md:block border-t border-white/10 py-12 mt-8">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-black text-white">
              HEADY EXTRATERRESTRIAL RADIO
            </h3>
            <div className="pt-4 text-sm text-white/40">
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
