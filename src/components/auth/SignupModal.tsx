import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Car, Loader2, CheckCircle2 } from "lucide-react";
import { signUp } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export const SignupModal = ({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user" as "user" | "owner",
    agreeToTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords don't match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const result = await signUp({
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: formData.role,
    });

    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
      toast({
        title: "Success!",
        description: result.message,
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user",
        agreeToTerms: false,
      });
    } else {
      toast({
        title: "Signup failed",
        description: result.message,
        variant: "destructive",
      });
    }
  };



  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      agreeToTerms: checked,
    });
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-md border-border/50">
          <DialogHeader className="space-y-3">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-accent" />
              </div>
            </div>
            <DialogTitle className="text-2xl text-center text-foreground">Check your email!</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              We've sent a verification link to <strong>{formData.email}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground text-center">
              Please click the link in the email to verify your account and complete the signup process.
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Didn't receive the email? Check your spam folder.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button variant="hero" onClick={handleClose} className="w-full">
              Got it!
            </Button>
            <Button variant="outline" onClick={onSwitchToLogin} className="w-full">
              Back to Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-md border-border/50 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-lg bg-accent-gradient flex items-center justify-center shadow-lg shadow-accent/30">
              <Car className="w-7 h-7 text-accent-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent ml-3">
              RentRide
            </span>
          </div>
          <DialogTitle className="text-2xl text-center text-foreground">Create your account</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Join RentRide and start your journey
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-foreground font-medium">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={handleInputChange}
                className="bg-background/50 border-border/50 focus:border-accent transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-foreground font-medium">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleInputChange}
                className="bg-background/50 border-border/50 focus:border-accent transition-colors"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john.doe@example.com"
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
                placeholder="Create a strong password"
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-foreground font-medium">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="bg-background/50 border-border/50 focus:border-accent transition-colors pr-12"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-accent/10 text-muted-foreground hover:text-accent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-foreground font-medium">I want to join as a:</Label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`
                  relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
                  ${formData.role === 'user'
                    ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
                    : 'border-border/50 bg-background/50 hover:bg-muted/50 hover:border-muted-foreground/30'}
                `}
              >
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={formData.role === 'user'}
                  onChange={() => setFormData({ ...formData, role: 'user' })}
                  className="sr-only"
                />
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${formData.role === 'user' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <Car className="w-5 h-5" />
                </div>
                <span className={`font-semibold ${formData.role === 'user' ? 'text-accent' : 'text-muted-foreground'}`}>Customer</span>
                <span className="text-xs text-muted-foreground mt-1 text-center">I want to rent cars</span>
              </label>

              <label
                className={`
                  relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
                  ${formData.role === 'owner'
                    ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
                    : 'border-border/50 bg-background/50 hover:bg-muted/50 hover:border-muted-foreground/30'}
                `}
              >
                <input
                  type="radio"
                  name="role"
                  value="owner"
                  checked={formData.role === 'owner'}
                  onChange={() => setFormData({ ...formData, role: 'owner' })}
                  className="sr-only"
                />
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${formData.role === 'owner' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                  <div className="relative">
                    <Car className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background"></span>
                  </div>
                </div>
                <span className={`font-semibold ${formData.role === 'owner' ? 'text-accent' : 'text-muted-foreground'}`}>Car Owner</span>
                <span className="text-xs text-muted-foreground mt-1 text-center">I want to list my cars</span>
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreeToTerms}
              onCheckedChange={handleCheckboxChange}
              className="border-border/50 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
            />
            <Label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to the{" "}
              <button type="button" className="text-accent hover:text-accent/80 transition-colors">
                Terms of Service
              </button>{" "}
              and{" "}
              <button type="button" className="text-accent hover:text-accent/80 transition-colors">
                Privacy Policy
              </button>
            </Label>
          </div>
          <Button type="submit" variant="hero" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>



        <div className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-accent hover:text-accent/80 transition-colors font-medium"
          >
            Sign in
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};