import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FeaturedCard = () => {
  return (
    <div className="relative h-full min-h-[500px] rounded-2xl overflow-hidden group border border-white/10">
      {/* Background Image with Gradient - Using optimized WebP from CDN */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
        style={{ 
          backgroundImage: `url(/assets/card1-rouxbais.webp)`,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-8 lg:p-12">
        {/* Top Badge */}
        <div>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground font-black text-sm uppercase tracking-wider rounded-full border-2 border-black">
            <Headphones className="w-4 h-4" />
            Featured Show
          </span>
        </div>
        
        {/* Main Content */}
        <div className="space-y-6 mt-8">
          <h2 className="text-5xl lg:text-7xl font-black text-white leading-tight drop-shadow-lg">
            Night Treats
          </h2>
          
          <p className="text-xl lg:text-2xl text-white/80 max-w-lg leading-relaxed">
            Late night electronic music journey featuring deep house, progressive house, 
            tech house, and experimental beats.
          </p>
          
          {/* Show Info */}
          <div className="flex flex-wrap gap-6 text-white/90">
            <div className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
              <Calendar className="h-5 w-5 text-accent" />
              <span className="font-bold text-lg">Fridays</span>
            </div>
            <div className="flex items-center gap-2 transition-transform duration-300 hover:scale-105">
              <Clock className="h-5 w-5 text-accent" />
              <span className="font-bold text-lg">10:00 PM ET</span>
            </div>
          </div>
          
          {/* DJs */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <img 
                src="/assets/card1-rouxbais.webp" 
                alt="Rouxbais"
                className="w-14 h-14 rounded-full border-3 border-white object-cover shadow-lg"
                loading="lazy"
                width="56"
                height="56"
              />
              <img 
                src="/assets/card2-dale.webp" 
                alt="Dale"
                className="w-14 h-14 rounded-full border-3 border-white object-cover shadow-lg"
                loading="lazy"
                width="56"
                height="56"
              />
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <User className="h-5 w-5" />
              <span className="font-bold text-lg">Rouxbais & Dale</span>
            </div>
          </div>
          
          {/* CTA */}
          <Button 
            asChild
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg px-8 py-6 rounded-full border-4 border-white/20 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            <Link to="/shows">
              Explore Shows
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

