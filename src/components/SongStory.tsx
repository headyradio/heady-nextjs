import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Song Meaning & Story
        </h3>
        <Badge variant="secondary" className="gap-1">
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
        </Badge>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none">
        <div className="text-muted-foreground leading-relaxed">
          <FormattedText text={description} className="mb-4 last:mb-0" />
        </div>
      </div>

      {isFromGenius && geniusUrl && (
        <a
          href={geniusUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-4"
        >
          Read annotations and more on Genius
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </Card>
  );
};
