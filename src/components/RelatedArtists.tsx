import { Users } from "lucide-react";
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
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Related Artists</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <Skeleton className="w-full aspect-square rounded-xl mb-3 bg-white/10" />
              <Skeleton className="h-5 w-3/4 mb-2 bg-white/10" />
              <Skeleton className="h-4 w-1/2 bg-white/10" />
            </div>
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
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Related Artists</h2>
      </div>

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
