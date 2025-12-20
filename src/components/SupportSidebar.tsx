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

export const SupportSidebar = () => {
  const [customAmount, setCustomAmount] = React.useState('');
  const [selectedAmount, setSelectedAmount] = React.useState<number | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDonation = async (amount: number) => {
    setSelectedAmount(amount);
    setIsLoading(true);

    try {
      toast.loading('Creating checkout...', { id: 'checkout' });

      const { data, error } = await supabase.functions.invoke('create-donation-checkout', {
        body: { amount },
      });

      if (error) throw error;

      if (data?.url) {
        toast.success('Redirecting...', { id: 'checkout' });
        setTimeout(() => {
          window.open(data.url, '_blank');
          setIsLoading(false);
        }, 500);
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Donation error:', error);
      toast.error('Failed to create checkout', { id: 'checkout' });
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
    <Card className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 backdrop-blur-sm p-6 flex flex-col rounded-2xl">
      <TooltipProvider>
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <Radio className="h-10 w-10 text-primary" />
          <Heart className="h-5 w-5 text-accent absolute -bottom-1 -right-1 fill-current" />
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-2xl md:text-3xl font-black text-center text-white mb-3 uppercase tracking-tight">
        Support HEADY.FM
      </h2>

      {/* Description */}
      <div className="text-center mb-6 flex-1">
        <p className="text-sm text-white/70 leading-relaxed mb-3">
          If you love what HEADY.FM brings to your day, please consider making a donation.
        </p>
        <p className="text-xs text-accent font-black uppercase">
          💖 Every $ keeps us ad-free
        </p>
      </div>

      {/* Donation Amounts */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {DONATION_AMOUNTS.map(({ amount, label }) => (
            <Button
              key={amount}
              onClick={() => handleDonation(amount)}
              variant={selectedAmount === amount ? "default" : "outline"}
              size="sm"
              disabled={isLoading}
              className="h-12 text-lg font-black border-2 hover:scale-105 transition-transform"
            >
              {isLoading && selectedAmount === amount ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                label
              )}
            </Button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Input
                type="number"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="h-10 text-sm font-bold border-2"
                min="1"
                step="1"
                disabled={isLoading}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-bold">Any amount helps!</p>
            </TooltipContent>
          </Tooltip>
          <Button
            onClick={handleCustomDonation}
            size="sm"
            disabled={isLoading || !customAmount}
            className="w-full h-10 text-sm font-black border-2 border-primary-foreground"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Donate'
            )}
          </Button>
        </div>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-1 text-xs text-white/50">
          <Shield className="h-3 w-3" />
          <span className="font-bold">Secure via Stripe</span>
        </div>
      </div>
      </TooltipProvider>
    </Card>
  );
};
