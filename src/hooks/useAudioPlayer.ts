import * as React from 'react';

interface AudioPlayerState {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  error: string | null;
  isBuffering: boolean;
  connectionStatus: 'idle' | 'connecting' | 'streaming' | 'error';
  hasUserInteracted: boolean;
}

export const useAudioPlayer = (streamUrl: string) => {
  const [state, setState] = React.useState<AudioPlayerState>({
    isPlaying: false,
    volume: 0.7,
    isMuted: false,
    error: null,
    isBuffering: false,
    connectionStatus: 'idle',
    hasUserInteracted: false,
  });

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const reconnectTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = React.useRef(0);

  React.useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      
      // Optimize for high-quality streaming
      audio.preload = 'auto'; // Preload the audio for better quality
      audio.crossOrigin = 'anonymous'; // Enable CORS for streaming
      
      // Set the source after configuring attributes
      audio.src = streamUrl;
      audio.volume = 0.7;
      
      // Preserve pitch and quality during playback
      audio.preservesPitch = true;
      
      // Set vendor-prefixed properties for older browsers (type-cast to access them)
      (audio as any).mozPreservesPitch = true;
      (audio as any).webkitPreservesPitch = true;
      
      audioRef.current = audio;

      const handleError = (e: Event) => {
        console.error('Audio error:', e);
        setState(prev => ({ ...prev, error: 'Failed to load audio stream', isPlaying: false, connectionStatus: 'error', isBuffering: false }));
        
        // Attempt to reconnect after error (for stream interruptions)
        if (reconnectAttemptsRef.current < 3) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            if (audioRef.current && state.isPlaying) {
              console.log('Attempting to reconnect audio stream...');
              setState(prev => ({ ...prev, connectionStatus: 'connecting', isBuffering: true }));
              audioRef.current.load();
              audioRef.current.play().catch(err => {
                console.error('Reconnection failed:', err);
              });
            }
          }, 2000);
        }
      };

      const handleCanPlay = () => {
        setState(prev => ({ ...prev, error: null, isBuffering: false, connectionStatus: prev.isPlaying ? 'streaming' : 'idle' }));
        reconnectAttemptsRef.current = 0;
      };

      const handlePlaying = () => {
        setState(prev => ({ ...prev, isPlaying: true, error: null, connectionStatus: 'streaming', isBuffering: false }));
        reconnectAttemptsRef.current = 0;
      };

      const handlePause = () => {
        if (audioRef.current && !audioRef.current.ended) {
          setState(prev => ({ ...prev, isPlaying: false, connectionStatus: 'idle', isBuffering: false }));
        }
      };

      const handleStalled = () => {
        console.warn('Audio stream stalled, attempting to recover...');
        setState(prev => ({ ...prev, isBuffering: true }));
        if (audioRef.current && state.isPlaying) {
          audioRef.current.load();
          audioRef.current.play().catch(err => {
            console.error('Recovery failed:', err);
          });
        }
      };

      const handleWaiting = () => {
        console.log('Audio buffering...');
        setState(prev => ({ ...prev, isBuffering: true }));
      };

      const handleLoadStart = () => {
        setState(prev => ({ ...prev, connectionStatus: 'connecting', isBuffering: true }));
      };

      audio.addEventListener('error', handleError);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('playing', handlePlaying);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('stalled', handleStalled);
      audio.addEventListener('waiting', handleWaiting);
      audio.addEventListener('loadstart', handleLoadStart);
      
      // Cleanup event listeners
      return () => {
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('playing', handlePlaying);
        audio.removeEventListener('pause', handlePause);
        audio.removeEventListener('stalled', handleStalled);
        audio.removeEventListener('waiting', handleWaiting);
        audio.removeEventListener('loadstart', handleLoadStart);
      };
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, [streamUrl]);

  const ensureStreamSource = () => {
    if (audioRef.current && !audioRef.current.src) {
      audioRef.current.src = streamUrl;
    }
  };

  const play = async () => {
    if (!audioRef.current) return;
    ensureStreamSource();
    
    try {
      setState(prev => ({ ...prev, connectionStatus: 'connecting', isBuffering: true, hasUserInteracted: true }));

      // Use a promise to handle play with better error recovery
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        setState(prev => ({ ...prev, isPlaying: true, error: null, connectionStatus: 'streaming' }));
        reconnectAttemptsRef.current = 0;
      }
    } catch (err) {
      console.error('Play error:', err);
      setState(prev => ({ ...prev, error: 'Failed to play audio', isPlaying: false, connectionStatus: 'error', isBuffering: false }));
      
      // Try reloading and playing again after a brief delay
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current.play().catch(e => {
            console.error('Retry play failed:', e);
          });
        }
      }, 1000);
    }
  };

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.removeAttribute('src');
    audioRef.current.load();
    setState(prev => ({ ...prev, isPlaying: false, connectionStatus: 'idle', isBuffering: false, hasUserInteracted: true, error: null }));
  };

  const togglePlay = () => {
    if (state.isPlaying) {
      stop();
    } else {
      play();
    }
  };

  const setVolume = (volume: number) => {
    if (!audioRef.current) return;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    audioRef.current.volume = clampedVolume;
    setState(prev => ({ ...prev, volume: clampedVolume }));
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMutedState = !state.isMuted;
    audioRef.current.muted = newMutedState;
    setState(prev => ({ ...prev, isMuted: newMutedState }));
  };

  return {
    ...state,
    play,
    pause: stop,
    stop,
    togglePlay,
    setVolume,
    toggleMute,
  };
};
