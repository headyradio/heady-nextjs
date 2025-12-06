import { Card } from "@/components/ui/card";
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
        <h2 className="text-3xl font-bold">More from {artistName}</h2>
        <Card className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!songs || songs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-2">
        <Music className="w-8 h-8" />
        More from {artistName}
      </h2>

      <Card className="p-6">
        <div className="space-y-3">
          {songs.map((song, index) => (
            <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
              <Link
                to={`/song/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`}
                className="flex items-center gap-4 flex-1"
              >
                <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                  <AlbumArtImage
                    url={song.album_art_url}
                    title={song.title}
                    artist={song.artist}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                    {song.title}
                  </h3>
                  {song.album && (
                    <p className="text-sm text-muted-foreground truncate">
                      {song.album}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Radio className="w-3 h-3" />
                    <span>{song.playCount} plays</span>
                  </div>
                </div>
              </Link>

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
      </Card>
    </div>
  );
};
