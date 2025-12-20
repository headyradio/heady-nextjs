import { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, EyeOff, Shuffle } from 'lucide-react';

// Video sources - Bunny.net CDN optimized videos
// Using direct MP4 URLs from Bunny Stream
const VIDEO_SOURCES = [
  {
    id: 'heady-video-1',
    // Bunny.net direct MP4 URL
    mp4: 'https://vz-dfce7f34-8cf.b-cdn.net/97c80ca6-7270-4ddd-9320-61045626ec0f/play_720p.mp4',
    poster: 'https://vz-dfce7f34-8cf.b-cdn.net/97c80ca6-7270-4ddd-9320-61045626ec0f/thumbnail.jpg',
  },
  {
    id: 'heady-video-2',
    mp4: 'https://vz-dfce7f34-8cf.b-cdn.net/f1a4e466-ef26-4678-8d90-c7f2394e5b2e/play_720p.mp4',
    poster: 'https://vz-dfce7f34-8cf.b-cdn.net/f1a4e466-ef26-4678-8d90-c7f2394e5b2e/thumbnail.jpg',
  },
  {
    id: 'heady-video-3',
    mp4: 'https://vz-dfce7f34-8cf.b-cdn.net/455bc98a-f9db-444d-b46b-b8c2c409ebc6/play_720p.mp4',
    poster: 'https://vz-dfce7f34-8cf.b-cdn.net/455bc98a-f9db-444d-b46b-b8c2c409ebc6/thumbnail.jpg',
  },
  {
    id: 'heady-video-4',
    mp4: 'https://vz-dfce7f34-8cf.b-cdn.net/8fd83747-89a7-406b-aab0-50336a3967f7/play_720p.mp4',
    poster: 'https://vz-dfce7f34-8cf.b-cdn.net/8fd83747-89a7-406b-aab0-50336a3967f7/thumbnail.jpg',
  },
  {
    id: 'heady-video-5',
    mp4: 'https://vz-dfce7f34-8cf.b-cdn.net/4a340bd6-0ec8-46ab-afa2-3d5d1d49fd1e/play_720p.mp4',
    poster: 'https://vz-dfce7f34-8cf.b-cdn.net/4a340bd6-0ec8-46ab-afa2-3d5d1d49fd1e/thumbnail.jpg',
  },
  {
    id: 'heady-video-6',
    mp4: 'https://vz-dfce7f34-8cf.b-cdn.net/f8c80976-17e2-4995-a038-1e14b70cd939/play_720p.mp4',
    poster: 'https://vz-dfce7f34-8cf.b-cdn.net/f8c80976-17e2-4995-a038-1e14b70cd939/thumbnail.jpg',
  },
];

// Select a random video - switches on EVERY page load
const getRandomVideo = () => {
  return VIDEO_SOURCES[Math.floor(Math.random() * VIDEO_SOURCES.length)];
};

export const VideoHero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Load collapsed state from localStorage
    const stored = localStorage.getItem('heady-hero-collapsed');
    return stored === 'true';
  });
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(getRandomVideo);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference (accessibility)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Intersection Observer - only play video when visible (performance optimization)
  useEffect(() => {
    if (!videoRef.current || !containerRef.current || !isVideoEnabled || prefersReducedMotion || isCollapsed) return;

    const videoElement = videoRef.current;
    
    // Immediately try to play the video
    const playVideo = async () => {
      try {
        await videoElement.play();
        console.log('Video playing successfully:', currentVideo.id);
      } catch (error) {
        console.error('Video autoplay failed:', error);
      }
    };

    playVideo();

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoElement.play().catch(() => {});
        } else {
          videoElement.pause();
        }
      },
      { threshold: 0.1 } // Lower threshold for better responsiveness
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isVideoEnabled, prefersReducedMotion, isCollapsed, currentVideo]);

  // Handle video load complete
  const handleVideoLoaded = useCallback(() => {
    setIsVideoLoaded(true);
  }, []);

  // Toggle collapsed state
  const toggleCollapsed = () => {
    setIsCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('heady-hero-collapsed', String(newState));
      return newState;
    });
  };

  // Shuffle to random video
  const shuffleVideo = () => {
    // Get a random video that's different from the current one
    let newVideo;
    do {
      newVideo = getRandomVideo();
    } while (newVideo.id === currentVideo.id && VIDEO_SOURCES.length > 1);
    
    setIsVideoLoaded(false); // Reset loaded state for smooth transition
    setCurrentVideo(newVideo);
    console.log('Shuffling to video:', newVideo.id);
  };

  const showVideo = isVideoEnabled && !prefersReducedMotion;

  return (
    <section 
      ref={containerRef}
      className={`relative w-[calc(100%-2rem)] md:w-[calc(100%-2rem)] overflow-hidden bg-black mx-4 my-4 rounded-2xl md:rounded-3xl transition-all duration-500 ${
        isCollapsed 
          ? 'h-24 md:h-28' 
          : 'h-[70vh] md:h-[65vh] min-h-[500px] md:min-h-[550px]'
      }`}
      aria-label="Video hero section"
    >
      {!isCollapsed && (
        <>
          {/* Poster/Fallback Image - Always present for fast LCP */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{ 
              backgroundImage: `url(${currentVideo.poster})`,
              opacity: isVideoLoaded && showVideo ? 0 : 1,
            }}
            aria-hidden="true"
          />

          {/* Video Background */}
          {showVideo && (
            <video
              ref={videoRef}
              key={currentVideo.id} // Force re-render when video changes
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                isVideoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={currentVideo.poster}
              onLoadedData={handleVideoLoaded}
              aria-label="Background video"
            >
              <source src={currentVideo.mp4} type="video/mp4" />
            </video>
          )}

          {/* Gradient Overlay for text readability - stronger at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" aria-hidden="true" />

          {/* Content - Anchored to Bottom, Centered */}
          <div className="relative h-full flex items-end justify-center">
            <div className="w-full px-4 md:px-8 pb-12 md:pb-16 text-center overflow-hidden">
              <h1 
                className="font-black text-white uppercase tracking-tight leading-none drop-shadow-2xl"
                style={{ 
                  fontSize: 'min(5vw, 3.5rem)',
                  textShadow: '0 4px 40px rgba(0,0,0,0.8)'
                }}
              >
                Extraterrestrial Radio
              </h1>
            </div>
          </div>

          {/* Progress Line Decoration (Genesis-style) */}
          <div className="absolute bottom-0 left-0 right-0 hidden md:flex items-center px-6 py-4" aria-hidden="true">
            <div className="w-2 h-2 rounded-full bg-white/40" />
            <div className="flex-1 h-px bg-gradient-to-r from-white/20 via-white/10 to-transparent mx-2" />
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <div className="flex-1 h-px bg-gradient-to-l from-white/20 via-white/10 to-transparent mx-2" />
            <div className="w-2 h-2 rounded-full bg-white/40" />
          </div>
        </>
      )}

      {/* Collapsed State - Show minimal info */}
      {isCollapsed && (
        <div className="relative h-full flex items-center justify-center">
          <h1 
            className="font-black text-white uppercase tracking-tight leading-none drop-shadow-2xl"
            style={{ 
              fontSize: 'min(5vw, 3.5rem)',
              textShadow: '0 4px 40px rgba(0,0,0,0.8)'
            }}
          >
            Extraterrestrial Radio
          </h1>
        </div>
      )}

      {/* Button Group - Bottom Right */}
      <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 flex gap-2 z-10">
        {/* Shuffle Video Button */}
        {!isCollapsed && (
          <button
            onClick={shuffleVideo}
            className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/60 hover:text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Shuffle to random video"
            title="Shuffle video"
          >
            <Shuffle className="w-4 h-4 transition-opacity group-hover:opacity-100" />
          </button>
        )}
        
        {/* Toggle Collapse Button */}
        <button
          onClick={toggleCollapsed}
          className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/60 hover:text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
          aria-label={isCollapsed ? 'Expand hero section' : 'Collapse hero section'}
          aria-expanded={!isCollapsed}
          title={isCollapsed ? 'Expand hero section' : 'Collapse hero section'}
        >
          {isCollapsed ? (
            <Eye className="w-4 h-4 transition-opacity group-hover:opacity-100" />
          ) : (
            <EyeOff className="w-4 h-4 transition-opacity group-hover:opacity-100" />
          )}
        </button>
      </div>
    </section>
  );
};

