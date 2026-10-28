import { Shield, Clock, CreditCard, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Fully Insured",
    description: "All vehicles come with comprehensive insurance coverage for your peace of mind.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Round-the-clock customer service to assist you whenever you need help.",
  },
  {
    icon: CreditCard,
    title: "Easy Payment",
    description: "Flexible payment options with no hidden fees. Pay securely online or in person.",
  },
  {
    icon: MapPin,
    title: "Multiple Locations",
    description: "Pick up and drop off at convenient locations across the city.",
  },
];

export const Features = () => {
  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Us</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We provide premium rental services with unmatched convenience and reliability
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-scale-in border-border/50 backdrop-blur-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-lg bg-accent-gradient flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
