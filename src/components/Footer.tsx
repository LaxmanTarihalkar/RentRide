import { Car, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Footer = () => {
  const quickLinks = [
    { name: "About Us", href: "#about" },
    { name: "Our Fleet", href: "#fleet" },
    { name: "Pricing", href: "#pricing" },
    { name: "Locations", href: "#locations" },
    { name: "FAQs", href: "#faqs" },
  ];

  const services = [
    { name: "Airport Transfer", href: "#airport" },
    { name: "Wedding Cars", href: "#wedding" },
    { name: "Corporate Rentals", href: "#corporate" },
    { name: "Long Term Rentals", href: "#long-term" },
    { name: "Chauffeur Service", href: "#chauffeur" },
  ];

  const legal = [
    { name: "Terms & Conditions", href: "#terms" },
    { name: "Privacy Policy", href: "#privacy" },
    { name: "Rental Agreement", href: "#agreement" },
    { name: "Insurance Policy", href: "#insurance" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-accent-gradient flex items-center justify-center shadow-lg">
                <Car className="w-6 h-6 text-accent-foreground" />
              </div>
              <span className="text-2xl font-bold">RentRide</span>
            </div>
            <p className="text-primary-foreground/80 mb-6 leading-relaxed">
              Your trusted partner for premium car rentals. Experience luxury, comfort, and reliability with our extensive fleet of vehicles.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-primary-foreground/80">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/80">
                <Mail className="w-4 h-4" />
                <span>info@rentride.com</span>
              </div>
              <div className="flex items-center gap-3 text-primary-foreground/80">
                <MapPin className="w-4 h-4" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-primary-foreground/80 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.name}>
                  <a
                    href={service.href}
                    className="text-primary-foreground/80 hover:text-accent transition-colors"
                  >
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {legal.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="text-primary-foreground/80 hover:text-accent transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold mb-3">Subscribe to Our Newsletter</h3>
            <p className="text-primary-foreground/80 mb-4">
              Get the latest updates on new vehicles and exclusive offers.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
              />
              <Button variant="hero" className="shrink-0">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/80 text-sm text-center md:text-left">
              © {new Date().getFullYear()} RentRide. All rights reserved.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-accent-gradient flex items-center justify-center transition-all hover:scale-110"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
