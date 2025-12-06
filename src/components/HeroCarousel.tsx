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
import rouxbaisImage from '@/assets/rouxbais.png';
import daleImage from '@/assets/dale.png';
import adFreeHeadyImage from '@/assets/ad-free-heady.png';

interface Show {
  id: string;
  title: string;
  description: string;
  djName: string;
  time: string;
  day: string;
  genre: string[];
  imageUrl: string;
}

const FEATURED_SHOWS: Show[] = [
  {
    id: '1',
    title: 'Night Treats',
    description: 'Late night electronic music journey featuring deep house, progressive house, tech house, and experimental beats.',
    djName: 'Rouxbais',
    time: '10:00 PM ET',
    day: 'Fridays',
    genre: ['Electronic', 'House', 'Deep House'],
    imageUrl: rouxbaisImage,
  },
  {
    id: '2',
    title: 'Night Treats',
    description: 'Late night electronic music journey featuring deep house, progressive house, tech house, and experimental beats.',
    djName: 'Dale',
    time: '10:00 PM ET',
    day: 'Fridays',
    genre: ['Electronic', 'House', 'Tech House'],
    imageUrl: daleImage,
  },
  {
    id: '3',
    title: 'Celebrating 3 Years of Extraterrestrial Radio',
    description: 'Thank you to our loyal listeners for three fantastic years. Please consider supporting us to continue our mission of playing the universe\'s best indie rock and beyond.',
    djName: 'HEADY.FM',
    time: '',
    day: '',
    genre: ['Ad-Free Radio', 'Community Supported'],
    imageUrl: adFreeHeadyImage,
  },
];

export const HeroCarousel = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const autoplayPlugin = React.useRef(
    Autoplay({
      delay: 15000,
    })
  );

  React.useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

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
            {FEATURED_SHOWS.map((show, index) => (
              <CarouselItem key={show.id} className="pt-0 h-[80vh] min-h-[600px]">
                <div className="relative w-full h-full overflow-hidden group">
                  {/* Background Image with Parallax & Scale Effect */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-all ease-out scale-100 group-hover:scale-105"
                    style={{ 
                      backgroundImage: `url(${show.imageUrl})`,
                      transform: current === index ? 'scale(1)' : 'scale(1.1)',
                      transitionDuration: '1500ms',
                    }}
                    role="img"
                    aria-label={`Background image for ${show.title}`}
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
                      <div className="flex gap-2 flex-wrap mb-6">
                        {show.genre.map((g, i) => (
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
                        className="text-xl md:text-2xl text-white mb-6 leading-relaxed drop-shadow-lg max-w-2xl transition-all duration-700 ease-out"
                        style={{
                          opacity: current === index ? 1 : 0,
                          transform: current === index ? 'translateY(0)' : 'translateY(20px)',
                          transitionDelay: current === index ? '400ms' : '0ms',
                          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                        }}
                      >
                        {show.description}
                      </p>

                      {/* Show Info with Staggered Animation */}
                      <div 
                        className="flex flex-wrap gap-6 mb-8 text-white"
                        style={{
                          opacity: current === index ? 1 : 0,
                          transform: current === index ? 'translateY(0)' : 'translateY(20px)',
                          transitionDelay: current === index ? '600ms' : '0ms',
                          transition: 'all 700ms ease-out',
                        }}
                      >
                        {show.djName && (
                          <div className="flex items-center gap-2 transition-transform duration-300 hover:scale-110">
                            <User className="h-5 w-5" />
                            <span className="font-bold text-lg">{show.djName}</span>
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

                      {/* CTA Button with Animation */}
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
                        {index === 2 ? (
                          <a href="/#support-section" aria-label="Support HEADY.FM - Scroll to support section">Support Us</a>
                        ) : (
                          <Link to="/shows" aria-label={`Learn more about ${show.title}`}>Learn More</Link>
                        )}
                      </Button>
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
            aria-label="Previous slide"
            className="absolute bottom-40 md:bottom-44 right-4 md:right-8 bg-white/20 backdrop-blur-sm border-2 border-white/40 hover:bg-white/30 text-white transition-all duration-300 hover:scale-110 hover:border-white/60 z-10 h-10 w-10"
          >
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            onClick={() => api?.scrollNext()}
            size="sm"
            variant="ghost"
            aria-label="Next slide"
            className="absolute bottom-16 md:bottom-20 right-4 md:right-8 bg-white/20 backdrop-blur-sm border-2 border-white/40 hover:bg-white/30 text-white transition-all duration-300 hover:scale-110 hover:border-white/60 z-10 h-10 w-10"
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </Button>
          
          {/* Progress Indicators */}
          <div className="absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 flex gap-2" role="tablist" aria-label="Carousel slides">
            {FEATURED_SHOWS.map((show, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}: ${show.title}`}
                aria-selected={current === index}
                role="tab"
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
            aria-label={isPlaying ? "Pause carousel autoplay" : "Resume carousel autoplay"}
            className="absolute bottom-28 md:bottom-32 right-4 md:right-8 bg-white/20 backdrop-blur-sm border-2 border-white/40 hover:bg-white/30 text-white transition-all duration-300 hover:scale-110 h-10 w-10"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 animate-pulse" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        </Carousel>
  );
};
