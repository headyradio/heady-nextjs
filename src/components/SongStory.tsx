import { BookOpen, ExternalLink, Sparkles } from "lucide-react";
import { FormattedText } from "./FormattedText";

interface SongStoryProps {
  description?: string;
  geniusUrl?: string;
  isFromGenius: boolean;
}

export const SongStory = ({ description, geniusUrl, isFromGenius }: SongStoryProps) => {
  if (!description) return null;

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-fit">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          Song Meaning & Story
        </h3>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs border border-white/10">
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
        </span>
      </div>

      <div className="prose prose-sm prose-invert max-w-none">
        <div className="text-white/80 leading-relaxed">
          <FormattedText text={description} className="mb-4 last:mb-0" />
        </div>
      </div>

      {isFromGenius && geniusUrl && (
        <a
          href={geniusUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 mt-4 font-medium"
        >
          Read annotations and more on Genius
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
};
