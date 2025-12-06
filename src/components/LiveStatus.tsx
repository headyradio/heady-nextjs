import { Radio } from 'lucide-react';

interface LiveStatusProps {
  isLive: boolean;
  listenersCount: number;
}

export const LiveStatus = ({ isLive, listenersCount }: LiveStatusProps) => {
  return (
    <div className="flex items-center gap-4">
      {isLive && (
        <div className="live-badge">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>LIVE</span>
        </div>
      )}
      
      <div className="flex items-center gap-2 text-foreground font-medium">
        <Radio className="w-5 h-5" />
        <span className="font-bold">{listenersCount}</span>
        <span className="text-sm">listeners</span>
      </div>
    </div>
  );
};
