import { TrackInformation } from "./TrackInformation";
import { SongStory } from "./SongStory";
import { Info } from "lucide-react";

interface AboutTheTrackProps {
  geniusData?: {
    release_date?: string;
    album?: {
      name: string;
      cover_art_url: string;
    };
    featured_artists?: Array<{ id: number; name: string; url: string }>;
    producer_artists?: Array<{ id: number; name: string; url: string }>;
    writer_artists?: Array<{ id: number; name: string; url: string }>;
    description?: {
      plain: string;
    };
    url: string;
  };
  aiContent?: string;
  duration?: string;
}

export const AboutTheTrack = ({ geniusData, aiContent, duration }: AboutTheTrackProps) => {
  const description = geniusData?.description?.plain || aiContent;
  const isFromGenius = Boolean(geniusData?.description?.plain);
  
  const hasTrackInfo = Boolean(
    geniusData?.release_date || 
    geniusData?.album || 
    duration || 
    geniusData?.featured_artists?.length || 
    geniusData?.producer_artists?.length || 
    geniusData?.writer_artists?.length
  );

  // If we have both track info and description, show two-column layout
  // If we only have one, show single column
  const showTwoColumns = hasTrackInfo && description;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
          <Info className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">About the Track</h2>
      </div>
      
      <div className={showTwoColumns ? "grid md:grid-cols-2 lg:grid-cols-[400px_1fr] gap-6" : "max-w-2xl"}>
        {hasTrackInfo && (
          <TrackInformation
            releaseDate={geniusData?.release_date}
            album={geniusData?.album}
            duration={duration}
            featuredArtists={geniusData?.featured_artists}
            producers={geniusData?.producer_artists}
            writers={geniusData?.writer_artists}
          />
        )}
        
        {description && (
          <SongStory
            description={description}
            geniusUrl={geniusData?.url}
            isFromGenius={isFromGenius}
          />
        )}
      </div>
      
      {!hasTrackInfo && !description && (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-white/60">No track information available yet.</p>
        </div>
      )}
    </div>
  );
};
