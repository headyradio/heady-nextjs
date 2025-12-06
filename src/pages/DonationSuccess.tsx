import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Home, Music, Share2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const DonationSuccess = () => {
  const handleShare = (platform: string) => {
    const message = "I just supported HEADY.FM! 🎵 Join me in keeping independent radio alive and ad-free!";
    const url = window.location.origin;
    
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      copy: url,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bold flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-bold-primary bg-card/95 backdrop-blur-sm p-8 md:p-12 animate-scale-in">
        {/* Celebration Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative animate-bounce">
            <Heart className="h-20 w-20 text-accent fill-current" />
            <Sparkles className="h-8 w-8 text-primary absolute -top-2 -right-2 animate-pulse" />
          </div>
        </div>

        {/* Thank You Message */}
        <h1 className="text-4xl md:text-6xl font-black text-center text-foreground mb-4 uppercase tracking-tight">
          Thank You!
        </h1>
        
        <div className="text-center space-y-4 mb-8">
          <p className="text-xl md:text-2xl text-foreground font-bold">
            🎉 You're now part of the HEADY family!
          </p>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your donation helps us keep the music playing, the servers running, and HEADY.FM 
            completely ad-free. You'll receive an email receipt from Stripe shortly.
          </p>

          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-lg border-2 border-primary/20">
            <Sparkles className="h-5 w-5 text-accent fill-current" />
            <p className="text-lg font-black text-foreground">
              You're supporter #47 this month! 🌟
            </p>
          </div>
        </div>

        {/* Share Section */}
        <div className="mb-8 p-6 bg-muted/30 rounded-lg border-2 border-muted">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Share2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-black text-foreground uppercase">
              Share the Love
            </h2>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Help us reach more music lovers!
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              onClick={() => handleShare('twitter')}
              variant="outline"
              size="sm"
              className="font-black"
            >
              Share on Twitter
            </Button>
            <Button
              onClick={() => handleShare('facebook')}
              variant="outline"
              size="sm"
              className="font-black"
            >
              Share on Facebook
            </Button>
            <Button
              onClick={() => handleShare('copy')}
              variant="outline"
              size="sm"
              className="font-black"
            >
              Copy Link
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/" className="flex-1">
            <Button
              size="lg"
              className="w-full h-14 text-lg font-black gap-2"
            >
              <Music className="h-5 w-5" />
              Back to Listening
            </Button>
          </Link>
          
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

        {/* Additional Message */}
        <p className="text-center text-sm text-muted-foreground mt-6 italic">
          Your support means everything to our community. Rock on! 🎸
        </p>
      </Card>
    </div>
  );
};

export default DonationSuccess;
