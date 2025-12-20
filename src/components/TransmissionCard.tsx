import { Clock, Calendar } from 'lucide-react';
import { Transmission } from '@/hooks/useRadioBoss';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { AlbumArtImage } from './AlbumArtImage';
import { getYouTubeSearchUrl, getSpotifySearchUrl } from '@/lib/musicServiceLinks';
import { Link } from 'react-router-dom';
import SaveSongButton from './SaveSongButton';

interface TransmissionCardProps {
  transmission: Transmission;
  index?: number;
}

export const TransmissionCard = ({ transmission, index = 0 }: TransmissionCardProps) => {
  // Parse the timestamp - convert postgres timestamp to proper ISO format
  // Postgres format: "2025-09-30 18:00:38+00" -> ISO format: "2025-09-30T18:00:38Z"
  const isoTimestamp = transmission.play_started_at.replace(' ', 'T').replace('+00', 'Z');
  const playDate = parseISO(isoTimestamp);
  const playedAgo = formatDistanceToNow(playDate, { addSuffix: true });
  const playTime = format(playDate, 'h:mm a');
  
  // Consistent green border for all cards
  const borderClass = 'border-bold-primary';

  const youtubeUrl = getYouTubeSearchUrl(transmission.artist, transmission.title);
  const spotifyUrl = getSpotifySearchUrl(transmission.artist, transmission.title);
  
  const songPageUrl = `/song/${encodeURIComponent(transmission.artist)}/${encodeURIComponent(transmission.title)}`;

  return (
    <div className={`${borderClass} rounded-xl overflow-hidden bg-gray-900/80 border border-white/10 hover-lift cursor-pointer group animate-fade-in`}
         style={{ animationDelay: `${index * 50}ms` }}>
      {/* Album Art */}
      <Link to={songPageUrl}>
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 relative">
          <AlbumArtImage
            url={transmission.album_art_url}
            artworkId={transmission.artwork_id}
            artist={transmission.artist}
            title={transmission.title}
            alt={`${transmission.title} by ${transmission.artist}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            fallbackClassName="w-full h-full flex items-center justify-center"
          />
        </div>
      </Link>

      {/* Track Info */}
      <div className="p-3 md:p-4">
        <div className="mb-1">
          <Link to={songPageUrl} className="block">
            <h3 className="font-bold text-sm md:text-base truncate leading-tight text-white hover:text-primary transition-colors">
              {transmission.title}
            </h3>
          </Link>
        </div>
        
        {/* Artist Name - Clickable */}
        <Link 
          to={`/artist/${encodeURIComponent(transmission.artist)}`}
          className="font-semibold text-xs md:text-sm text-white/70 mb-2 md:mb-3 truncate hover:text-primary hover:opacity-100 transition-colors cursor-pointer block"
          onClick={(e) => e.stopPropagation()}
        >
          {transmission.artist}
        </Link>

        <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
          <Clock className="w-3 h-3" />
          <span>{playTime} · {playedAgo}</span>
        </div>

        {/* Music Service Links + Heart Button */}
        <div className="flex items-center gap-2 mb-2 md:mb-3">
          <SaveSongButton
            artist={transmission.artist}
            title={transmission.title}
            album={transmission.album}
            albumArtUrl={transmission.album_art_url}
            artworkId={transmission.artwork_id}
            size="sm"
          />
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 md:p-2.5 hover:opacity-70 transition-opacity"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Search for ${transmission.title} by ${transmission.artist} on YouTube`}
            title="Search on YouTube"
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg"
              alt=""
              className="w-5 h-5 md:w-6 md:h-6"
              loading="lazy"
              aria-hidden="true"
            />
          </a>
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 md:p-2.5 hover:opacity-70 transition-opacity"
            onClick={(e) => e.stopPropagation()}
            aria-label={`Search for ${transmission.title} by ${transmission.artist} on Spotify`}
            title="Search on Spotify"
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
              alt=""
              className="w-5 h-5 md:w-6 md:h-6"
              loading="lazy"
              aria-hidden="true"
            />
          </a>
        </div>

        {transmission.genre && (
          <div className="mt-2">
            <span className="tag-pill bg-foreground text-background text-xs">
              {transmission.genre}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
