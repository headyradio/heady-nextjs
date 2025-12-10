import { Radio, Bookmark, BotOff, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const FeaturesSection = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Radio,
      title: 'NO COMMERCIALS, EVER',
      description: 'Thank you to our generous supporters — we can operate without ads.',
      cta: false,
    },
    {
      icon: Bookmark,
      title: 'NO SUBSCRIPTION FEE',
      description: 'We don’t charge any monthly fees for our stream.',
      cta: false,
    },
    {
      icon: BotOff,
      title: 'EXPERTLY CURATED BY HUMANS, NOT ROBOTS',
      description: 'Real humans, real curation. Hear what your algorithm hides and get beyond bot-built playlists.',
      cta: false,
    },
    {
      icon: Compass,
      title: 'Top Recommendation by TuneIn',
      description:
        'TuneIn ranks HEADY among top indie stations worldwide, alongside legendary broadcasters KCRW, KEXP, and Triple J.',
      cta: false,
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-4" style={{ color: '#4a148c' }}>
            THE BEST FU**KING INDIE ROCK STATION IN THE WORLD
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto font-medium">
            Experience the mind altering effects of Extraterrestrial Radio. Stream commercial-free music 24/7 on HEADY.FM. Discover underground music, your favorite tracks, emerging artists, and deep cuts without interruptions.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="relative group"
              >
                <div className="border-bold rounded-2xl p-8 lg:p-10 bg-card hover-lift transition-all duration-300 h-full">
                  {/* Icon */}
                  <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[rgba(34,197,94,0.12)] text-[#22c55e] group-hover:bg-[#22c55e] group-hover:text-white transition-all duration-300">
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl lg:text-3xl font-black mb-4 group-hover:text-[#22c55e] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-base lg:text-lg leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* CTA for first feature */}
                  {feature.cta && !user && (
                    <div className="pt-4">
                      <Link to="/auth">
                        <Button 
                          size="lg" 
                          className="font-bold w-full sm:w-auto"
                        >
                          Create Account or Sign In
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Decorative gradient border effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[rgba(34,197,94,0.16)] via-[rgba(34,197,94,0.08)] to-[rgba(34,197,94,0.16)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 lg:mt-16">
          <p className="text-muted-foreground text-lg mb-6 font-medium">
            Ready to experience the future of radio?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="font-bold px-8 w-full sm:w-auto">
                Get Started Free
              </Button>
            </Link>
            <Link to="/shows">
              <Button size="lg" variant="outline" className="font-bold px-8 w-full sm:w-auto">
                Explore Shows
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
