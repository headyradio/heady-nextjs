import * as React from 'react';
import { Heart, TrendingUp, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DonationStatsProps {
  compact?: boolean;
}

export const DonationStats = ({ compact = false }: DonationStatsProps) => {
  // These would come from your database in a real implementation
  const monthlyGoal = 500;
  const currentAmount = 425;
  const supporterCount = 47;
  const progressPercentage = (currentAmount / monthlyGoal) * 100;

  const recentDonations = [
    { amount: 25, time: '5 min ago' },
    { amount: 10, time: '23 min ago' },
    { amount: 50, time: '1 hour ago' },
  ];

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-medium">Monthly Goal</span>
          <span className="text-foreground font-black">
            ${currentAmount} / ${monthlyGoal}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span className="font-bold">{supporterCount} supporters this month</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monthly Goal Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-lg font-black text-foreground">Monthly Goal</span>
          </div>
          <span className="text-2xl font-black text-foreground">
            ${currentAmount} / ${monthlyGoal}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-3" />
        <p className="text-sm text-muted-foreground font-bold">
          {progressPercentage.toFixed(0)}% funded • ${monthlyGoal - currentAmount} to go!
        </p>
      </div>

      {/* Supporter Count */}
      <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
        <Heart className="h-8 w-8 text-accent fill-current" />
        <div>
          <p className="text-3xl font-black text-foreground">{supporterCount}</p>
          <p className="text-sm text-muted-foreground font-bold">supporters this month</p>
        </div>
      </div>

      {/* Recent Donations */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-sm font-black text-foreground uppercase">Recent Support</span>
        </div>
        <div className="space-y-2">
          {recentDonations.map((donation, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded-lg"
            >
              <span className="text-muted-foreground font-medium">
                Anonymous donated
              </span>
              <div className="flex items-center gap-2">
                <span className="text-foreground font-black">${donation.amount}</span>
                <span className="text-xs text-muted-foreground">{donation.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
