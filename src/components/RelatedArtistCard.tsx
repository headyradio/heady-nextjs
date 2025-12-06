import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { useLastfmArtistData } from "@/hooks/useLastfmArtistData";

interface RelatedArtistCardProps {
  name: string;
  playCount: number;
  source: 'featured' | 'producer' | 'co-played' | 'genre';
}

const sourceLabels = {
  featured: 'Featured Artist',
  producer: 'Collaborator',
  'co-played': 'Co-Played',
  genre: 'Similar'
};

export const RelatedArtistCard = ({ name, playCount, source }: RelatedArtistCardProps) => {
  const { data: lastfmData } = useLastfmArtistData(name);

  return (
    <Link to={`/artist/${encodeURIComponent(name)}`} className="group">
      <Card className="p-4 hover:shadow-lg transition-all hover:scale-105">
        <div className="aspect-square rounded-lg mb-3 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
          {lastfmData?.image_url ? (
            <img 
              src={lastfmData.image_url} 
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="w-12 h-12 text-primary/40" />
            </div>
          )}
        </div>
        
        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
          {name}
        </h3>
        
        <div className="flex items-center justify-between text-sm">
          <Badge variant="secondary" className="text-xs">
            {sourceLabels[source]}
          </Badge>
          {playCount > 0 && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Radio className="w-3 h-3" />
              <span>{playCount}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};
