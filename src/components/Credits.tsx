import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

interface CreditsProps {
  producers?: Array<{ id: number; name: string; url: string }>;
  writers?: Array<{ id: number; name: string; url: string }>;
}

export const Credits = ({ producers, writers }: CreditsProps) => {
  if ((!producers || producers.length === 0) && (!writers || writers.length === 0)) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Award className="w-5 h-5" />
        Credits
      </h3>

      <div className="space-y-4">
        {producers && producers.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Producers</p>
            <div className="flex flex-wrap gap-2">
              {producers.map((producer) => (
                <Badge key={producer.id} variant="outline">
                  <a href={producer.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {producer.name}
                  </a>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {writers && writers.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Writers</p>
            <div className="flex flex-wrap gap-2">
              {writers.map((writer) => (
                <Badge key={writer.id} variant="outline">
                  <a href={writer.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {writer.name}
                  </a>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
