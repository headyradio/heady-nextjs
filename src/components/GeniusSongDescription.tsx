import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, BookOpen } from "lucide-react";
import { FormattedText } from "./FormattedText";

interface GeniusSongDescriptionProps {
  geniusData: {
    description?: {
      plain: string;
    };
    url: string;
  };
}

export const GeniusSongDescription = ({ geniusData }: GeniusSongDescriptionProps) => {
  if (!geniusData.description?.plain) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Song Meaning & Story</h3>
        </div>
        <Badge variant="secondary" className="gap-1">
          <ExternalLink className="w-3 h-3" />
          Genius
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="text-sm text-muted-foreground leading-relaxed">
          <FormattedText text={geniusData.description.plain} className="mb-3 last:mb-0" />
        </div>

        <a
          href={geniusData.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          Read annotations and more on Genius
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </Card>
  );
};
