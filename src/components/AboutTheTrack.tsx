import { TrackInformation } from "./TrackInformation";
import { SongStory } from "./SongStory";
import { Credits } from "./Credits";

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
      <h2 className="text-3xl font-bold">About the Track</h2>
      
      <div className="grid md:grid-cols-[300px_1fr] gap-6">
        <TrackInformation
          releaseDate={geniusData?.release_date}
          album={geniusData?.album}
          duration={duration}
          featuredArtists={geniusData?.featured_artists}
        />
        
        <SongStory
          description={description}
          geniusUrl={geniusData?.url}
          isFromGenius={isFromGenius}
        />
      </div>

      <Credits
        producers={geniusData?.producer_artists}
        writers={geniusData?.writer_artists}
      />
    </div>
  );
};
