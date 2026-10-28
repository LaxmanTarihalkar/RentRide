import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Menu, X, Car, User, LogOut, Calendar } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LoginModal, SignupModal, ForgotPasswordModal } from "@/components/auth";
import { useAuthModals } from "@/hooks/useAuthModals";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  forceBackground?: boolean;
}

export const Navbar = ({ forceBackground = false }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    activeModal,
    openLogin,
    openSignup,
    closeModal,
    switchToLogin,
    switchToSignup,
    switchToForgotPassword,
  } = useAuthModals();

  const getUserDisplayName = () => {
    if (user?.user_metadata?.first_name) {
      return user.user_metadata.first_name;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t('navbar.home'), href: "/" },
    { name: t('navbar.cars'), href: "/cars" },
    { name: t('navbar.howItWorks'), href: "#how-it-works" },
    { name: t('navbar.about'), href: "#about" },
    { name: t('navbar.contact'), href: "#contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || forceBackground
          ? "bg-background/95 backdrop-blur-md shadow-lg border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-accent-gradient flex items-center justify-center shadow-lg shadow-accent/30 group-hover:scale-110 transition-transform">
              <Car className="w-6 h-6 text-accent-foreground" />
            </div>
            <span className={`text-2xl font-bold transition-all duration-300 ${
              isScrolled || forceBackground
                ? "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" 
                : "text-white drop-shadow-lg"
            }`}>
              RentRide
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.href.startsWith('#') ? (
                <a
                  key={link.name}
                  href={link.href}
                  className={`font-medium transition-colors hover:text-accent ${
                    isScrolled || forceBackground ? "text-foreground" : "text-primary-foreground"
                  }`}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`font-medium transition-colors hover:text-accent ${
                    isScrolled || forceBackground ? "text-foreground" : "text-primary-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`rounded-xl border border-transparent hover:border-accent/40 transition-all duration-200 hover:bg-accent/10 font-medium ${
                      isScrolled || forceBackground
                        ? "text-foreground hover:text-accent"
                        : "text-primary-foreground hover:text-accent"
                    }`}
                  >
                    <User className="w-4 h-4 mr-2" />
                    <span className="font-medium">{getUserDisplayName()}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border border-border/50 bg-background/95 backdrop-blur-md rounded-xl shadow-lg">
                  <DropdownMenuLabel className="px-3 py-2 font-semibold">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="mx-2" />
                  <DropdownMenuItem 
                    onClick={() => navigate('/profile')}
                    className="rounded-lg mx-2 my-0.5 px-3 py-2.5 cursor-pointer hover:bg-accent/50 transition-all duration-200"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {t('navbar.profile')}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/bookings')}
                    className="rounded-lg mx-2 my-0.5 px-3 py-2.5 cursor-pointer hover:bg-accent/50 transition-all duration-200"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('navbar.myBookings')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg mx-2 my-0.5 px-3 py-2.5 cursor-pointer hover:bg-accent/50 transition-all duration-200">
                    {t('navbar.settings')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="mx-2" />
                  <DropdownMenuItem 
                    onClick={signOut} 
                    className="rounded-lg mx-2 my-0.5 px-3 py-2.5 cursor-pointer text-destructive hover:bg-destructive/10 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('navbar.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className={`rounded-xl border-2 border-accent/30 hover:border-accent/60 transition-all duration-200 shadow-md hover:shadow-lg backdrop-blur-sm bg-background/80 hover:bg-accent/15 font-semibold hover:scale-105 transform ${
                    isScrolled || forceBackground
                      ? "text-foreground hover:text-accent"
                      : "text-primary-foreground hover:text-accent"
                  }`}
                  onClick={openLogin}
                  data-login-trigger
                >
                  {t('navbar.signIn')}
                </Button>
                <Button variant="hero" onClick={openSignup} className="rounded-xl">
                  {t('navbar.getStarted')}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled || forceBackground ? "text-foreground" : "text-primary-foreground"}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled || forceBackground ? "text-foreground" : "text-primary-foreground"}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background/98 backdrop-blur-lg border-t border-border animate-fade-in">
          <div className="container mx-auto px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              link.href.startsWith('#') ? (
                <a
                  key={link.name}
                  href={link.href}
                  className="block py-2 font-medium text-foreground hover:text-accent transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block py-2 font-medium text-foreground hover:text-accent transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              )
            ))}
            <div className="pt-4 space-y-2">
              <div className="px-4 py-2">
                <LanguageSwitcher variant="outline" showText={true} />
              </div>
              {user ? (
                <>
                  <div className="px-4 py-3 bg-accent/10 rounded-xl mb-2 border border-accent/20">
                    <p className="text-sm font-medium text-foreground">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl border-2 border-accent/30 hover:border-accent/60 shadow-md hover:shadow-lg font-semibold"
                    onClick={() => {
                      navigate('/profile');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    {t('navbar.profile')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl border-2 border-accent/30 hover:border-accent/60 shadow-md hover:shadow-lg font-semibold"
                    onClick={() => {
                      navigate('/bookings');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('navbar.myBookings')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl text-destructive hover:text-destructive border-2 border-destructive/40 hover:border-destructive/70 hover:bg-destructive/10 shadow-md hover:shadow-lg font-semibold" 
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {t('navbar.signOut')}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="w-full rounded-xl border-2 border-accent/30 hover:border-accent/60 shadow-md hover:shadow-lg font-semibold" 
                    onClick={() => {
                      openLogin();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {t('navbar.signIn')}
                  </Button>
                  <Button 
                    variant="hero" 
                    className="w-full rounded-xl shadow-lg hover:shadow-xl font-semibold" 
                    onClick={() => {
                      openSignup();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {t('navbar.getStarted')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modals */}
      <LoginModal
        isOpen={activeModal === "login"}
        onClose={closeModal}
        onSwitchToSignup={switchToSignup}
        onForgotPassword={switchToForgotPassword}
      />
      <SignupModal
        isOpen={activeModal === "signup"}
        onClose={closeModal}
        onSwitchToLogin={switchToLogin}
      />
      <ForgotPasswordModal
        isOpen={activeModal === "forgot-password"}
        onClose={closeModal}
        onBackToLogin={switchToLogin}
      />
    </nav>
  );
};
