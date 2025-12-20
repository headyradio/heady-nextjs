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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
          <Info className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">About the Track</h2>
      </div>
      
      <div className="grid md:grid-cols-[320px_1fr] gap-6">
        <TrackInformation
          releaseDate={geniusData?.release_date}
          album={geniusData?.album}
          duration={duration}
          featuredArtists={geniusData?.featured_artists}
          producers={geniusData?.producer_artists}
          writers={geniusData?.writer_artists}
        />
        
        <SongStory
          description={description}
          geniusUrl={geniusData?.url}
          isFromGenius={isFromGenius}
        />
      </div>
    </div>
  );
};
