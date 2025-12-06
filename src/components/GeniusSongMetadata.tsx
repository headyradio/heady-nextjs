import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar, Disc3, Users, Music } from "lucide-react";

interface GeniusSongMetadataProps {
  geniusData: {
    release_date?: string;
    album?: {
      name: string;
      cover_art_url: string;
    };
    featured_artists?: Array<{
      id: number;
      name: string;
      url: string;
    }>;
    producer_artists?: Array<{
      id: number;
      name: string;
      url: string;
    }>;
    writer_artists?: Array<{
      id: number;
      name: string;
      url: string;
    }>;
    url: string;
  };
}

export const GeniusSongMetadata = ({ geniusData }: GeniusSongMetadataProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Song Information</h3>
        <Badge variant="secondary" className="gap-1">
          <ExternalLink className="w-3 h-3" />
          Genius
        </Badge>
      </div>

      <div className="space-y-4">
        {geniusData.release_date && (
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Release Date</p>
              <p className="text-sm text-muted-foreground">
                {new Date(geniusData.release_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        )}

        {geniusData.album && (
          <div className="flex items-start gap-3">
            <Disc3 className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Album</p>
              <p className="text-sm text-muted-foreground">{geniusData.album.name}</p>
            </div>
          </div>
        )}

        {geniusData.featured_artists && geniusData.featured_artists.length > 0 && (
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Featured Artists</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {geniusData.featured_artists.map((artist) => (
                  <a
                    key={artist.id}
                    href={artist.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {artist.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {geniusData.producer_artists && geniusData.producer_artists.length > 0 && (
          <div className="flex items-start gap-3">
            <Music className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Producers</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {geniusData.producer_artists.map((producer) => (
                  <a
                    key={producer.id}
                    href={producer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {producer.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {geniusData.writer_artists && geniusData.writer_artists.length > 0 && (
          <div className="flex items-start gap-3">
            <Music className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Writers</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {geniusData.writer_artists.map((writer) => (
                  <a
                    key={writer.id}
                    href={writer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {writer.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        <a
          href={geniusData.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          View full details on Genius
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </Card>
  );
};
