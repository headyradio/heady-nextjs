import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, ExternalLink, Sparkles, Instagram, Twitter, Facebook, Radio, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useLastfmArtistData } from "@/hooks/useLastfmArtistData";

interface AboutTheArtistProps {
  artistName: string;
  geniusData?: {
    name: string;
    description?: {
      plain: string;
    };
    image_url: string;
    alternate_names?: string[];
    instagram_name?: string;
    twitter_name?: string;
    facebook_name?: string;
    url: string;
  };
  aiContent?: string;
  headyStats: {
    totalPlays: number;
    uniqueSongs: number;
    firstPlayed: string | null;
    lastPlayed: string | null;
  };
}

export const AboutTheArtist = ({ artistName, geniusData, aiContent, headyStats }: AboutTheArtistProps) => {
  const { data: lastfmData } = useLastfmArtistData(artistName);
  const description = geniusData?.description?.plain || aiContent;
  const isFromGenius = Boolean(geniusData?.description?.plain);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">About the Artist</h2>

      <div className="grid md:grid-cols-[1fr_300px] gap-6">
        {/* Artist Bio */}
        <Card className="p-6">
          {lastfmData?.image_url && (
            <div className="float-right ml-4 mb-4 w-48 h-48">
              <img 
                src={lastfmData.image_url} 
                alt={artistName}
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              {geniusData?.name || artistName}
            </h3>
            <Badge variant="secondary" className="gap-1">
              {isFromGenius ? (
                <>
                  <ExternalLink className="w-3 h-3" />
                  Genius
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  AI Generated
                </>
              )}
            </Badge>
          </div>

          {geniusData?.alternate_names && geniusData.alternate_names.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Also known as:</p>
              <div className="flex flex-wrap gap-2">
                {geniusData.alternate_names.map((name, index) => (
                  <Badge key={index} variant="outline">{name}</Badge>
                ))}
              </div>
            </div>
          )}

          {description && (
            <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          )}

          {/* Social Media Links */}
          {geniusData && (geniusData.instagram_name || geniusData.twitter_name || geniusData.facebook_name) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {geniusData.instagram_name && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://instagram.com/${geniusData.instagram_name}`} target="_blank" rel="noopener noreferrer">
                    <Instagram className="w-4 h-4 mr-2" />
                    Instagram
                  </a>
                </Button>
              )}
              {geniusData.twitter_name && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://twitter.com/${geniusData.twitter_name}`} target="_blank" rel="noopener noreferrer">
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </a>
                </Button>
              )}
              {geniusData.facebook_name && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`https://facebook.com/${geniusData.facebook_name}`} target="_blank" rel="noopener noreferrer">
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </a>
                </Button>
              )}
            </div>
          )}

          {isFromGenius && geniusData?.url && (
            <a
              href={geniusData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              View full profile on Genius
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <Link to={`/artist/${encodeURIComponent(artistName)}`}>
            <Button className="w-full mt-4" variant="outline">
              View Full Artist Page
            </Button>
          </Link>
        </Card>

        {/* HEADY Stats */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Radio className="w-5 h-5" />
            HEADY.FM Stats
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-3xl font-bold text-primary">{headyStats.totalPlays}</p>
              <p className="text-sm text-muted-foreground">Total Plays</p>
            </div>

            <div>
              <p className="text-3xl font-bold text-primary">{headyStats.uniqueSongs}</p>
              <p className="text-sm text-muted-foreground">Unique Songs</p>
            </div>

            {headyStats.firstPlayed && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">First Played</p>
                </div>
                <p className="font-medium">{new Date(headyStats.firstPlayed).toLocaleDateString()}</p>
              </div>
            )}

            {headyStats.lastPlayed && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Last Played</p>
                </div>
                <p className="font-medium">{new Date(headyStats.lastPlayed).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
