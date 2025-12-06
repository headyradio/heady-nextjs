import { Clock } from 'lucide-react';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Link } from 'react-router-dom';
import { TransmissionHistory } from '@/hooks/useTransmissionHistory';
import { AlbumArtImage } from './AlbumArtImage';
import { getYouTubeSearchUrl, getSpotifySearchUrl } from '@/lib/musicServiceLinks';
import SaveSongButton from './SaveSongButton';

interface TransmissionTimelineProps {
  transmissions: TransmissionHistory[];
}

export const TransmissionTimeline = ({ transmissions }: TransmissionTimelineProps) => {
  if (transmissions.length === 0) {
    return (
      <div className="border-bold rounded-xl p-12 text-center bg-card">
        <p className="text-lg opacity-60">No transmission history found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transmissions.map((transmission, index) => {
        // Parse the ISO string and convert to local timezone
        const playDate = parseISO(transmission.play_started_at);
        const localTime = toZonedTime(playDate, Intl.DateTimeFormat().resolvedOptions().timeZone);
        const playedAgo = formatDistanceToNow(localTime, { addSuffix: true });
        const playTime = format(localTime, 'h:mm a');
        const youtubeUrl = getYouTubeSearchUrl(transmission.artist, transmission.title);
        const spotifyUrl = getSpotifySearchUrl(transmission.artist, transmission.title);
        const songPageUrl = `/song/${encodeURIComponent(transmission.artist)}/${encodeURIComponent(transmission.title)}`;
        const artistPageUrl = `/artist/${encodeURIComponent(transmission.artist)}`;

        return (
          <div
            key={transmission.id}
            className="border-bold rounded-xl p-6 bg-card hover-lift animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex gap-6">
              {/* Timeline Marker */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center border-2 border-foreground">
                  <Clock className="w-7 h-7 text-secondary-foreground" />
                </div>
                {index < transmissions.length - 1 && (
                  <div className="w-1 flex-1 bg-gradient-to-b from-foreground to-foreground/20 mt-4" />
                )}
              </div>

              {/* Album Art */}
              <Link to={songPageUrl} className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-bold hover:opacity-80 transition-opacity cursor-pointer">
                <AlbumArtImage
                  url={transmission.album_art_url}
                  artworkId={transmission.artwork_id}
                  artist={transmission.artist}
                  title={transmission.title}
                  alt={`${transmission.title} by ${transmission.artist}`}
                  useHistoricalFallback={true}
                />
              </Link>

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <Link to={songPageUrl} className="hover:text-primary transition-colors cursor-pointer">
                    <h3 className="font-black text-xl leading-tight">
                      {transmission.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-secondary whitespace-nowrap">
                      {playTime}
                    </span>
                    <SaveSongButton
                      artist={transmission.artist}
                      title={transmission.title}
                      album={transmission.album}
                      albumArtUrl={transmission.album_art_url}
                      artworkId={transmission.artwork_id}
                    />
                  </div>
                </div>

                <Link 
                  to={artistPageUrl} 
                  className="text-lg font-bold opacity-70 mb-3 hover:text-primary hover:underline transition-colors cursor-pointer inline-block"
                  onClick={(e) => e.stopPropagation()}
                >
                  {transmission.artist}
                </Link>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-sm opacity-60">{playedAgo}</span>
                  
                  {transmission.duration && (
                    <span className="text-sm opacity-60">• {transmission.duration}</span>
                  )}

                  {transmission.genre && (
                    <span className="tag-pill bg-accent text-accent-foreground">
                      {transmission.genre}
                    </span>
                  )}

                  {transmission.year && (
                    <span className="tag-pill bg-success text-success-foreground">
                      {transmission.year}
                    </span>
                  )}
                </div>

                {/* Music Service Links */}
                <div className="flex gap-2">
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 hover:opacity-70 transition-opacity"
                    title="Search on YouTube"
                  >
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg"
                      alt="YouTube"
                      className="w-6 h-6"
                      loading="lazy"
                    />
                  </a>
                  <a
                    href={spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 hover:opacity-70 transition-opacity"
                    title="Search on Spotify"
                  >
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
                      alt="Spotify"
                      className="w-6 h-6"
                      loading="lazy"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
