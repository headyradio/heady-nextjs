import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Users, Radio } from "lucide-react";
import { AlbumArtImage } from "./AlbumArtImage";
import SaveSongButton from "./SaveSongButton";
import { getYouTubeSearchUrl, getSpotifySearchUrl } from "@/lib/musicServiceLinks";
import { Link } from "react-router-dom";

interface SongHeroSectionProps {
  title: string;
  artist: string;
  album?: string;
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
    <Card className="border-0 shadow-none bg-gradient-to-br from-background to-muted/20">
      <div className="grid md:grid-cols-[40%_60%] gap-8 p-8">
        {/* Album Art */}
        <div className="relative aspect-square rounded-lg overflow-hidden shadow-2xl">
          <AlbumArtImage
            artworkId={artworkId}
            url={albumArtUrl}
            title={title}
            artist={artist}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Song Info */}
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 leading-tight">
              {title}
            </h1>
            <Link 
              to={`/artist/${encodeURIComponent(artist)}`}
              className="text-2xl text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
            >
              {artist}
              <ExternalLink className="w-5 h-5" />
            </Link>
            {album && (
              <p className="text-lg text-muted-foreground mt-2">
                from <span className="italic">{album}</span>
              </p>
            )}
          </div>

          {/* Genre Tags */}
          {genres && genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {genres.map((genre, index) => (
                <Badge key={index} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <SaveSongButton
              title={title}
              artist={artist}
              album={album}
              artworkId={artworkId}
              albumArtUrl={albumArtUrl}
            />
            <Button variant="outline" asChild>
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                YouTube
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href={spotifyUrl} target="_blank" rel="noopener noreferrer">
                Spotify
              </a>
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{playCount}</p>
                <p className="text-sm text-muted-foreground">Total Plays</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{uniqueDJs.length}</p>
                <p className="text-sm text-muted-foreground">DJs</p>
              </div>
            </div>
            {lastPlayed && (
              <div className="col-span-2 md:col-span-1">
                <p className="text-sm text-muted-foreground">Last Played</p>
                <p className="font-medium">{new Date(lastPlayed).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
