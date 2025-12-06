import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RelatedArtistCard } from "./RelatedArtistCard";

interface RelatedArtist {
  name: string;
  playCount: number;
  source: 'featured' | 'producer' | 'co-played' | 'genre';
}

interface RelatedArtistsProps {
  artists: RelatedArtist[];
  isLoading?: boolean;
}

export const RelatedArtists = ({ artists, isLoading }: RelatedArtistsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Users className="w-8 h-8" />
          Related Artists
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="w-full aspect-square rounded-lg mb-3" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!artists || artists.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-2">
        <Users className="w-8 h-8" />
        Related Artists
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {artists.map((artist, index) => (
          <RelatedArtistCard
            key={index}
            name={artist.name}
            playCount={artist.playCount}
            source={artist.source}
          />
        ))}
      </div>
    </div>
  );
};
