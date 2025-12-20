import { History, Radio, User, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";

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
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
          <History className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Play History</h2>
      </div>

      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
        <div className="divide-y divide-white/10">
          {transmissions.map((transmission, index) => (
            <div 
              key={transmission.id}
              className="flex items-center gap-4 p-4 md:p-5 hover:bg-white/5 transition-colors"
            >
              <div className="flex-1 min-w-0">
                {/* Date & Time */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                  <div className="flex items-center gap-1.5 text-white">
                    <Calendar className="w-3.5 h-3.5 text-white/50" />
                    <span className="text-sm font-medium">
                      {format(new Date(transmission.play_started_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/60">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-sm">
                      {format(new Date(transmission.play_started_at), 'h:mm a')}
                    </span>
                  </div>
                </div>

                {/* Show & DJ */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {transmission.show_name && (
                    <Link 
                      to={`/archives?show=${encodeURIComponent(transmission.show_name)}`}
                      className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                    >
                      {transmission.show_name}
                    </Link>
                  )}

                  {transmission.dj_name && (
                    <div className="flex items-center gap-1.5 text-white/50 text-sm">
                      <User className="w-3 h-3" />
                      <span>DJ {transmission.dj_name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Time ago - Desktop only */}
              <div className="hidden md:block text-sm text-white/40">
                {formatDistanceToNow(new Date(transmission.play_started_at), { addSuffix: true })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
