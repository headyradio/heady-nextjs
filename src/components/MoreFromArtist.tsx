import { Music, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { AlbumArtImage } from "./AlbumArtImage";
import SaveSongButton from "./SaveSongButton";
import { Skeleton } from "@/components/ui/skeleton";

interface ArtistTopSong {
  title: string;
  artist: string;
  album?: string;
  album_art_url?: string;
  playCount: number;
}

interface MoreFromArtistProps {
  artistName: string;
  songs: ArtistTopSong[];
  isLoading?: boolean;
}

export const MoreFromArtist = ({ artistName, songs, isLoading }: MoreFromArtistProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
            <Music className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">More from {artistName}</h2>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-lg bg-white/10" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2 bg-white/10" />
                  <Skeleton className="h-4 w-1/2 bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!songs || songs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
          <Music className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">More from {artistName}</h2>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6">
        <div className="divide-y divide-white/10">
          {songs.map((song, index) => (
            <div key={index} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 group">
              
              <Link
                to={`/song/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`}
                className="flex items-center gap-4 flex-1 min-w-0"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
                  <AlbumArtImage
                    url={song.album_art_url}
                    title={song.title}
                    artist={song.artist}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white group-hover:text-primary transition-colors truncate">
                    {song.title}
                  </h3>
                  {song.album && (
                    <p className="text-sm text-white/50 truncate">
                      {song.album}
                    </p>
                  )}
                </div>
              </Link>

              {/* Play count */}
              <div className="hidden md:flex items-center gap-1.5 text-sm text-white/50">
                <Radio className="w-3 h-3" />
                <span>{song.playCount}</span>
              </div>

              <SaveSongButton
                title={song.title}
                artist={song.artist}
                album={song.album}
                albumArtUrl={song.album_art_url}
                size="sm"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
