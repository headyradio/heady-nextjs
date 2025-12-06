import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Mail, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { user, signInWithMagicLink } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    const { error } = await signInWithMagicLink(email);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
      setLoading(false);
      return;
    }

    setEmailSent(true);
    setLoading(false);
    toast({
      title: 'Check your email',
      description: 'We sent you a magic link to sign in'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <Card className="w-full max-w-md border-bold shadow-2xl">
          <CardHeader className="space-y-1 bg-gradient-sunrise rounded-t-xl">
            <CardTitle className="text-3xl font-black text-center uppercase tracking-tight">
              Welcome to HEADY Radio
            </CardTitle>
            <CardDescription className="text-center text-foreground/80 font-semibold">
              {emailSent 
                ? 'Check your email for the magic link'
                : 'Enter your email to receive a magic link'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            {!emailSent ? (
              <form onSubmit={handleMagicLink} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-bold">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                    className="h-12 text-base"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending Magic Link...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-5 w-5" />
                      Send Magic Link
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  We'll send you a magic link to sign in without a password
                </p>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-accent border-bold">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center">
                      <Mail className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <p className="text-base font-semibold">
                      Magic link sent to
                    </p>
                    <p className="text-lg font-bold text-primary break-all">
                      {email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Click the link in your email to sign in to HEADY Radio
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full h-12 font-bold"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  size="lg"
                >
                  Try a different email
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Auth;
