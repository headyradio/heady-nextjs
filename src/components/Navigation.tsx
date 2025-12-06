import * as React from 'react';
import { Play, Pause, Volume2, VolumeX, Menu, X, Heart, User, LogOut, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useGlobalAudioPlayer } from '@/contexts/AudioPlayerContext';
import { AlbumArtImage } from '@/components/AlbumArtImage';
import SaveSongButton from '@/components/SaveSongButton';
import headyLogo from '@/assets/heady-logo.svg';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useProfile } from '@/hooks/useProfile';
import { useRadioBoss } from '@/hooks/useRadioBoss';
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b-4 border-secondary shadow-lg" style={{ backgroundColor: '#4a148c' }}>
      <div className="container mx-auto px-4">
        <div className="relative flex h-20 items-center justify-between md:justify-start gap-4">
          {/* Logo - Absolutely centered on mobile, normal flow on desktop */}
          <div className="absolute left-1/2 -translate-x-1/2 md:static md:transform-none flex items-center gap-3">
            <Link to="/">
              <img src={headyLogo} alt="HEADY Radio" className="h-16 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
            </Link>
          </div>

          {/* Center: Audio Player & Track Info (Desktop) */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-4 max-w-2xl">
            {/* Circular Play Button */}
            <Button
              onClick={audioPlayer.togglePlay}
              size="icon"
              variant="default"
              className="relative overflow-hidden w-14 h-14 rounded-full"
              disabled={audioPlayer.isBuffering}
            >
              {audioPlayer.isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
              {audioPlayer.connectionStatus === 'streaming' && (
                <div className="absolute inset-0 bg-primary/20 animate-pulse rounded-full" />
              )}
            </Button>

            {/* Current Track */}
            {nowPlaying && (
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
                    {audioPlayer.isPlaying ? (
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/20 border border-green-500">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-green-500 font-bold text-[10px] uppercase tracking-wider">LIVE</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500">
                        <Pause className="h-2 w-2 text-orange-500" />
                        <span className="text-orange-500 font-bold text-[10px] uppercase tracking-wider">PAUSED</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-bold text-white truncate">
                    {nowPlaying.title}
                  </div>
                  <div className="text-xs text-white/80 truncate">
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
                
                {/* Jump to Live Button */}
                {!audioPlayer.isPlaying && (
                  <Button
                    onClick={audioPlayer.jumpToLive}
                    size="sm"
                    className="text-white hover:bg-white/20 ml-2"
                    variant="ghost"
                  >
                    <Radio className="h-4 w-4 mr-1" />
                    Jump to Live
                  </Button>
                )}
              </div>
            )}

            {/* Volume Control */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={audioPlayer.toggleMute}
                onMouseEnter={() => setVolumeOpen(true)}
                className="text-white hover:bg-white/20"
              >
                {audioPlayer.isMuted || audioPlayer.volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              
              {volumeOpen && (
                <div
                  className="absolute top-full right-0 mt-2 p-4 bg-card border-2 border-border rounded-xl shadow-lg w-48"
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

          {/* Right: Status & Menu */}
          <div className="flex items-center gap-4">
            {/* Live Chat Button */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex text-white hover:bg-white/20 gap-2"
              onClick={() => {
                const event = new CustomEvent('open-live-chat');
                window.dispatchEvent(event);
              }}
            >
              <Radio className="h-4 w-4" />
              Live Chat
              {isLive && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              )}
            </Button>

            {/* Shows Link */}
            <Link to="/shows">
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex text-white hover:bg-white/20"
              >
                Shows
              </Button>
            </Link>

            {/* Support Link */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex text-white hover:bg-white/20"
              onClick={() => {
                const supportSection = document.getElementById('support-section');
                supportSection?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Heart className="h-4 w-4 mr-2" />
              Support
            </Button>

            {/* User Menu / Auth */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/20">
                    <Avatar className="h-9 w-9 ring-2 ring-white/30">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-64 bg-popover border-2 border-border shadow-xl z-[100]"
                  sideOffset={8}
                >
                  <div className="px-4 py-3 bg-primary/5 border-b-2 border-border">
                    <p className="text-sm font-bold text-foreground">
                      @{profile?.username || 'user'}
                    </p>
                    {profile?.display_name && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {profile.display_name}
                      </p>
                    )}
                  </div>
                  <div className="py-2">
                    <DropdownMenuItem 
                      onClick={() => navigate('/saved-songs')}
                      className="cursor-pointer px-4 py-3 focus:bg-primary/10 focus:text-primary"
                    >
                      <Heart className="mr-3 h-5 w-5" />
                      <span className="font-semibold">Saved Songs</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => navigate('/profile')}
                      className="cursor-pointer px-4 py-3 focus:bg-primary/10 focus:text-primary"
                    >
                      <User className="mr-3 h-5 w-5" />
                      <span className="font-semibold">Profile</span>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="bg-border" />
                  <div className="py-2">
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="cursor-pointer px-4 py-3 focus:bg-destructive/10 focus:text-destructive"
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
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
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
                  <Pause className="h-5 w-5 mr-2" />
                  Pause Live Stream
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Listen Live
                </>
              )}
            </Button>

            {nowPlaying && (
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
                    {audioPlayer.isPlaying ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                        </span>
                        <span className="text-green-500 font-bold text-xs uppercase tracking-wider">LIVE</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500">
                        <Pause className="h-2.5 w-2.5 text-orange-500" />
                        <span className="text-orange-500 font-bold text-xs uppercase tracking-wider">PAUSED</span>
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-bold text-white">{nowPlaying.title}</div>
                  <div className="text-xs text-white/80">{nowPlaying.artist}</div>
                </div>
              </div>
            )}

            {!audioPlayer.isPlaying && (
              <Button
                onClick={audioPlayer.jumpToLive}
                size="lg"
                variant="default"
                className="w-full"
              >
                <Radio className="h-5 w-5 mr-2" />
                Jump to Live Broadcast
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
