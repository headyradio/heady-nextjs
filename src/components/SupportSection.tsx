import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Heart, Radio, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DONATION_AMOUNTS = [
  { amount: 5, label: '$5' },
  { amount: 10, label: '$10' },
  { amount: 25, label: '$25' },
  { amount: 50, label: '$50' },
];

const IMPACT_MESSAGES: Record<number, string> = {
  5: '☕ One coffee = 1 day of server costs',
  10: '🎵 Powers 2 days of streaming',
  25: '💫 Covers 1 week of bandwidth',
  50: '🌟 Supports us for half a month',
};

export const SupportSection = () => {
  const [customAmount, setCustomAmount] = React.useState('');
  const [selectedAmount, setSelectedAmount] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDonation = async (amount: number) => {
    setSelectedAmount(amount);
    setIsLoading(true);

    try {
      toast.loading('Creating secure checkout...', { id: 'checkout' });

      const { data, error } = await supabase.functions.invoke('create-donation-checkout', {
        body: { amount },
      });

      if (error) throw error;

      if (data?.url) {
        toast.success('Redirecting to secure payment...', { id: 'checkout' });
        // Small delay for user feedback before redirect
        setTimeout(() => {
          // Use location.href for better mobile compatibility
          window.location.href = data.url;
        }, 500);
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Donation error:', error);
      toast.error('Failed to create checkout. Please try again.', { id: 'checkout' });
      setIsLoading(false);
    }
  };

  const handleCustomDonation = () => {
    const amount = parseFloat(customAmount);
    if (amount && amount >= 1) {
      handleDonation(amount);
    } else {
      toast.error('Please enter at least $1');
    }
  };

  return (
    <section id="support-section" className="relative py-12 md:py-16 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-2 bg-accent" />
      <div className="absolute bottom-0 right-0 w-full h-2 bg-secondary" />
      
      <div className="container mx-auto px-4 relative z-10">
        <Card className="border-bold-primary bg-card backdrop-blur-sm p-6 md:p-10 lg:p-12 max-w-4xl mx-auto shadow-xl">
          <TooltipProvider>
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Radio className="h-16 w-16 text-primary" />
              <Heart className="h-8 w-8 text-accent absolute -bottom-2 -right-2 fill-current" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-6xl font-black text-center text-foreground mb-6 uppercase tracking-tight">
            Support HEADY.FM
          </h2>

          {/* Description */}
          <div className="max-w-3xl mx-auto text-center mb-10">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              If you love what HEADY.FM brings to your day, please consider making a donation. 
              Your support directly helps cover streaming costs and keeps our community thriving, 
              independent, and ad-free.
            </p>
          </div>

          {/* Donation Amounts */}
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {DONATION_AMOUNTS.map(({ amount, label }) => (
                <Tooltip key={amount}>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleDonation(amount)}
                      variant={selectedAmount === amount ? "default" : "outline"}
                      size="lg"
                      disabled={isLoading}
                      className="h-20 text-2xl font-black border-4 hover:scale-105 transition-transform relative"
                    >
                      {isLoading && selectedAmount === amount ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <>
                          {label}
                          {amount === 25 && (
                            <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs px-2 py-0.5 rounded-full font-black">
                              Popular
                            </span>
                          )}
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-bold">{IMPACT_MESSAGES[amount]}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="flex-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      type="number"
                      placeholder="Enter any amount $1+"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="h-14 text-lg font-bold border-4"
                      min="1"
                      step="1"
                      disabled={isLoading}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-bold">Any amount helps keep us ad-free!</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Button
                onClick={handleCustomDonation}
                size="lg"
                disabled={isLoading || !customAmount}
                className="h-14 px-8 text-lg font-black border-4 border-primary-foreground whitespace-nowrap"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Donate Custom Amount'
                )}
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span className="font-bold">Secure payment powered by Stripe</span>
            </div>
          </div>
          </TooltipProvider>
        </Card>
      </div>
    </section>
  );
};
