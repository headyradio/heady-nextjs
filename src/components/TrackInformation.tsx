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
  producers?: Array<{ id: number; name: string; url: string }>;
  writers?: Array<{ id: number; name: string; url: string }>;
}

export const TrackInformation = ({
  releaseDate,
  album,
  duration,
  featuredArtists,
  producers,
  writers
}: TrackInformationProps) => {
  if (!releaseDate && !album && !duration && !featuredArtists?.length && !producers?.length && !writers?.length) {
    return null;
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
        <Music className="w-4 h-4 text-primary" />
        Track Info
      </h3>
      
      <div className="space-y-4">
        {releaseDate && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5">
              <Calendar className="w-4 h-4 text-white/60" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Release Date</p>
              <p className="font-medium text-white">{new Date(releaseDate).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {album && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5">
              <Disc className="w-4 h-4 text-white/60" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Album</p>
              <p className="font-medium text-white">{album.name}</p>
            </div>
          </div>
        )}

        {duration && (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/5">
              <Clock className="w-4 h-4 text-white/60" />
            </div>
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider">Duration</p>
              <p className="font-medium text-white">{duration}</p>
            </div>
          </div>
        )}

        {featuredArtists && featuredArtists.length > 0 && (
          <div className="pt-2 border-t border-white/10">
            <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Featured Artists</p>
            <div className="flex flex-wrap gap-2">
              {featuredArtists.map((artist, index) => (
                <a 
                  key={index}
                  href={artist.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-3 py-1.5 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors border border-white/10"
                >
                  {artist.name}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Credits Section */}
        {(producers && producers.length > 0) || (writers && writers.length > 0) ? (
          <div className="pt-2 border-t border-white/10">
            {producers && producers.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Producers</p>
                <div className="flex flex-wrap gap-2">
                  {producers.map((producer) => (
                    <a 
                      key={producer.id}
                      href={producer.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white text-sm hover:from-purple-500/30 hover:to-pink-500/30 transition-colors border border-white/10"
                    >
                      {producer.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {writers && writers.length > 0 && (
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Writers</p>
                <div className="flex flex-wrap gap-2">
                  {writers.map((writer) => (
                    <a 
                      key={writer.id}
                      href={writer.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white text-sm hover:from-blue-500/30 hover:to-cyan-500/30 transition-colors border border-white/10"
                    >
                      {writer.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
