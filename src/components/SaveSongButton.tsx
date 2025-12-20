import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSavedSongs } from '@/hooks/useSavedSongs';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface SaveSongButtonProps {
  artist: string;
  title: string;
  album?: string | null;
  albumArtUrl?: string | null;
  artworkId?: string | null;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const SaveSongButton = ({
  artist,
  title,
  album,
  albumArtUrl,
  artworkId,
  variant = 'ghost',
  size = 'lg'
}: SaveSongButtonProps) => {
  const { user } = useAuth();
  const { isSongSaved, saveSong, unsaveSong } = useSavedSongs(user?.id);
  const navigate = useNavigate();

  const saved = isSongSaved(artist, title);

  const handleClick = async () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to save songs',
      });
      navigate('/auth');
      return;
    }

    try {
      if (saved) {
        await unsaveSong.mutateAsync({ artist, title });
        toast({ title: 'Song removed from saved songs' });
      } else {
        await saveSong.mutateAsync({
          artist,
          title,
          album,
          albumArtUrl: albumArtUrl,
          artworkId
        });
        toast({ title: 'Song saved!' });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const tooltipMessage = !user 
    ? "Sign in to save songs"
    : saved 
      ? "Remove from My HEADY" 
      : "Save to My HEADY";

  return (
    <TooltipProvider>
      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleClick}
            disabled={saveSong.isPending || unsaveSong.isPending}
            className="hover:scale-110 transition-transform md:bg-white/10 md:hover:bg-white/20 md:border md:border-white/20"
          >
            <Heart className={`${size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'} ${saved ? 'fill-white text-white md:fill-white md:text-white' : 'md:text-white/60'}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          align="center"
          sideOffset={5}
          className="z-[9999] max-w-[200px] text-center"
        >
          <p>{tooltipMessage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SaveSongButton;
