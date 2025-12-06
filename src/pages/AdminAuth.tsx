import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { z } from "zod";
import headyLogo from "@/assets/heady-logo.svg";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const otpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  code: z.string().length(6, "Code must be 6 digits"),
});

export default function AdminAuth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("otp");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<{ email?: string; password?: string; code?: string }>({});
  const { user, signInWithPassword, signInWithOtp, verifyOtp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/admin");
    }
  }, [user, navigate]);

  // Countdown timer for OTP expiration
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate inputs
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as 'email' | 'password'] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    const { error } = await signInWithPassword(email, password);

    if (error) {
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "Logged in successfully",
      });
    }

    setLoading(false);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate email
    const result = z.object({ email: z.string().email() }).safeParse({ email });
    if (!result.success) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setLoading(true);

    const { error } = await signInWithOtp(email);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Code sent!",
        description: "Check your email for the 6-digit code",
      });
      setOtpSent(true);
      setCountdown(300); // 5 minutes
    }

    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate OTP code
    const result = otpSchema.safeParse({ email, code: otpCode });
    if (!result.success) {
      const fieldErrors: { email?: string; code?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as 'email' | 'code'] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    const { error } = await verifyOtp(email, otpCode);

    if (error) {
      toast({
        title: "Invalid code",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "Logged in successfully",
      });
    }

    setLoading(false);
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    const { error } = await signInWithOtp(email);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Code resent!",
        description: "Check your email for a new code",
      });
      setCountdown(300);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted">
      {/* Header matching main site */}
      <header className="border-b-4 border-secondary shadow-lg backdrop-blur-sm bg-[#4a148c]/95">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-block">
            <img 
              src={headyLogo} 
              alt="HEADY Radio - Return to homepage" 
              className="h-12 w-auto hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-md border-4 border-foreground shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-3 text-center pb-6">
            <CardTitle className="text-4xl font-black tracking-tight">Admin Login</CardTitle>
            <CardDescription className="text-base font-medium">
              {loginMethod === "otp" && !otpSent && "We'll send you a 6-digit code to log in"}
              {loginMethod === "otp" && otpSent && "Enter the code we sent to your email"}
              {loginMethod === "password" && "Enter your credentials to access the CMS"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {loginMethod === "otp" ? (
              otpSent ? (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="otp-code" className="text-base font-bold text-center block">
                      Verification Code
                    </Label>
                    <div className="flex justify-center py-2">
                      <InputOTP
                        maxLength={6}
                        value={otpCode}
                        onChange={(value) => {
                          setOtpCode(value);
                          setErrors({});
                        }}
                        disabled={loading}
                      >
                        <InputOTPGroup className="gap-2">
                          <InputOTPSlot index={0} className="w-12 h-14 text-xl font-bold border-2" />
                          <InputOTPSlot index={1} className="w-12 h-14 text-xl font-bold border-2" />
                          <InputOTPSlot index={2} className="w-12 h-14 text-xl font-bold border-2" />
                          <InputOTPSlot index={3} className="w-12 h-14 text-xl font-bold border-2" />
                          <InputOTPSlot index={4} className="w-12 h-14 text-xl font-bold border-2" />
                          <InputOTPSlot index={5} className="w-12 h-14 text-xl font-bold border-2" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    {errors.code && (
                      <p className="text-sm text-destructive text-center font-semibold" role="alert">
                        {errors.code}
                      </p>
                    )}
                    {countdown > 0 && (
                      <p className="text-sm text-muted-foreground text-center font-medium">
                        Code expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full font-bold text-base h-12" 
                    disabled={loading || otpCode.length !== 6}
                  >
                    {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />}
                    Verify Code
                  </Button>

                  <div className="space-y-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full font-semibold h-11"
                      onClick={handleResendOtp}
                      disabled={loading || countdown > 0}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full font-semibold"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode("");
                        setCountdown(0);
                        setErrors({});
                      }}
                      disabled={loading}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                      Use different email
                    </Button>
                  </div>

                  <div className="text-center pt-2 border-t">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm px-0 font-semibold"
                      onClick={() => {
                        setLoginMethod("password");
                        setOtpSent(false);
                        setOtpCode("");
                        setCountdown(0);
                        setErrors({});
                      }}
                      disabled={loading}
                    >
                      Use password instead
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="otp-email" className="text-sm font-bold">
                      Email Address
                    </Label>
                    <Input
                      id="otp-email"
                      name="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors({});
                      }}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      disabled={loading}
                      className="border-2 h-11"
                      autoComplete="email"
                      autoFocus
                    />
                    {errors.email && (
                      <p id="email-error" className="text-sm text-destructive font-semibold" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full font-bold text-base h-12" 
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />}
                    <Mail className="mr-2 h-5 w-5" aria-hidden="true" />
                    Send Login Code
                  </Button>

                  <div className="text-center pt-2 border-t">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm px-0 font-semibold"
                      onClick={() => {
                        setLoginMethod("password");
                        setErrors({});
                      }}
                      disabled={loading}
                    >
                      Use password instead
                    </Button>
                  </div>

                  <div className="text-center text-sm text-muted-foreground font-medium">
                    <Link to="/" className="hover:text-primary font-semibold hover:underline">
                      Return to website
                    </Link>
                  </div>
                </form>
              )
            ) : (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors({});
                    }}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    disabled={loading}
                    className="border-2 h-11"
                    autoComplete="email"
                    autoFocus
                  />
                  {errors.email && (
                    <p id="email-error" className="text-sm text-destructive font-semibold" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-bold">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors({});
                    }}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    disabled={loading}
                    className="border-2 h-11"
                    autoComplete="current-password"
                  />
                  {errors.password && (
                    <p id="password-error" className="text-sm text-destructive font-semibold" role="alert">
                      {errors.password}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full font-bold text-base h-12" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />}
                  Sign In
                </Button>

                <div className="text-center pt-2 border-t">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm px-0 font-semibold"
                    onClick={() => {
                      setLoginMethod("otp");
                      setErrors({});
                    }}
                    disabled={loading}
                  >
                    Use email code instead
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground font-medium">
                  <Link to="/" className="hover:text-primary font-semibold hover:underline">
                    Return to website
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
