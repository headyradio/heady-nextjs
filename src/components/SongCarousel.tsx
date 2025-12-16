import * as React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransmissionCard } from '@/components/TransmissionCard';
import { TransmissionCardSkeleton } from '@/components/TransmissionCardSkeleton';
import { Transmission } from '@/hooks/useRadioBoss';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface SongCarouselProps {
  title: string;
  subtitle?: string;
  items: Transmission[];
  viewAllLink: string;
  viewAllText: string;
  isLoading: boolean;
  limit?: number;
  numbered?: boolean; // If true, adds 1, 2, 3... rank badges
}

export const SongCarousel = ({
  title,
  subtitle,
  items,
  viewAllLink,
  viewAllText,
  isLoading,
  limit = 20,
  numbered = false,
}: SongCarouselProps) => {
  // Cap the items to the limit
  const displayItems = items.slice(0, limit);
  const hasMore = items.length >= limit;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-end justify-between mb-6 md:mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-lg opacity-70">{subtitle}</p>
          )}
        </div>
        
        <Link to={viewAllLink} className="hidden md:block">
          <Button variant="ghost" className="font-bold group">
            {viewAllText}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      {/* Carousel */}
      {isLoading ? (
        <div className="flex gap-4 md:gap-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[280px] md:min-w-[320px]">
              <TransmissionCardSkeleton />
            </div>
          ))}
        </div>
      ) : displayItems.length > 0 ? (
        <Carousel
          opts={{
            align: 'start',
            loop: false,
            dragFree: true,
          }}
          className="w-full relative group/carousel"
        >
          <CarouselContent className="-ml-4 md:-ml-6">
            {displayItems.map((song, index) => (
              <CarouselItem key={song.id} className="pl-4 md:pl-6 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <div className="relative group h-full">
                  {numbered && (
                    <div className="absolute -top-2 -left-2 z-10 bg-primary text-primary-foreground font-black text-sm px-3 py-1 rounded-full border-2 border-background shadow-lg">
                      #{index + 1}
                    </div>
                  )}
                  <TransmissionCard transmission={song} index={index} />
                </div>
              </CarouselItem>
            ))}
            
            {/* "View All" Card at the end */}
            <CarouselItem className="pl-4 md:pl-6 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <Link to={viewAllLink} className="block h-full min-h-[300px]">
                <div className="h-full border-2 border-dashed border-border hover:border-primary rounded-xl flex flex-col items-center justify-center p-8 text-center transition-colors group">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <ArrowRight className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">View All</h3>
                  <p className="text-muted-foreground mb-6">See the complete list</p>
                  <Button variant="default" className="font-bold">
                    Go to Page
                  </Button>
                </div>
              </Link>
            </CarouselItem>
          </CarouselContent>
          
          <div className="hidden md:block">
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity bg-background border-2 border-border h-12 w-12" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 opacity-0 group-hover/carousel:opacity-100 transition-opacity bg-background border-2 border-border h-12 w-12" />
          </div>
        </Carousel>
      ) : (
        <div className="border-bold rounded-xl p-12 text-center bg-card">
          <p className="text-lg opacity-60">No tracks available right now</p>
        </div>
      )}
      
      {/* Mobile-only view all button */}
      <div className="md:hidden mt-6 text-center">
        <Link to={viewAllLink}>
          <Button variant="outline" className="w-full font-bold">
            {viewAllText}
          </Button>
        </Link>
      </div>
    </div>
  );
};

