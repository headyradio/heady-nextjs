import { Users, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { useLastfmArtistData } from "@/hooks/useLastfmArtistData";

interface RelatedArtistCardProps {
  name: string;
  playCount: number;
  source: 'featured' | 'producer' | 'co-played' | 'genre';
}

const sourceLabels = {
  featured: 'Featured',
  producer: 'Collaborator',
  'co-played': 'Co-Played',
  genre: 'Similar'
};

const sourceColors = {
  featured: 'from-pink-500/20 to-purple-500/20',
  producer: 'from-blue-500/20 to-cyan-500/20',
  'co-played': 'from-green-500/20 to-emerald-500/20',
  genre: 'from-orange-500/20 to-yellow-500/20'
};

export const RelatedArtistCard = ({ name, playCount, source }: RelatedArtistCardProps) => {
  const { data: lastfmData } = useLastfmArtistData(name);

  return (
    <Link 
      to={`/artist/${encodeURIComponent(name)}`} 
      className="group block"
      aria-label={`View artist page for ${name}`}
    >
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:border-white/20">
        <div className="aspect-square rounded-xl mb-3 overflow-hidden bg-gradient-to-br from-primary/20 to-purple-500/20 ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
          {lastfmData?.image_url ? (
            <img 
              src={lastfmData.image_url} 
              alt={`${name} artist photo`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" aria-hidden="true">
              <Users className="w-10 h-10 text-white/20" />
            </div>
          )}
        </div>
        
        <h3 className="font-bold text-white mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
          {name}
        </h3>
        
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${sourceColors[source]} text-white/80 border border-white/10`}>
            {sourceLabels[source]}
          </span>
          {playCount > 0 && (
            <div className="flex items-center gap-1 text-white/50 text-sm">
              <Radio className="w-3 h-3" />
              <span>{playCount}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
