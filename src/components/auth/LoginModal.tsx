import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Eye, EyeOff, Car, Loader2 } from "lucide-react";
import { signIn } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
}

export const LoginModal = ({ isOpen, onClose, onSwitchToSignup, onForgotPassword }: LoginModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    const result = await signIn({
      email: formData.email,
      password: formData.password,
    });

    setIsLoading(false);

    if (result.success) {
      // Refresh user state to update navbar
      await refreshUser();

      // Check if admin credentials
      const isAdminLogin = formData.email === 'admin@rentride.com' ||
        (result.data?.user?.role === 'admin');

      toast({
        title: "Welcome back!",
        description: isAdminLogin ? "Welcome to Admin Panel!" : "You've successfully signed in.",
      });

      // Reset form and close modal
      setFormData({ email: "", password: "" });
      onClose();

      // Redirect based on role
      const role = result.data?.user?.role;

      if (isAdminLogin || role === 'admin') {
        navigate('/admin');
      } else if (role === 'owner') {
        navigate('/owner-dashboard');
      } else {
        // Customer or mapped user role
        navigate('/dashboard');
      }
    } else {
      toast({
        title: "Sign in failed",
        description: result.message,
        variant: "destructive",
      });
    }
  };



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <DialogTitle className="text-2xl text-center text-foreground">Welcome back</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Sign in to your account to continue your journey
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              className="bg-background/50 border-border/50 focus:border-accent transition-colors"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className="bg-background/50 border-border/50 focus:border-accent transition-colors pr-12"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-accent/10 text-muted-foreground hover:text-accent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-accent hover:text-accent/80 transition-colors font-medium"
            >
              Forgot password?
            </button>
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>



        <div className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <button
            onClick={onSwitchToSignup}
            className="text-accent hover:text-accent/80 transition-colors font-medium"
          >
            Sign up
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};