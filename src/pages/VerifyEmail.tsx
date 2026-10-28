import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, Car } from "lucide-react";
import { verifyEmail } from "@/services/authService";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    const verify = async () => {
      const result = await verifyEmail(token);

      if (result.success) {
        setStatus('success');
        setMessage(result.message);
      } else {
        setStatus('error');
        setMessage(result.message);
      }
    };

    verify();
  }, [searchParams]);

  const handleGoToLogin = () => {
    navigate('/');
    // Trigger login modal after navigation
    setTimeout(() => {
      const loginButton = document.querySelector('[data-login-trigger]');
      if (loginButton) {
        (loginButton as HTMLElement).click();
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
      </div>

      <Card className="w-full max-w-md bg-background/95 backdrop-blur-md border-border/50 shadow-2xl animate-scale-in">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              {status === 'loading' && <Loader2 className="w-10 h-10 text-accent animate-spin" />}
              {status === 'success' && <CheckCircle2 className="w-10 h-10 text-accent" />}
              {status === 'error' && <XCircle className="w-10 h-10 text-destructive" />}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-lg bg-accent-gradient flex items-center justify-center shadow-lg shadow-accent/30">
              <Car className="w-7 h-7 text-accent-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent ml-3">
              RentRide
            </span>
          </div>
          <CardTitle className="text-2xl text-center text-foreground">
            {status === 'loading' && 'Verifying Your Email...'}
            {status === 'success' && 'Email Verified! 🎉'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            {status === 'loading' && 'Please wait while we verify your email address'}
            {status === 'success' && message}
            {status === 'error' && message}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'success' && (
            <>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 text-center">
                <p className="text-sm text-foreground">
                  Your account is now active! You can sign in and start booking your dream cars.
                </p>
              </div>
              <Button variant="hero" className="w-full" onClick={handleGoToLogin}>
                Sign In Now
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                Go to Home
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  The verification link may have expired or is invalid. Please try signing up again or contact support.
                </p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                Go to Home
              </Button>
            </>
          )}

          {status === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;