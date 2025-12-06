import { Clock } from 'lucide-react';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { Link } from 'react-router-dom';
import { TransmissionHistory } from '@/hooks/useTransmissionHistory';
import { AlbumArtImage } from './AlbumArtImage';
import { getYouTubeSearchUrl, getSpotifySearchUrl } from '@/lib/musicServiceLinks';
import SaveSongButton from './SaveSongButton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TransmissionTableProps {
  transmissions: TransmissionHistory[];
}

export const TransmissionTable = ({ transmissions }: TransmissionTableProps) => {
  if (transmissions.length === 0) {
    return (
      <div className="border-bold rounded-xl p-12 text-center bg-card">
        <p className="text-lg opacity-60">No transmission history found</p>
      </div>
    );
  }

  return (
    <div className="border-bold rounded-xl overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-b-2 border-foreground hover:bg-transparent bg-primary/20">
            <TableHead className="w-20"></TableHead>
            <TableHead className="font-black text-foreground">Time</TableHead>
            <TableHead className="font-black text-foreground">Track</TableHead>
            <TableHead className="font-black text-foreground">Artist</TableHead>
            <TableHead className="hidden md:table-cell font-black text-foreground">Album</TableHead>
            <TableHead className="hidden lg:table-cell font-black text-foreground">Duration</TableHead>
            <TableHead className="hidden lg:table-cell font-black text-foreground">Genre</TableHead>
            <TableHead className="font-black text-foreground">Links</TableHead>
            <TableHead className="font-black text-foreground">Save</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
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
              <TableRow
                key={transmission.id}
                className="border-b border-foreground/10 hover:bg-primary/5 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <TableCell>
                  <Link to={songPageUrl}>
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-foreground hover:opacity-80 transition-opacity cursor-pointer">
                      <AlbumArtImage
                        url={transmission.album_art_url}
                        artworkId={transmission.artwork_id}
                        artist={transmission.artist}
                        title={transmission.title}
                        alt=""
                        useHistoricalFallback={true}
                      />
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="font-bold">
                  <div className="text-secondary">{playTime}</div>
                  <div className="text-xs opacity-60 font-normal">{playedAgo}</div>
                </TableCell>
                <TableCell className="font-bold">
                  <Link to={songPageUrl} className="hover:text-primary hover:underline transition-colors cursor-pointer">
                    {transmission.title}
                  </Link>
                </TableCell>
                <TableCell className="font-semibold opacity-80">
                  <Link 
                    to={artistPageUrl} 
                    className="hover:text-primary hover:underline transition-colors cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {transmission.artist}
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell opacity-60">
                  {transmission.album || '-'}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-2 opacity-60">
                    <Clock className="w-4 h-4" />
                    {transmission.duration || '-'}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {transmission.genre ? (
                    <span className="tag-pill bg-accent text-accent-foreground">
                      {transmission.genre}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:opacity-70 transition-opacity"
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
                      className="p-2 hover:opacity-70 transition-opacity"
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
                </TableCell>
                <TableCell>
                  <SaveSongButton
                    artist={transmission.artist}
                    title={transmission.title}
                    album={transmission.album}
                    albumArtUrl={transmission.album_art_url}
                    artworkId={transmission.artwork_id}
                    size="icon"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
