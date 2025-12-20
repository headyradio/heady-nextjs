import * as React from 'react';
import { Play, Square, Volume2, VolumeX, Menu, X, Heart, User, LogOut, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useGlobalAudioPlayer } from '@/contexts/AudioPlayerContext';
import { AlbumArtImage } from '@/components/AlbumArtImage';
import SaveSongButton from '@/components/SaveSongButton';
import headyLogo from '@/assets/heady-logo.svg';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfile';
import { useRadioBoss } from '@/hooks/useRadioBoss';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navigation = () => {
  const { nowPlaying, isLive } = useRadioBoss();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [volumeOpen, setVolumeOpen] = React.useState(false);
  
  const audioPlayer = useGlobalAudioPlayer();
  const { user, signOut } = useAuth();
  const { profile } = useProfile(user?.id);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const goToSection = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollToId(id), 300);
      return;
    }
    scrollToId(id);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b-4 border-secondary shadow-lg" style={{ backgroundColor: '#4a148c' }}>
      <div className="container mx-auto px-4">
        <div className="relative flex h-20 items-center justify-between md:justify-start gap-4">
          {/* Logo - Absolutely centered on mobile, normal flow on desktop */}
          <div className="absolute left-1/2 -translate-x-1/2 md:static md:transform-none flex items-center gap-3">
            <Link 
              to="/" 
              onClick={() => {
                // If already on home page, scroll to top and trigger custom event to reset mobile tab
                if (location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  // Dispatch custom event that Index.tsx can listen to
                  window.dispatchEvent(new CustomEvent('resetMobileTab'));
                }
              }}
            >
              <img src={headyLogo} alt="HEADY Radio" className="h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>
          </div>

          {/* Center: Audio Player & Track Info (Desktop) */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-4 max-w-2xl">
            {/* Circular Play/Stop Button */}
            <Button
              onClick={audioPlayer.togglePlay}
              size="icon"
              variant="default"
              aria-label={audioPlayer.isPlaying ? "Stop audio stream" : "Play audio stream"}
              className="relative overflow-hidden w-14 h-14 rounded-full border-2 shadow-lg hover:opacity-90 transition"
              style={{ backgroundColor: '#288b5a', borderColor: '#288b5a' }}
              disabled={audioPlayer.isBuffering}
            >
              {audioPlayer.isPlaying ? (
                <Square className="h-6 w-6 text-white fill-white" aria-hidden="true" />
              ) : (
                <Play className="h-6 w-6 text-white fill-white" aria-hidden="true" />
              )}
              {audioPlayer.connectionStatus === 'streaming' && (
                <div className="absolute inset-0 bg-[rgba(40,139,90,0.24)] animate-pulse rounded-full" aria-hidden="true" />
              )}
            </Button>

            {/* Current Track */}
            {nowPlaying ? (
              <div className="flex-1 min-w-0 border-l-2 border-white/30 pl-6 flex items-center gap-3">
                <AlbumArtImage
                  key={`nav-${nowPlaying.title}-${nowPlaying.artist}`}
                  url={nowPlaying.album_art_url}
                  artworkId={nowPlaying.artwork_id}
                  artist={nowPlaying.artist}
                  title={nowPlaying.title}
                  alt={`${nowPlaying.title} album art`}
                  className="w-12 h-12 rounded-md flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-1">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 border border-green-500">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-green-500 font-bold text-[10px] uppercase tracking-wider">LIVE</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-white truncate">
                    {nowPlaying.title}
                  </div>
                  <div className="text-xs text-white truncate" style={{ opacity: 0.9 }}>
                    {nowPlaying.artist}
                  </div>
                </div>
                <SaveSongButton
                  artist={nowPlaying.artist}
                  title={nowPlaying.title}
                  album={nowPlaying.album}
                  albumArtUrl={nowPlaying.album_art_url}
                  artworkId={nowPlaying.artwork_id}
                  variant="ghost"
                  size="icon"
                />
                
              </div>
            ) : (
              <div className="flex-1 min-w-0 border-l-2 border-white/30 pl-6 flex items-center gap-3">
                <div className="w-12 h-12 rounded-md bg-white/10 animate-pulse flex-shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1">
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/15 border border-white/20">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      <span className="text-white/80 font-bold text-[10px] uppercase tracking-wider">Loading</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40 bg-white/20" />
                    <Skeleton className="h-3 w-28 bg-white/20" />
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" aria-hidden="true" />
              </div>
            )}

            {/* Volume Control */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={audioPlayer.toggleMute}
                onMouseEnter={() => setVolumeOpen(true)}
                aria-label={audioPlayer.isMuted || audioPlayer.volume === 0 ? "Unmute audio" : "Mute audio"}
                aria-expanded={volumeOpen}
                className="text-white hover:bg-white/20"
              >
                {audioPlayer.isMuted || audioPlayer.volume === 0 ? (
                  <VolumeX className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Volume2 className="h-5 w-5" aria-hidden="true" />
                )}
              </Button>
              
              {volumeOpen && (
                <div
                  className="absolute top-full right-0 mt-2 p-4 bg-gray-900 border border-white/20 rounded-xl shadow-lg w-48"
                  onMouseEnter={() => setVolumeOpen(true)}
                  onMouseLeave={() => setVolumeOpen(false)}
                >
                  <Slider
                    value={[audioPlayer.volume * 100]}
                    onValueChange={(values) => audioPlayer.setVolume(values[0] / 100)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right: Status & Menu (desktop cleaned) */}
          <div className="flex items-center gap-4 ml-auto">
            {/* User Menu / Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden lg:inline-flex items-center gap-3 rounded-full hover:bg-white/20 px-3 py-2"
                  >
                    <Avatar className="h-9 w-9 ring-2 ring-white/30">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white font-semibold truncate max-w-[140px]">
                      {profile?.display_name || profile?.username || 'User'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-64 bg-gray-900 border border-white/20 shadow-xl z-[100]"
                  sideOffset={8}
                >
                  <div className="px-4 py-3 bg-white/5 border-b border-white/10">
                    <p className="text-sm font-bold text-white">
                      @{profile?.username || 'user'}
                    </p>
                    {profile?.display_name && (
                      <p className="text-xs text-white/60 mt-0.5">
                        {profile.display_name}
                      </p>
                    )}
                  </div>
                  <div className="py-2">
                    <DropdownMenuItem 
                      onClick={() => navigate('/saved-songs')}
                      className="cursor-pointer px-4 py-3 text-white hover:bg-white/10 focus:bg-white/10 focus:text-white"
                    >
                      <Heart className="mr-3 h-5 w-5" />
                      <span className="font-semibold">Saved Songs</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/profile')}
                      className="cursor-pointer px-4 py-3 text-white hover:bg-white/10 focus:bg-white/10 focus:text-white"
                    >
                      <User className="mr-3 h-5 w-5" />
                      <span className="font-semibold">Profile</span>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <div className="py-2">
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="cursor-pointer px-4 py-3 text-white hover:bg-red-500/20 focus:bg-red-500/20 focus:text-red-400"
                    >
                      <LogOut className="mr-3 h-5 w-5" />
                      <span className="font-semibold">Sign Out</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex text-white hover:bg-white/20"
                >
                  Sign In
                </Button>
              </Link>
            )}


            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-white/20"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
            </Button>
          </div>
        </div>

        {/* Secondary desktop nav (inspired by KEXP) */}
        <div className="hidden md:flex items-center gap-6 h-12 text-white border-t border-white/20 mt-2">
          <Link to="/playlist" aria-label="Go to Playlist">
            <Button
              variant="ghost"
              size="sm"
              className="px-3 font-semibold hover:bg-white/10"
            >
              Playlist
            </Button>
          </Link>
          <Link to="/hot-40" aria-label="Go to HEADY HOT 40">
            <Button
              variant="ghost"
              size="sm"
              className="px-3 font-semibold hover:bg-white/10"
            >
              HOT 40 🔥
            </Button>
          </Link>
          <Link to="/shows" aria-label="Go to Shows page" className="leading-none">
            <Button
              variant="ghost"
              size="sm"
              className="px-3 font-semibold hover:bg-white/10"
            >
              Shows
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="px-3 font-semibold hover:bg-white/10"
            onClick={() => goToSection('support-section')}
            aria-label="Jump to Support section"
          >
            Support
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-3 font-semibold hover:bg-white/10"
            onClick={() => {
              const event = new CustomEvent('open-live-chat');
              window.dispatchEvent(event);
            }}
            aria-label="Open live chat"
          >
            Live Chat
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t-2 border-white/30 space-y-4">
            {/* User Section Mobile */}
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-white font-semibold">
                    @{profile?.username || 'User'}
                  </div>
                </div>
                <Link to="/saved-songs" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="lg" className="w-full gap-2">
                    <Heart className="h-5 w-5" />
                    Saved Songs
                  </Button>
                </Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="lg" className="w-full gap-2">
                    <User className="h-5 w-5" />
                    Profile
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full gap-2"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="lg" className="w-full">
                  Sign In
                </Button>
              </Link>
            )}

            <Button
              onClick={audioPlayer.togglePlay}
              size="lg"
              variant="default"
              className="w-full"
            >
              {audioPlayer.isPlaying ? (
                <>
                  <Square className="h-5 w-5 mr-2" />
                  Stop Stream
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Listen Live
                </>
              )}
            </Button>

            {nowPlaying ? (
              <div className="p-4 bg-white/10 rounded-xl flex items-center gap-3">
                <AlbumArtImage
                  key={`nav-mobile-${nowPlaying.title}-${nowPlaying.artist}`}
                  url={nowPlaying.album_art_url}
                  artworkId={nowPlaying.artwork_id}
                  artist={nowPlaying.artist}
                  title={nowPlaying.title}
                  alt={`${nowPlaying.title} album art`}
                  className="w-16 h-16 rounded-md flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                      </span>
                      <span className="text-green-500 font-bold text-xs uppercase tracking-wider">LIVE</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-white">{nowPlaying.title}</div>
                  <div className="text-xs text-white" style={{ opacity: 0.9 }}>{nowPlaying.artist}</div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white/10 rounded-xl flex items-center gap-3">
                <div className="w-16 h-16 rounded-md bg-white/10 animate-pulse flex-shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 w-fit">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-50"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                    </span>
                    <span className="text-white/80 font-bold text-xs uppercase tracking-wider">Loading</span>
                  </div>
                  <Skeleton className="h-4 w-40 bg-white/20" />
                  <Skeleton className="h-3 w-28 bg-white/20" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
