import * as React from 'react';
import { X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const MESSAGES = [
  "❤️ HEADY.FM is listener-supported. Every donation keeps us ad-free!",
  "🎵 Help us reach our monthly goal and keep the music playing!",
  "💖 Join our community of supporters keeping independent radio alive!",
  "🌟 Your support powers great music. Donate today!",
];

export const DonationBanner = () => {
  const [isDismissed, setIsDismissed] = React.useState(false);
  const [messageIndex, setMessageIndex] = React.useState(0);

  // Check local storage on mount
  React.useEffect(() => {
    const dismissed = localStorage.getItem('donation-banner-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    // Show banner again after 24 hours
    if (dismissedTime < oneDayAgo) {
      localStorage.removeItem('donation-banner-dismissed');
    } else {
      setIsDismissed(true);
    }
  }, []);

  // Rotate messages every 10 seconds
  React.useEffect(() => {
    if (isDismissed) return;
    
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('donation-banner-dismissed', Date.now().toString());
  };

  const scrollToSupport = () => {
    const supportSection = document.getElementById('support-section');
    if (supportSection) {
      supportSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isDismissed) return null;

  // Hide on desktop (regular web view)
  return null;
};
