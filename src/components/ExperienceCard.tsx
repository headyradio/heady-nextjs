import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const ExperienceCard = () => {
  return (
    <div className="h-full bg-gradient-to-br from-purple-900/50 via-pink-900/50 to-purple-900/50 border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col justify-between relative overflow-hidden">
      {/* Background pattern/decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>
      
      {/* Top Promo Box - My HEADY */}
      <div className="relative z-10 bg-gradient-to-br from-blue-900/90 to-blue-950/90 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-blue-400/30 shadow-lg">
        {/* NEW Badge */}
        <div className="inline-flex items-center mb-3">
          <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider rounded-full border-2 border-white/20">
            New!
          </span>
        </div>
        
        {/* Heading */}
        <h3 className="text-base md:text-lg font-black text-white mb-2 leading-tight">
          Join or Sign in to My HEADY
        </h3>
        
        {/* Description */}
        <p className="text-xs md:text-sm text-white/80 mb-4 leading-relaxed">
          Sign in to save tracks and jump into the live chat. It only takes your email to get started.
        </p>
        
        {/* CTA Button */}
        <Link to="/auth">
          <Button 
            size="sm"
            className="w-full bg-white text-blue-950 hover:bg-white/90 font-bold rounded-lg transition-all hover:scale-105"
          >
            Sign In / Sign Up
          </Button>
        </Link>
      </div>

      {/* Bottom Content - Original text */}
      <div className="relative z-10 space-y-3 text-center pb-2">
        {/* Header */}
        <h2 className="text-sm md:text-base lg:text-lg font-black text-white leading-tight uppercase tracking-tight">
          Experience The Mind-Altering Effects Of Extraterrestrial Radio
        </h2>

        {/* Description */}
        <p className="text-xs md:text-sm text-white/80 leading-relaxed">
          Stream commercial-free music 24/7 on HEADY.FM. Discover underground music, your favorite tracks, emerging artists, and deep cuts without interruptions.
        </p>
      </div>
    </div>
  );
};

