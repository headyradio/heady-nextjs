import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, User } from "lucide-react";
import { FormattedText } from "./FormattedText";

interface GeniusArtistBioProps {
  geniusData: {
    name: string;
    description?: {
      plain: string;
    };
    alternate_names?: string[];
    url: string;
  };
}

export const GeniusArtistBio = ({ geniusData }: GeniusArtistBioProps) => {
  if (!geniusData.description?.plain) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5" />
          <h3 className="text-lg font-semibold">About {geniusData.name}</h3>
        </div>
        <Badge variant="secondary" className="gap-1">
          <ExternalLink className="w-3 h-3" />
          Genius
        </Badge>
      </div>

      <div className="space-y-4">
        {geniusData.alternate_names && geniusData.alternate_names.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Also known as:</p>
            <div className="flex flex-wrap gap-2">
              {geniusData.alternate_names.map((name, index) => (
                <Badge key={index} variant="outline">{name}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground leading-relaxed">
          <FormattedText text={geniusData.description.plain} className="mb-3 last:mb-0" />
        </div>

        <a
          href={geniusData.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          View full profile on Genius
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </Card>
  );
};
