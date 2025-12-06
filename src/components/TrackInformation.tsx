import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Disc, Clock, Music } from "lucide-react";

interface TrackInformationProps {
  releaseDate?: string;
  album?: {
    name: string;
    cover_art_url: string;
  };
  duration?: string;
  featuredArtists?: Array<{ name: string; url: string }>;
}

export const TrackInformation = ({
  releaseDate,
  album,
  duration,
  featuredArtists
}: TrackInformationProps) => {
  if (!releaseDate && !album && !duration && !featuredArtists?.length) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Music className="w-5 h-5" />
        Track Information
      </h3>
      
      <div className="space-y-4">
        {releaseDate && (
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Release Date</p>
              <p className="font-medium">{new Date(releaseDate).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {album && (
          <div className="flex items-center gap-3">
            <Disc className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Album</p>
              <p className="font-medium">{album.name}</p>
            </div>
          </div>
        )}

        {duration && (
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-medium">{duration}</p>
            </div>
          </div>
        )}

        {featuredArtists && featuredArtists.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Featured Artists</p>
            <div className="flex flex-wrap gap-2">
              {featuredArtists.map((artist, index) => (
                <Badge key={index} variant="secondary">
                  <a href={artist.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {artist.name}
                  </a>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
