import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Home, Music, Share2, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const DonationCancelled = () => {
  const navigate = useNavigate();

  const scrollToSupport = () => {
    navigate('/');
    setTimeout(() => {
      const supportSection = document.getElementById('support-section');
      if (supportSection) {
        supportSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-bold flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-bold-primary bg-card/95 backdrop-blur-sm p-8 md:p-12">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <Heart className="h-16 w-16 text-muted-foreground" />
        </div>

        {/* Message */}
        <h1 className="text-3xl md:text-5xl font-black text-center text-foreground mb-4 uppercase tracking-tight">
          No Worries!
        </h1>
        
        <div className="text-center space-y-4 mb-8">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your donation was cancelled. That's totally okay! 
          </p>

          <p className="text-base text-muted-foreground leading-relaxed">
            You can still support HEADY.FM in other ways:
          </p>

          <div className="space-y-2 text-left max-w-md mx-auto bg-muted/30 p-4 rounded-lg border-2 border-muted">
            <div className="flex items-start gap-3">
              <Share2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <span className="font-black text-foreground">Share HEADY.FM</span> with your friends and music lovers
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Music className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <span className="font-black text-foreground">Keep listening</span> and spreading the word
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                <span className="font-black text-foreground">Engage with our community</span> in chat and meetups
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={scrollToSupport}
            size="lg"
            className="flex-1 h-14 text-lg font-black gap-2"
          >
            <Heart className="h-5 w-5" />
            Try Again
          </Button>
          
          <Link to="/" className="flex-1">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-14 text-lg font-black gap-2 border-2"
            >
              <Home className="h-5 w-5" />
              Go Home
            </Button>
          </Link>
        </div>

        {/* Footer Message */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Thanks for being part of the HEADY.FM community! 🎵
        </p>
      </Card>
    </div>
  );
};

export default DonationCancelled;
