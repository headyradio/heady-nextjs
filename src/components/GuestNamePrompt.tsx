import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { User, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GuestNamePromptProps {
  onSubmit: (name: string) => void;
}

export const GuestNamePrompt: React.FC<GuestNamePromptProps> = ({ onSubmit }) => {
  const [guestName, setGuestName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guestName.trim()) {
      onSubmit(guestName.trim());
    }
  };

  return (
    <Card className="p-8 max-w-md mx-auto my-8 border-4 border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
          <User className="h-8 w-8 text-primary" />
        </div>
        
        <div>
          <h3 className="text-2xl font-bold text-primary mb-2">Join the Live Chat</h3>
          <p className="text-muted-foreground">
            Choose a guest name to start chatting, or log in for the full experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Enter your name..."
            maxLength={20}
            className="text-center text-lg border-2"
          />
          <Button 
            type="submit" 
            className="w-full gap-2"
            disabled={!guestName.trim()}
          >
            <User className="h-4 w-4" />
            Chat as Guest
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-card text-muted-foreground">or</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full gap-2 border-2"
          onClick={() => navigate('/auth')}
        >
          <LogIn className="h-4 w-4" />
          Login / Sign Up
        </Button>
      </div>
    </Card>
  );
};
