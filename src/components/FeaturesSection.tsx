import { Heart, Music, History, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const FeaturesSection = () => {
  const features = [
    {
      icon: Heart,
      title: 'Save Your Discoveries',
      description: "Never lose track of a song. Save tracks as you listen and add them to your Spotify or YouTube playlists.",
      cta: true,
    },
    {
      icon: Music,
      title: 'Deep Dive Into the Music',
      description: 'Get the full story behind every track. Explore artist insights, song details, and context that brings you closer to the music you love.',
      cta: false,
    },
    {
      icon: History,
      title: 'Enhanced Playback History',
      description: "Catch what you missed with our seven-day song log. Search our entire catalog and rediscover the tracks that define your listening experience.",
      cta: false,
    },
    {
      icon: Sparkles,
      title: 'More to Come',
      description: "This is just the beginning. We're rolling out new features and improvements in the coming months to make HEADY.FM your go-to source for music discovery.",
      cta: false,
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Welcome to the New HEADY.FM
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-medium">
            Extraterrestrial Radio just got better. We've completely reimagined the listening experience from the ground up—here's what's new.
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
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl lg:text-3xl font-black mb-4 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-base lg:text-lg leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* CTA for first feature */}
                  {feature.cta && (
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
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
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
