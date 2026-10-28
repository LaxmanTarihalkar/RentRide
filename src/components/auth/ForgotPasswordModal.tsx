import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Car, ArrowLeft, Loader2 } from "lucide-react";
import { resetPassword } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export const ForgotPasswordModal = ({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    const result = await resetPassword(email);
    
    setIsLoading(false);
    
    if (result.success) {
      setIsSubmitted(true);
      toast({
        title: "Email sent!",
        description: result.message,
      });
    } else {
      toast({
        title: "Failed to send email",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    setEmail("");
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setEmail("");
    onClose();
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-md border-border/50">
          <DialogHeader className="space-y-3">
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 rounded-lg bg-accent-gradient flex items-center justify-center shadow-lg shadow-accent/30">
                <Car className="w-7 h-7 text-accent-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent ml-3">
                RentRide
              </span>
            </div>
            <DialogTitle className="text-2xl text-center text-foreground">Check your email</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              We've sent a password reset link to {email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <Button
              variant="outline"
              onClick={handleTryAgain}
              className="w-full bg-background/50 border-border/50 hover:bg-accent/10 hover:border-accent/50 transition-colors"
            >
              Try again
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground mt-6">
            <button
              onClick={onBackToLogin}
              className="text-accent hover:text-accent/80 transition-colors font-medium flex items-center justify-center gap-2 mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-md border-border/50">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-lg bg-accent-gradient flex items-center justify-center shadow-lg shadow-accent/30">
              <Car className="w-7 h-7 text-accent-foreground" />
            </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent ml-3">
                RentRide
              </span>
          </div>
          <DialogTitle className="text-2xl text-center text-foreground">Forgot your password?</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background/50 border-border/50 focus:border-accent transition-colors"
              required
            />
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground mt-6">
          <button
            onClick={onBackToLogin}
            className="text-accent hover:text-accent/80 transition-colors font-medium flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};