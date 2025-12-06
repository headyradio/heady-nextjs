import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Play, Pause, ChevronUp, ChevronDown } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Link } from 'react-router-dom';
import { useHeroCards } from '@/hooks/useHeroCards';
import rouxbaisImage from '@/assets/rouxbais.png';
import daleImage from '@/assets/dale.png';
import adFreeHeadyImage from '@/assets/ad-free-heady.png';

// Fallback data if Supabase is not available or no cards exist
const FALLBACK_SHOWS = [
  {
    id: '1',
    title: 'Night Treats',
    description: 'Late night electronic music journey featuring deep house, progressive house, tech house, and experimental beats.',
    dj_name: 'Rouxbais',
    time: '10:00 PM ET',
    day: 'Fridays',
    genre_tags: ['Electronic', 'House', 'Deep House'],
    image_url: rouxbaisImage,
    destination_url: '/shows',
    destination_type: 'internal' as const,
  },
  {
    id: '2',
    title: 'Celebrating 3 Years of Extraterrestrial Radio',
    description: 'Thank you to our loyal listeners for three fantastic years. Please consider supporting us to continue our mission of playing the universe\'s best indie rock and beyond.',
    dj_name: 'HEADY.FM',
    time: '',
    day: '',
    genre_tags: ['Ad-Free Radio', 'Community Supported'],
    image_url: adFreeHeadyImage,
    destination_url: '/#support-section',
    destination_type: 'internal' as const,
  },
];

export const HeroCarousel = () => {
  const { data: heroCards, isLoading } = useHeroCards();
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const autoplayPlugin = React.useRef(
    Autoplay({
      delay: 15000,
    })
  );

  // Use Supabase data if available, otherwise fallback to hardcoded data
  const shows = React.useMemo(() => {
    if (heroCards && heroCards.length > 0) {
      return heroCards.map(card => ({
        id: card.id,
        title: card.title,
        description: card.description,
        dj_name: card.dj_name || '',
        time: card.time || '',
        day: card.day || '',
        genre_tags: card.genre_tags || [],
        image_url: card.image_url,
        destination_url: card.destination_url || '/shows',
        destination_type: card.destination_type || 'internal',
      }));
    }
    return FALLBACK_SHOWS;
  }, [heroCards]);

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Don't render if loading and no fallback data
  if (isLoading && !heroCards) {
    return (
      <div className="w-full h-[80vh] min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading hero cards...</p>
        </div>
      </div>
    );
  }

  if (!shows || shows.length === 0) {
    return null;
  }

  const toggleAutoplay = () => {
    const autoplay = autoplayPlugin.current;
    if (isPlaying) {
      autoplay.stop();
      setIsPlaying(false);
    } else {
      autoplay.play();
      setIsPlaying(true);
    }
  };

  return (
    <Carousel
      orientation="vertical"
      opts={{
        align: 'start',
        loop: true,
        duration: 40,
      }}
      plugins={[autoplayPlugin.current]}
      className="w-full h-[80vh] min-h-[600px]"
      setApi={setApi}
    >
          <CarouselContent className="h-[80vh] min-h-[600px] -mt-0">
            {shows.map((show, index) => (
              <CarouselItem key={show.id} className="pt-0 h-[80vh] min-h-[600px]">
                <div className="relative w-full h-full overflow-hidden group">
                  {/* Background Image with Parallax & Scale Effect */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-all ease-out scale-100 group-hover:scale-105"
                    style={{ 
                      backgroundImage: `url(${show.image_url})`,
                      transform: current === index ? 'scale(1)' : 'scale(1.1)',
                      transitionDuration: '1500ms',
                    }}
                  />
                  
                  {/* Animated Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 transition-opacity duration-700" 
                    style={{ 
                      opacity: current === index ? 1 : 0.3 
                    }}
                  />
                  
                  {/* Content with Staggered Animation */}
                  <div className="relative h-full flex flex-col justify-end px-4 py-12 md:px-8 md:py-16 lg:px-16 lg:py-20 max-w-7xl mx-auto w-full">
                    <div className="max-w-4xl space-y-4">
                      {/* Genre Tags - Staggered Animation */}
                      {show.genre_tags && show.genre_tags.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-6">
                          {show.genre_tags.map((g, i) => (
                            <span 
                              key={g} 
                              className="px-4 py-2 bg-accent text-accent-foreground font-black text-sm uppercase tracking-wider rounded-full border-2 border-black transform transition-all duration-700 ease-out"
                              style={{
                                opacity: current === index ? 1 : 0,
                                transform: current === index ? 'translateY(0)' : 'translateY(20px)',
                                transitionDelay: current === index ? `${i * 100}ms` : '0ms',
                              }}
                            >
                              {g}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Title with Slide & Fade */}
                      <h2 
                        className="text-5xl md:text-7xl font-black text-white mb-4 leading-tight drop-shadow-2xl transition-all duration-700 ease-out"
                        style={{
                          opacity: current === index ? 1 : 0,
                          transform: current === index ? 'translateX(0)' : 'translateX(-50px)',
                          transitionDelay: current === index ? '200ms' : '0ms',
                        }}
                      >
                        {show.title}
                      </h2>

                      {/* Description with Fade */}
                      <p 
                        className="text-xl md:text-2xl text-white/90 mb-6 leading-relaxed drop-shadow-lg max-w-2xl transition-all duration-700 ease-out"
                        style={{
                          opacity: current === index ? 1 : 0,
                          transform: current === index ? 'translateY(0)' : 'translateY(20px)',
                          transitionDelay: current === index ? '400ms' : '0ms',
                        }}
                      >
                        {show.description}
                      </p>

                      {/* Show Info with Staggered Animation */}
                      {(show.dj_name || show.day || show.time) && (
                        <div 
                          className="flex flex-wrap gap-6 mb-8 text-white"
                          style={{
                            opacity: current === index ? 1 : 0,
                            transform: current === index ? 'translateY(0)' : 'translateY(20px)',
                            transitionDelay: current === index ? '600ms' : '0ms',
                            transition: 'all 700ms ease-out',
                          }}
                        >
                          {show.dj_name && (
                            <div className="flex items-center gap-2 transition-transform duration-300 hover:scale-110">
                              <User className="h-5 w-5" />
                              <span className="font-bold text-lg">{show.dj_name}</span>
                            </div>
                          )}
                          {show.day && (
                            <div className="flex items-center gap-2 transition-transform duration-300 hover:scale-110">
                              <Calendar className="h-5 w-5" />
                              <span className="font-bold text-lg">{show.day}</span>
                            </div>
                          )}
                          {show.time && (
                            <div className="flex items-center gap-2 transition-transform duration-300 hover:scale-110">
                              <Clock className="h-5 w-5" />
                              <span className="font-bold text-lg">{show.time}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* CTA Button with Animation */}
                      {show.destination_url && (
                        <Button 
                          asChild
                          size="lg" 
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg px-8 py-6 rounded-full border-4 border-white shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                          style={{
                            opacity: current === index ? 1 : 0,
                            transform: current === index ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
                            transitionDelay: current === index ? '800ms' : '0ms',
                            transition: 'all 700ms ease-out',
                          }}
                        >
                          {show.destination_type === 'external' ? (
                            <a href={show.destination_url} target="_blank" rel="noopener noreferrer">
                              Learn More
                            </a>
                          ) : show.destination_url.startsWith('#') ? (
                            <a href={show.destination_url}>Learn More</a>
                          ) : (
                            <Link to={show.destination_url}>Learn More</Link>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Enhanced Navigation Controls - Stacked on Right */}
          <Button
            onClick={() => api?.scrollPrev()}
            size="sm"
            variant="ghost"
            className="absolute bottom-40 md:bottom-44 right-4 md:right-8 bg-white/20 backdrop-blur-sm border-2 border-white/40 hover:bg-white/30 text-white transition-all duration-300 hover:scale-110 hover:border-white/60 z-10 h-10 w-10"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => api?.scrollNext()}
            size="sm"
            variant="ghost"
            className="absolute bottom-16 md:bottom-20 right-4 md:right-8 bg-white/20 backdrop-blur-sm border-2 border-white/40 hover:bg-white/30 text-white transition-all duration-300 hover:scale-110 hover:border-white/60 z-10 h-10 w-10"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          
          {/* Progress Indicators */}
          <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
            {shows.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className="relative w-12 h-1 bg-white/30 rounded-full overflow-hidden transition-all duration-300 hover:bg-white/50"
              >
                <div 
                  className="absolute inset-0 bg-white rounded-full transition-all duration-300 ease-out"
                  style={{
                    transform: current === index ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left',
                  }}
                />
              </button>
            ))}
          </div>
          
          {/* Autoplay Control with Pulse Effect - Centered */}
          <Button
            onClick={toggleAutoplay}
            size="sm"
            variant="ghost"
            className="absolute bottom-28 md:bottom-32 right-4 md:right-8 bg-white/20 backdrop-blur-sm border-2 border-white/40 hover:bg-white/30 text-white transition-all duration-300 hover:scale-110 h-10 w-10"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 animate-pulse" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </Carousel>
  );
};
