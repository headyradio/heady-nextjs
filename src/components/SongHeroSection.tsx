import { Radio, Users, Calendar, ExternalLink } from "lucide-react";
import { AlbumArtImage } from "./AlbumArtImage";
import SaveSongButton from "./SaveSongButton";
import { getYouTubeSearchUrl, getSpotifySearchUrl } from "@/lib/musicServiceLinks";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface SongHeroSectionProps {
  title: string;
  artist: string;
  album?: string;
  year?: string;
  artworkId?: string;
  albumArtUrl?: string;
  playCount: number;
  uniqueDJs: string[];
  lastPlayed: string | null;
  genres?: string[];
  createdAt?: string;
}

export const SongHeroSection = ({
  title,
  artist,
  album,
  year,
  artworkId,
  albumArtUrl,
  playCount,
  uniqueDJs,
  lastPlayed,
  genres,
  createdAt
}: SongHeroSectionProps) => {
  const youtubeUrl = getYouTubeSearchUrl(artist, title);
  const spotifyUrl = getSpotifySearchUrl(artist, title);

  return (
    <div className="relative -mx-4 md:-mx-0">
      {/* Background Gradient - Blends with purple nav */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#4a148c] via-purple-900/80 to-black overflow-hidden">
        {/* Blurred album art background */}
        <div 
          className="absolute inset-0 opacity-40 blur-3xl scale-150"
          style={{
            backgroundImage: albumArtUrl ? `url(${albumArtUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Noise texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative px-4 md:px-8 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-end">
            {/* Album Art - Large and Prominent */}
            <div className="relative flex-shrink-0 group">
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-[1.02]">
                <AlbumArtImage
                  artworkId={artworkId}
                  url={albumArtUrl}
                  title={title}
                  artist={artist}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Reflection effect */}
              <div className="absolute -bottom-4 left-4 right-4 h-20 bg-gradient-to-b from-white/5 to-transparent blur-xl rounded-full" />
            </div>

            {/* Song Info */}
            <div className="flex-1 text-center md:text-left space-y-4 md:space-y-6">
              {/* Song indicator */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-white/80">
                <Radio className="w-4 h-4" />
                <span className="font-medium">Song</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                {title}
              </h1>

              {/* Artist & Album */}
              <div className="space-y-2">
                <Link 
                  to={`/artist/${encodeURIComponent(artist)}`}
                  className="text-xl md:text-2xl text-white/90 hover:text-white font-semibold transition-colors inline-flex items-center gap-2 group/link"
                  aria-label={`View artist page for ${artist}`}
                >
                  {artist}
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" aria-hidden="true" />
                </Link>
                {album && (
                  <p className="text-lg text-white/60">
                    {album} {year && <span>• {year}</span>}
                  </p>
                )}
              </div>

              {/* Genre Tags */}
              {genres && genres.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {genres.map((genre, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm text-white/80 border border-white/10"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                <SaveSongButton
                  title={title}
                  artist={artist}
                  album={album}
                  artworkId={artworkId}
                  albumArtUrl={albumArtUrl}
                  size="lg"
                />
                
                <a 
                  href={spotifyUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold transition-all hover:scale-105"
                  aria-label={`Listen to ${title} on Spotify`}
                >
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
                    alt=""
                    className="w-5 h-5"
                    aria-hidden="true"
                  />
                  Spotify
                </a>

                <a 
                  href={youtubeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold transition-all hover:scale-105"
                  aria-label={`Watch ${title} on YouTube`}
                >
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg"
                    alt=""
                    className="w-5 h-5"
                    aria-hidden="true"
                  />
                  YouTube
                </a>
              </div>
            </div>
          </div>

          {/* Stats Bar - Apple Music style */}
          <div className="mt-10 md:mt-16 pt-8 border-t border-white/10">
            <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto md:mx-0">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <Radio className="w-4 h-4 text-primary" />
                  <span className="text-white/50 text-sm uppercase tracking-wider">Plays</span>
                </div>
                <p className="text-3xl md:text-4xl font-black text-white">{playCount}</p>
              </div>
              
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-white/50 text-sm uppercase tracking-wider">DJs</span>
                </div>
                <p className="text-3xl md:text-4xl font-black text-white">{uniqueDJs.length}</p>
              </div>
              
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-white/50 text-sm uppercase tracking-wider">Last Played</span>
                </div>
                <p className="text-lg md:text-xl font-bold text-white">
                  {lastPlayed 
                    ? formatDistanceToNow(new Date(lastPlayed), { addSuffix: false })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
