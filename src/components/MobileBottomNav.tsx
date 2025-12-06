import { Radio, Heart, History, Flame, Mic } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  onTabChange?: (tab: 'player' | 'history' | 'hot40' | 'shows' | 'support') => void;
  activeTab?: 'player' | 'history' | 'hot40' | 'shows' | 'support';
}

export const MobileBottomNav = ({ onTabChange, activeTab = 'player' }: MobileBottomNavProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  if (!isHomePage) return null;

  const handleTabClick = (tab: 'player' | 'history' | 'hot40' | 'shows' | 'support') => {
    onTabChange?.(tab);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border z-40 shadow-2xl" aria-label="Mobile navigation">
      <div className="flex justify-around items-center h-16 px-1 max-w-lg mx-auto" role="tablist">
        <button
          onClick={() => handleTabClick('player')}
          aria-label="On Air - View current playing track"
          aria-selected={activeTab === 'player'}
          role="tab"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 flex-1 h-14 transition-all relative rounded-lg",
            activeTab === 'player' ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted/50"
          )}
        >
          <Radio className={cn("h-4 w-4", activeTab === 'player' && "scale-110")} aria-hidden="true" />
          <span className="text-[9px] font-bold uppercase tracking-wide">On Air</span>
        </button>

        <button
          onClick={() => handleTabClick('history')}
          aria-label="History - View play history"
          aria-selected={activeTab === 'history'}
          role="tab"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 flex-1 h-14 transition-all relative rounded-lg",
            activeTab === 'history' ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted/50"
          )}
        >
          <History className={cn("h-4 w-4", activeTab === 'history' && "scale-110")} aria-hidden="true" />
          <span className="text-[9px] font-bold uppercase tracking-wide">History</span>
        </button>

        <button
          onClick={() => handleTabClick('hot40')}
          aria-label="Hot 40 - View top 40 most played songs"
          aria-selected={activeTab === 'hot40'}
          role="tab"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 flex-1 h-14 transition-all relative rounded-lg",
            activeTab === 'hot40' ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted/50"
          )}
        >
          <Flame className={cn("h-4 w-4", activeTab === 'hot40' && "scale-110")} aria-hidden="true" />
          <span className="text-[9px] font-bold uppercase tracking-wide">Hot 40</span>
        </button>

        <button
          onClick={() => handleTabClick('shows')}
          aria-label="Shows - View scheduled shows and events"
          aria-selected={activeTab === 'shows'}
          role="tab"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 flex-1 h-14 transition-all relative rounded-lg",
            activeTab === 'shows' ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted/50"
          )}
        >
          <Mic className={cn("h-4 w-4", activeTab === 'shows' && "scale-110")} aria-hidden="true" />
          <span className="text-[9px] font-bold uppercase tracking-wide">Shows</span>
        </button>

        <button
          onClick={() => handleTabClick('support')}
          aria-label="Support - Support HEADY.FM"
          aria-selected={activeTab === 'support'}
          role="tab"
          className={cn(
            "flex flex-col items-center justify-center gap-0.5 flex-1 h-14 transition-all relative rounded-lg",
            activeTab === 'support' ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted/50"
          )}
        >
          <Heart className={cn("h-4 w-4", activeTab === 'support' && "scale-110 fill-current")} aria-hidden="true" />
          <span className="text-[9px] font-bold uppercase tracking-wide">Support</span>
        </button>
      </div>
    </nav>
  );
};
