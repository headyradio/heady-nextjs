import * as React from 'react';
import { Play, Square, Volume2, VolumeX, Menu, X, Heart, User, LogOut, ChevronRight } from 'lucide-react';
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
import { SupportSidebar } from '@/components/SupportSidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const Navigation = () => {
  const { nowPlaying, isLive } = useRadioBoss();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [volumeOpen, setVolumeOpen] = React.useState(false);
  const [supportDialogOpen, setSupportDialogOpen] = React.useState(false);
  
  const audioPlayer = useGlobalAudioPlayer();
  const { user, signOut } = useAuth();
  const { profile } = useProfile(user?.id);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActiveLink = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full shadow-xl">
      {/* Main Navigation Bar */}
      <div className="bg-[#1a0a2e]">
        <div className="container mx-auto px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Left: Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link to="/playlist">
                <button 
                  className={`px-4 py-2 text-sm font-medium transition-colors hover:text-white ${
                    isActiveLink('/playlist') ? 'text-white' : 'text-white/70'
                  }`}
                >
                  Playlist
                </button>
              </Link>
              <Link to="/hot-40">
                <button 
                  className={`px-4 py-2 text-sm font-medium transition-colors hover:text-white ${
                    isActiveLink('/hot-40') ? 'text-white' : 'text-white/70'
                  }`}
                >
                  Hot 40
                </button>
              </Link>
              <Link to="/shows">
                <button 
                  className={`px-4 py-2 text-sm font-medium transition-colors hover:text-white ${
                    isActiveLink('/shows') ? 'text-white' : 'text-white/70'
                  }`}
                >
                  Shows
                </button>
              </Link>
              <button 
                className="px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
                onClick={() => {
                  const event = new CustomEvent('open-live-chat');
                  window.dispatchEvent(event);
                }}
                aria-label="Open live chat"
              >
                Live Chat
              </button>
            </div>

            {/* Center: Logo */}
            <div className="absolute left-1/2 -translate-x-1/2 md:static md:transform-none md:flex-1 md:flex md:justify-center">
              <Link 
                to="/" 
                onClick={() => {
                  if (location.pathname === '/') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    window.dispatchEvent(new CustomEvent('resetMobileTab'));
                  }
                }}
                className="flex items-center"
              >
                <img src={headyLogo} alt="HEADY Radio" className="h-10 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Support Button - Desktop */}
              <Button
                onClick={() => setSupportDialogOpen(true)}
                className="hidden md:inline-flex items-center gap-2 bg-[#e53935] hover:bg-[#c62828] text-white font-bold px-4 h-9"
                aria-label="Support HEADY.FM"
              >
                <Heart className="h-4 w-4" />
                <span className="text-sm font-bold">Support</span>
              </Button>

              {/* User Menu / Auth - Desktop */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden md:inline-flex text-white hover:bg-white/10 h-9 w-9"
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-56 bg-[#1a0a2e] border border-white/20 shadow-xl z-[100]"
                    sideOffset={8}
                  >
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-sm font-semibold text-white">
                        @{profile?.username || 'user'}
                      </p>
                      {profile?.display_name && (
                        <p className="text-xs text-white/60">{profile.display_name}</p>
                      )}
                    </div>
                    <div className="py-1">
                      <DropdownMenuItem 
                        onClick={() => navigate('/saved-songs')}
                        className="cursor-pointer px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Saved Songs</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate('/profile')}
                        className="cursor-pointer px-3 py-2 text-white/80 hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </div>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <div className="py-1">
                      <DropdownMenuItem 
                        onClick={handleSignOut}
                        className="cursor-pointer px-3 py-2 text-white/80 hover:bg-red-500/20 hover:text-red-400 focus:bg-red-500/20 focus:text-red-400"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth" className="hidden md:block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-white hover:bg-white/10 h-9 px-3 font-semibold"
                  >
                    MY HEADY
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-white/10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Now Playing Ticker Bar - Desktop */}
      <div className="hidden md:block bg-[#2d1b4e] border-t border-white/10">
        <div className="flex items-center h-11">
          {/* Play/Stop Button - Extends to very left edge */}
          <Button
            onClick={audioPlayer.togglePlay}
            className="h-11 px-16 rounded-none bg-[#2d5016] hover:bg-[#3a6b1f] text-white flex-shrink-0 border-r border-white/10"
            disabled={audioPlayer.isBuffering}
            aria-label={audioPlayer.isPlaying ? "Stop audio stream" : "Play live audio stream"}
          >
            {audioPlayer.isPlaying ? (
              <Square className="h-7 w-7 fill-current" />
            ) : (
              <Play className="h-7 w-7 fill-current ml-0.5" />
            )}
          </Button>

          {/* Container for rest of content with padding */}
          <div className="container mx-auto">
            <div className="flex items-center flex-1 px-4 gap-4">
              {/* LIVE Badge */}
              <div className="flex items-center gap-2 pr-4 border-r border-white/20">
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 border border-green-500">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-green-500 font-bold text-[10px] uppercase tracking-wider">LIVE</span>
                </div>
              </div>

            {/* Now Playing Info */}
            {nowPlaying ? (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <AlbumArtImage
                  key={`nav-${nowPlaying.title}-${nowPlaying.artist}`}
                  url={nowPlaying.album_art_url}
                  artworkId={nowPlaying.artwork_id}
                  artist={nowPlaying.artist}
                  title={nowPlaying.title}
                  alt={`${nowPlaying.title} album art`}
                  className="w-8 h-8 rounded flex-shrink-0"
                />
                <div className="min-w-0 flex items-center gap-2">
                  <span className="text-white font-medium text-sm truncate">{nowPlaying.artist}</span>
                  <span className="text-white/50">—</span>
                  <span className="text-white/80 text-sm truncate">{nowPlaying.title}</span>
                </div>
                
                {/* Animated Volume Waves - Only show when playing */}
                {audioPlayer.isPlaying && (
                  <div className="flex items-center gap-0.5 ml-2 h-4">
                    <div className="w-0.5 bg-green-500 rounded-full h-full origin-bottom" style={{ animation: 'volume-wave 0.8s ease-in-out infinite' }}></div>
                    <div className="w-0.5 bg-green-500 rounded-full h-full origin-bottom" style={{ animation: 'volume-wave 0.8s ease-in-out infinite 0.1s' }}></div>
                    <div className="w-0.5 bg-green-500 rounded-full h-full origin-bottom" style={{ animation: 'volume-wave 0.8s ease-in-out infinite 0.2s' }}></div>
                    <div className="w-0.5 bg-green-500 rounded-full h-full origin-bottom" style={{ animation: 'volume-wave 0.8s ease-in-out infinite 0.3s' }}></div>
                    <div className="w-0.5 bg-green-500 rounded-full h-full origin-bottom" style={{ animation: 'volume-wave 0.8s ease-in-out infinite 0.4s' }}></div>
                  </div>
                )}
                
                <div className="flex items-center gap-1 ml-2">
                  <SaveSongButton
                    artist={nowPlaying.artist}
                    title={nowPlaying.title}
                    album={nowPlaying.album}
                    albumArtUrl={nowPlaying.album_art_url}
                    artworkId={nowPlaying.artwork_id}
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white/60 hover:text-white"
                  />
                  <Link 
                    to={`/song/${encodeURIComponent(nowPlaying.artist)}/${encodeURIComponent(nowPlaying.title)}`}
                    className="text-white/60 hover:text-white transition-colors"
                    aria-label={`View song details for ${nowPlaying.title} by ${nowPlaying.artist}`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded bg-white/10 animate-pulse flex-shrink-0" />
                <Skeleton className="h-4 w-48 bg-white/10" />
              </div>
            )}

            {/* Volume Control */}
            <div className="relative flex items-center pl-4 border-l border-white/20">
              <Button
                variant="ghost"
                size="icon"
                onClick={audioPlayer.toggleMute}
                onMouseEnter={() => setVolumeOpen(true)}
                className="text-white/60 hover:text-white hover:bg-white/10 h-7 w-7"
                aria-label={audioPlayer.isMuted || audioPlayer.volume === 0 ? "Unmute audio" : "Mute audio"}
              >
                {audioPlayer.isMuted || audioPlayer.volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              
              {volumeOpen && (
                <div
                  className="absolute bottom-full right-0 mb-2 p-3 bg-[#1a0a2e] border border-white/20 rounded-lg shadow-xl w-36"
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
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1a0a2e] border-t border-white/10">
          <div className="container mx-auto px-4 py-4 space-y-3">
            {/* Now Playing - Mobile */}
            {nowPlaying && (
              <div className="p-3 bg-white/5 rounded-lg flex items-center gap-3">
                <AlbumArtImage
                  key={`nav-mobile-${nowPlaying.title}-${nowPlaying.artist}`}
                  url={nowPlaying.album_art_url}
                  artworkId={nowPlaying.artwork_id}
                  artist={nowPlaying.artist}
                  title={nowPlaying.title}
                  alt={`${nowPlaying.title} album art`}
                  className="w-12 h-12 rounded flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#e53935] text-white text-[9px] font-bold uppercase">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
                      </span>
                      Live
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white truncate">{nowPlaying.title}</div>
                  <div className="text-xs text-white/70 truncate">{nowPlaying.artist}</div>
                </div>
              </div>
            )}

            {/* Listen Live Button - Mobile */}
            <Button
              onClick={audioPlayer.togglePlay}
              className="w-full h-12 bg-[#288b5a] hover:bg-[#1e6e47] text-white font-semibold gap-2"
              disabled={audioPlayer.isBuffering}
              aria-label={audioPlayer.isPlaying ? "Stop audio stream" : "Listen live to HEADY.FM"}
            >
              {audioPlayer.isPlaying ? (
                <>
                  <Square className="h-5 w-5 fill-current" />
                  Stop Stream
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 fill-current" />
                  Listen Live
                </>
              )}
            </Button>

            {/* Nav Links - Mobile */}
            <div className="grid grid-cols-2 gap-2">
              <Link to="/playlist" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full h-10 text-sm bg-white/5 border-white/20 text-white hover:bg-white/10">
                  Playlist
                </Button>
              </Link>
              <Link to="/hot-40" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full h-10 text-sm bg-white/5 border-white/20 text-white hover:bg-white/10">
                  Hot 40
                </Button>
              </Link>
              <Link to="/shows" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full h-10 text-sm bg-white/5 border-white/20 text-white hover:bg-white/10">
                  Shows
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full h-10 text-sm bg-white/5 border-white/20 text-white hover:bg-white/10"
                onClick={() => {
                  const event = new CustomEvent('open-live-chat');
                  window.dispatchEvent(event);
                  setMobileMenuOpen(false);
                }}
                aria-label="Open live chat"
              >
                Live Chat
              </Button>
            </div>

            {/* Support Button - Mobile */}
            <Button
              onClick={() => {
                setSupportDialogOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full h-11 bg-[#e53935] hover:bg-[#c62828] text-white font-semibold gap-2"
              aria-label="Support HEADY.FM"
            >
              <Heart className="h-5 w-5" />
              Support HEADY.FM
            </Button>

            {/* User Section - Mobile */}
            {user ? (
              <div className="pt-2 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-3 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-white/80 text-sm font-medium">@{profile?.username || 'User'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Link to="/saved-songs" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full h-9 text-xs text-white/70 hover:text-white hover:bg-white/10" aria-label="View saved songs">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full h-9 text-xs text-white/70 hover:text-white hover:bg-white/10" aria-label="View profile">
                      <User className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full h-9 text-xs text-white/70 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full h-10 bg-white/5 border-white/20 text-white hover:bg-white/10">
                  Sign In / Sign Up
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Support Dialog */}
      <Dialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-white/20">
          <DialogHeader>
            <DialogTitle className="sr-only">Support HEADY.FM</DialogTitle>
          </DialogHeader>
          <SupportSidebar />
        </DialogContent>
      </Dialog>
    </nav>
  );
};

export default Navigation;
