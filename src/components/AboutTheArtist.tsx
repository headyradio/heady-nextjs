import { Button } from "@/components/ui/button";
import { User, ExternalLink, Instagram, Twitter, Facebook, Radio, Calendar, TrendingUp, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { useCombinedArtistData } from "@/hooks/useCombinedArtistData";

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
  const artistData = useCombinedArtistData(artistName);
  const description = artistData.bio || geniusData?.description?.plain || aiContent;
  const isFromGenius = Boolean(geniusData?.description?.plain);
  const artistImage = artistData.image;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
          <User className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">About the Artist</h2>
      </div>

      <div className="grid md:grid-cols-[1fr_280px] gap-6">
        {/* Artist Bio Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          {/* Artist Image from MusicBrainz */}
          {artistImage && (
            <div className="float-right ml-4 mb-4">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden ring-2 ring-white/10 shadow-xl">
                <img 
                  src={artistImage} 
                  alt={`${artistName} artist photo`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  width="160"
                  height="160"
                />
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              {geniusData?.name || artistName}
            </h3>
            {isFromGenius && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs border border-white/10">
                <ExternalLink className="w-3 h-3" />
                Genius
              </span>
            )}
          </div>

          {geniusData?.alternate_names && geniusData.alternate_names.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Also known as</p>
              <div className="flex flex-wrap gap-2">
                {geniusData.alternate_names.map((name, index) => (
                  <span key={index} className="px-2 py-1 rounded-full bg-white/10 text-white/70 text-xs border border-white/10">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {description && (
            <div className="prose prose-sm prose-invert max-w-none mb-4">
              <p className="text-white/70 leading-relaxed whitespace-pre-line">
                {(() => {
                  const cleanBio = description
                    .replace(/<a[^>]*>.*?<\/a>/gi, '')
                    .replace(/<[^>]+>/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
                  return cleanBio.length > 600 ? `${cleanBio.substring(0, 600)}...` : cleanBio;
                })()}
              </p>
            </div>
          )}

          {/* Social Media Links */}
          {geniusData && (geniusData.instagram_name || geniusData.twitter_name || geniusData.facebook_name) && (
            <div className="flex flex-wrap gap-2 mb-4 pt-4 border-t border-white/10">
              {geniusData.instagram_name && (
                <a 
                  href={`https://instagram.com/${geniusData.instagram_name}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white text-sm hover:from-purple-500/30 hover:to-pink-500/30 transition-colors border border-white/10"
                  aria-label={`Follow ${artistName} on Instagram`}
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </a>
              )}
              {geniusData.twitter_name && (
                <a 
                  href={`https://twitter.com/${geniusData.twitter_name}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors border border-white/10"
                  aria-label={`Follow ${artistName} on Twitter`}
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </a>
              )}
              {geniusData.facebook_name && (
                <a 
                  href={`https://facebook.com/${geniusData.facebook_name}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/20 text-white text-sm hover:bg-blue-500/30 transition-colors border border-white/10"
                  aria-label={`Follow ${artistName} on Facebook`}
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </a>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {isFromGenius && geniusData?.url && (
              <a
                href={geniusData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium"
              >
                View on Genius
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            
            <Link to={`/artist/${encodeURIComponent(artistName)}`}>
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                View Full Artist Page
              </Button>
            </Link>
          </div>
        </div>

        {/* HEADY Stats Card */}
        <div className="bg-gradient-to-br from-primary/20 via-purple-900/30 to-pink-900/20 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" />
            HEADY.FM Stats
          </h3>

          <div className="space-y-6">
            <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
              <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-3xl font-black text-white">{headyStats.totalPlays}</p>
              <p className="text-xs text-white/50 uppercase tracking-wider">Total Plays</p>
            </div>

            <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
              <Music className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-3xl font-black text-white">{headyStats.uniqueSongs}</p>
              <p className="text-xs text-white/50 uppercase tracking-wider">Unique Songs</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-white/10">
              {headyStats.firstPlayed && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-white/50" />
                  <div>
                    <p className="text-xs text-white/50">First Played</p>
                    <p className="text-sm font-medium text-white">{new Date(headyStats.firstPlayed).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {headyStats.lastPlayed && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-white/50" />
                  <div>
                    <p className="text-xs text-white/50">Last Played</p>
                    <p className="text-sm font-medium text-white">{new Date(headyStats.lastPlayed).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
