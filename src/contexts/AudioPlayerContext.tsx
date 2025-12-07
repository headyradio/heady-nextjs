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

interface AudioPlayerContextValue extends AudioPlayerState {
  play: () => Promise<void>;
  pause: () => void;
  stop: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

const AudioPlayerContext = React.createContext<AudioPlayerContextValue | undefined>(undefined);

const STREAM_URL = 'https://streams.radiomast.io/3049eeff-028f-4acb-a907-dc90fe19f828';

export const AudioPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = React.useState<AudioPlayerState>({
    isPlaying: false,
    volume: 1.0, // Start at full volume - let OS handle system volume
    isMuted: false,
    error: null,
    isBuffering: false,
    connectionStatus: 'idle',
    hasUserInteracted: false,
  });

  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const reconnectTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = React.useRef(0);
  const hasLoadedRef = React.useRef(false);

  React.useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      
      // Minimal configuration for cleanest playback path
      // Use 'metadata' instead of 'none' to allow initial connection
      // 'none' can prevent the audio element from being ready to play
      audio.preload = 'metadata';
      
      // RadioMast streams typically need CORS for cross-origin requests
      audio.crossOrigin = 'anonymous';
      
      // Set source
      audio.src = STREAM_URL;
      
      // Start at full volume (1.0) - let OS handle system volume
      audio.volume = 1.0;
      
      // Preserve pitch (prevents resampling artifacts)
      // Modern browsers handle this automatically, but explicit is safer
      if ('preservesPitch' in audio) {
        audio.preservesPitch = true;
      }
      
      // Disable any automatic gain control or processing
      // These properties help ensure clean playback
      if ('mozPreservesPitch' in audio) {
        (audio as any).mozPreservesPitch = true;
      }
      if ('webkitPreservesPitch' in audio) {
        (audio as any).webkitPreservesPitch = true;
      }
      
      audioRef.current = audio;

      const handleError = (e: Event) => {
        console.error('Audio error:', e);
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to load audio stream', 
          isPlaying: false, 
          connectionStatus: 'error', 
          isBuffering: false 
        }));
        
        if (reconnectAttemptsRef.current < 3) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            if (audioRef.current && state.isPlaying) {
              console.log('Attempting to reconnect audio stream...');
              setState(prev => ({ ...prev, connectionStatus: 'connecting', isBuffering: true }));
              // Don't call load() - just retry play() to avoid re-buffering
              audioRef.current?.play().catch(err => {
                console.error('Reconnection failed:', err);
              });
            }
          }, 2000);
        }
      };

      const handleCanPlay = () => {
        setState(prev => ({ 
          ...prev, 
          error: null, 
          isBuffering: false, 
          connectionStatus: prev.isPlaying ? 'streaming' : 'idle' 
        }));
        reconnectAttemptsRef.current = 0;
        hasLoadedRef.current = true;
      };

      const handlePlaying = () => {
        console.log('Audio playing event fired - stream is now playing');
        setState(prev => ({ 
          ...prev, 
          isPlaying: true, 
          error: null, 
          connectionStatus: 'streaming', 
          isBuffering: false 
        }));
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
        // Don't call load() - let the browser handle recovery naturally
        // Calling load() can cause re-buffering and quality loss
      };

      const handleWaiting = () => {
        setState(prev => ({ ...prev, isBuffering: true }));
      };

      const handleCanPlayThrough = () => {
        // Stream is ready to play through without stopping
        setState(prev => ({ ...prev, isBuffering: false }));
      };

      const handleLoadStart = () => {
        setState(prev => ({ ...prev, connectionStatus: 'connecting', isBuffering: true }));
      };

      audio.addEventListener('error', handleError);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('canplaythrough', handleCanPlayThrough);
      audio.addEventListener('playing', handlePlaying);
      audio.addEventListener('pause', handlePause);
      audio.addEventListener('stalled', handleStalled);
      audio.addEventListener('waiting', handleWaiting);
      audio.addEventListener('loadstart', handleLoadStart);
      
      return () => {
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('canplaythrough', handleCanPlayThrough);
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
    };
  }, []);

  const ensureStreamSource = () => {
    if (audioRef.current && !audioRef.current.src) {
      audioRef.current.src = STREAM_URL;
    }
  };

  const play = async () => {
    if (!audioRef.current) return;
    ensureStreamSource();
    
    try {
      console.log('Play initiated - setting connecting state');
      setState(prev => ({ ...prev, connectionStatus: 'connecting', isBuffering: true, hasUserInteracted: true, isPlaying: false }));
      
      // Load the audio if it hasn't been loaded yet
      // This is necessary for streams with preload='metadata'
      if (!hasLoadedRef.current) {
        audioRef.current.load();
        hasLoadedRef.current = true;
        // Wait a moment for load to start
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        console.log('Play promise resolved - waiting for playing event');
        // Note: isPlaying will be set to true in the 'playing' event handler
        reconnectAttemptsRef.current = 0;
      }
    } catch (err) {
      console.error('Play error:', err);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to play audio', 
        isPlaying: false, 
        connectionStatus: 'error', 
        isBuffering: false 
      }));
      
      // If play fails, try loading first then playing
      setTimeout(() => {
        if (audioRef.current) {
          // Only reload if we haven't loaded yet
          if (!hasLoadedRef.current) {
            audioRef.current.load();
            hasLoadedRef.current = true;
          }
          audioRef.current.play().catch(e => {
            console.error('Retry play failed:', e);
          });
        }
      }, 1000);
    }
  };

  const stop = () => {
    if (!audioRef.current) return;
    // Fully stop and unload stream
    audioRef.current.pause();
    audioRef.current.removeAttribute('src');
    audioRef.current.load();
    hasLoadedRef.current = false;
    setState(prev => ({
      ...prev,
      isPlaying: false,
      connectionStatus: 'idle',
      isBuffering: false,
      error: null,
      hasUserInteracted: true,
    }));
  };

  const pause = () => {
    stop();
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

  const value: AudioPlayerContextValue = {
    ...state,
    play,
    pause,
    stop,
    togglePlay,
    setVolume,
    toggleMute,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useGlobalAudioPlayer = () => {
  const context = React.useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useGlobalAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
};
