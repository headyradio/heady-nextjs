import { Card } from "@/components/ui/card";
import { History, Radio, User, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface Transmission {
  id: string;
  play_started_at: string;
  dj_name?: string;
  show_name?: string;
  listeners_count?: number;
}

interface PlayHistoryTimelineProps {
  transmissions: Transmission[];
}

export const PlayHistoryTimeline = ({ transmissions }: PlayHistoryTimelineProps) => {
  if (!transmissions || transmissions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold flex items-center gap-2">
        <History className="w-8 h-8" />
        Play History on HEADY
      </h2>

      <Card className="p-6">
        <div className="space-y-4">
          {transmissions.map((transmission, index) => (
            <div 
              key={transmission.id}
              className="flex items-start gap-4 pb-4 border-b last:border-b-0 last:pb-0"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Radio className="w-6 h-6 text-primary" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    {format(new Date(transmission.play_started_at), 'PPP')}
                  </p>
                  <span className="text-muted-foreground">•</span>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(transmission.play_started_at), 'p')}
                  </p>
                </div>

                {transmission.show_name && (
                  <Link 
                    to={`/archives?show=${encodeURIComponent(transmission.show_name)}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {transmission.show_name}
                  </Link>
                )}

                {transmission.dj_name && (
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      DJ {transmission.dj_name}
                    </p>
                  </div>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                #{transmissions.length - index}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
