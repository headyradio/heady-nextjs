import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heart, Radio, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const DONATION_AMOUNTS = [
  { amount: 5, label: '$5', impact: '☕ 1 day of server costs' },
  { amount: 10, label: '$10', impact: '🎵 2 days of streaming' },
  { amount: 25, label: '$25', impact: '💫 1 week of bandwidth' },
  { amount: 50, label: '$50', impact: '🌟 Half a month of support' },
];

export const MobileSupportTab = () => {
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
        setTimeout(() => {
          // Use location.href instead of window.open for mobile
          window.location.href = data.url;
        }, 500);
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Donation error:', error);
      toast.error('Failed to create checkout. Please try again.', { id: 'checkout' });
      setIsLoading(false);
      setSelectedAmount(null);
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
    <div className="px-4 py-6 pb-24 overflow-y-auto h-full bg-black">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <Radio className="h-12 w-12 text-primary" />
          <Heart className="h-6 w-6 text-accent absolute -bottom-1 -right-1 fill-current" />
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-3xl font-black text-center text-white mb-4 uppercase tracking-tight">
        Support HEADY.FM
      </h2>

      {/* Description */}
      <p className="text-center text-white/70 mb-8 text-sm leading-relaxed">
        Your support keeps us independent, ad-free, and thriving. Every donation directly covers streaming costs.
      </p>

      {/* Donation Amounts */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {DONATION_AMOUNTS.map(({ amount, label }) => (
          <Button
            key={amount}
            onClick={() => handleDonation(amount)}
            variant={selectedAmount === amount ? "default" : "outline"}
            size="lg"
            disabled={isLoading}
            className="w-full h-20 text-2xl font-black border-2 relative"
          >
            {isLoading && selectedAmount === amount ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <span>{label}</span>
                {amount === 25 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] px-2 py-0.5 rounded-full font-black">
                    Popular
                  </span>
                )}
              </>
            )}
          </Button>
        ))}
      </div>

      {/* Custom Amount */}
      <div className="space-y-3">
        <Input
          type="number"
          placeholder="Enter any amount $1+"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          className="h-12 text-base font-bold border-2"
          min="1"
          step="1"
          disabled={isLoading}
        />
        <Button
          onClick={handleCustomDonation}
          size="lg"
          disabled={isLoading || !customAmount}
          className="w-full h-12 text-base font-black"
        >
          {isLoading && !selectedAmount ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Donate Custom Amount'
          )}
        </Button>
      </div>

      {/* Trust Indicators */}
      <div className="flex items-center justify-center gap-2 mt-6 text-xs text-white/60">
        <Shield className="h-3 w-3" />
        <span className="font-bold">Secure payment powered by Stripe</span>
      </div>
    </div>
  );
};
