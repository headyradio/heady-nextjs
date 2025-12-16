import { Clock, Play, Square } from 'lucide-react';
import { Transmission } from '@/hooks/useRadioBoss';
import { formatDistanceToNow } from 'date-fns';
import { AlbumArtImage } from './AlbumArtImage';
import SaveSongButton from './SaveSongButton';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { getYouTubeSearchUrl, getSpotifySearchUrl } from '@/lib/musicServiceLinks';
import { useGlobalAudioPlayer } from '@/contexts/AudioPlayerContext';
import { useEffect } from 'react';

interface NowPlayingProps {
  transmission: Transmission | null;
  isLive?: boolean;
}

export const NowPlaying = ({ transmission, isLive = false }: NowPlayingProps) => {
  const audioPlayer = useGlobalAudioPlayer();
  
  // Update Media Session API for lock screen display
  useEffect(() => {
    if (!transmission || typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
      return;
    }

    // Set metadata for lock screen and system media controls
    navigator.mediaSession.metadata = new MediaMetadata({
      title: transmission.title,
      artist: transmission.artist,
      album: transmission.album || undefined,
      artwork: transmission.album_art_url ? [
        { src: transmission.album_art_url, sizes: '512x512', type: 'image/jpeg' }
      ] : undefined,
    });

    // Set up action handlers
    navigator.mediaSession.setActionHandler('play', () => {
      audioPlayer.play();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      audioPlayer.pause();
    });

    // Update playback state
    navigator.mediaSession.playbackState = audioPlayer.isPlaying ? 'playing' : 'paused';

    return () => {
      // Clear handlers on unmount
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
      }
    };
  }, [transmission, audioPlayer.isPlaying, audioPlayer.play, audioPlayer.pause]);
  
  if (!transmission) {
    return (
      <div className="md:border-bold md:rounded-2xl p-4 md:p-12 bg-card">
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <Play className="w-16 md:w-24 h-16 md:h-24 mx-auto mb-4 opacity-30" />
            <p className="text-base md:text-lg font-medium">No transmission detected</p>
          </div>
        </div>
      </div>
    );
  }

  const playedAgo = formatDistanceToNow(new Date(transmission.play_started_at), { addSuffix: true });

  const youtubeUrl = getYouTubeSearchUrl(transmission.artist, transmission.title);
  const spotifyUrl = getSpotifySearchUrl(transmission.artist, transmission.title);

  return (
    <div className="md:border-bold md:rounded-2xl overflow-hidden">
      <div className="bg-card">
        {/* Mobile App-Style Layout */}
        <div className="md:grid md:grid-cols-2 md:gap-8 md:p-8 lg:p-12">
          {/* Album Art with Play Button - Mobile First */}
          <div className="flex items-center justify-center relative mb-6 md:mb-0">
            <div className="w-full aspect-square md:max-w-md md:rounded-xl overflow-hidden md:border-bold md:shadow-2xl md:hover-lift relative group">
              <AlbumArtImage
                key={`now-playing-${transmission.title}-${transmission.artist}-${transmission.play_started_at}`}
                url={transmission.album_art_url}
                artworkId={transmission.artwork_id}
                artist={transmission.artist}
                title={transmission.title}
                alt={`${transmission.title} by ${transmission.artist}`}
                className="w-full h-full object-cover"
                fallbackClassName="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
              />
              {/* Desktop: Hover Play Button Overlay */}
              <div className="hidden md:flex absolute inset-0 items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  onClick={audioPlayer.togglePlay}
                  size="lg"
                  variant="default"
                  aria-label={audioPlayer.isPlaying ? "Stop audio stream" : "Play audio stream"}
                  className="w-20 h-20 rounded-full shadow-2xl hover:scale-110 transition-transform"
                  disabled={audioPlayer.isBuffering}
                >
                  {audioPlayer.isPlaying ? (
                    <Square className="h-10 w-10 text-white fill-white" aria-hidden="true" />
                  ) : (
                    <Play className="h-10 w-10 text-white fill-white" aria-hidden="true" />
                  )}
                </Button>
              </div>
              
              {/* Mobile: Semi-transparent Play Button with Border */}
              <div className="md:hidden absolute inset-0 flex items-center justify-center">
                <button
                  onClick={audioPlayer.togglePlay}
                  disabled={audioPlayer.isBuffering}
                  aria-label={audioPlayer.isPlaying ? "Stop audio stream" : "Play audio stream"}
                  className="w-28 h-28 rounded-full bg-background/20 backdrop-blur-md border-4 border-primary/80 hover:border-primary flex items-center justify-center shadow-2xl transition-all active:scale-95 disabled:opacity-90"
                >
                  {audioPlayer.isBuffering || (audioPlayer.connectionStatus === 'connecting' && !audioPlayer.isPlaying) ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white drop-shadow-lg" aria-hidden="true" />
                      <span className="text-[10px] text-white font-bold drop-shadow-lg uppercase tracking-wide">
                        {audioPlayer.connectionStatus === 'connecting' ? 'Loading...' : 'Buffering...'}
                      </span>
                    </div>
                  ) : audioPlayer.isPlaying ? (
                    <Square className="h-14 w-14 text-white fill-white drop-shadow-lg" aria-hidden="true" />
                  ) : (
                    <Play className="h-14 w-14 text-white fill-white drop-shadow-lg ml-1" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Track Info - Mobile App Style */}
          <div className="flex flex-col justify-center px-4 md:px-0">
            {/* Live indicator - Always show live */}
            <div className="flex justify-center md:justify-start mb-4 md:mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border-2 border-green-500">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="text-green-500 font-black text-xs uppercase tracking-wider">LIVE</span>
              </div>
            </div>

            {/* Mobile: Centered Track Info */}
            <div className="text-center md:text-left mb-4 md:mb-6">
              <Link 
                to={`/song/${encodeURIComponent(transmission.artist)}/${encodeURIComponent(transmission.title)}`}
                className="group block"
              >
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-black mb-2 md:mb-3 leading-tight group-hover:text-primary transition-colors">
                  {transmission.title}
                </h2>
              </Link>
              
              <Link 
                to={`/artist/${encodeURIComponent(transmission.artist)}`}
                className="block hover:text-primary transition-colors"
              >
                <p className="text-lg md:text-2xl lg:text-3xl font-bold mb-2 md:mb-3 opacity-70">
                  {transmission.artist}
                </p>
              </Link>

              {transmission.album && (
                <p className="text-sm md:text-base font-semibold mb-2 opacity-60">
                  {transmission.album}
                </p>
              )}
              
              {transmission.year && (
                <p className="text-sm md:text-base font-semibold mb-3 md:mb-4 opacity-60">
                  {transmission.year}
                </p>
              )}
            </div>

            {/* Mobile: Music Service Logos with Save Button */}
            <div className="flex md:hidden items-center justify-center gap-4 mb-4">
              <SaveSongButton
                artist={transmission.artist}
                title={transmission.title}
                album={transmission.album}
                albumArtUrl={transmission.album_art_url}
                artworkId={transmission.artwork_id}
                size="default"
              />
              
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Search for ${transmission.title} by ${transmission.artist} on YouTube`}
                className="p-3 hover:opacity-70 transition-opacity active:scale-95"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg"
                  alt=""
                  className="w-10 h-10"
                  loading="lazy"
                  width="40"
                  height="40"
                  aria-hidden="true"
                />
              </a>
              
              <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Search for ${transmission.title} by ${transmission.artist} on Spotify`}
                className="p-3 hover:opacity-70 transition-opacity active:scale-95"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
                  alt=""
                  className="w-10 h-10"
                  loading="lazy"
                  width="40"
                  height="40"
                  aria-hidden="true"
                />
              </a>
            </div>

            {/* Desktop: Music Service Links with Save Button */}
            <div className="hidden md:flex gap-2 md:gap-3 mb-4 md:mb-6 items-center">
              <SaveSongButton
                artist={transmission.artist}
                title={transmission.title}
                album={transmission.album}
                albumArtUrl={transmission.album_art_url}
                artworkId={transmission.artwork_id}
                size="default"
              />
              
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Search for ${transmission.title} by ${transmission.artist} on YouTube`}
                className="p-3 hover:opacity-70 transition-opacity"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg"
                  alt=""
                  className="w-8 h-8"
                  loading="lazy"
                  width="32"
                  height="32"
                  aria-hidden="true"
                />
              </a>
              <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Search for ${transmission.title} by ${transmission.artist} on Spotify`}
                className="p-3 hover:opacity-70 transition-opacity"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
                  alt=""
                  className="w-8 h-8"
                  loading="lazy"
                  width="32"
                  height="32"
                  aria-hidden="true"
                />
              </a>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 md:gap-3 justify-center md:justify-start">
              {transmission.genre && (
                <span className="tag-pill bg-accent text-accent-foreground text-xs md:text-sm">
                  {transmission.genre}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
