import { Search, Calendar, Key, MapPin } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Choose Your Car",
    description: "Browse our premium fleet and select the perfect vehicle for your journey.",
  },
  {
    icon: Calendar,
    title: "Pick Your Dates",
    description: "Select your rental period with flexible pickup and drop-off times.",
  },
  {
    icon: Key,
    title: "Book & Confirm",
    description: "Complete your booking online with instant confirmation and secure payment.",
  },
  {
    icon: MapPin,
    title: "Drive Away",
    description: "Pick up your car and hit the road. It's that simple!",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Renting a car has never been easier. Just follow these simple steps
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Timeline line - positioned to connect the icons */}
          <div className="hidden lg:block absolute left-[12.5%] right-[12.5%] h-0.5 bg-border" style={{ top: '60px' }} />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center animate-fade-in px-4"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative inline-flex mb-6">
                  <div className="w-24 h-24 rounded-full bg-accent-gradient flex items-center justify-center shadow-lg shadow-accent/30">
                    <step.icon className="w-10 h-10 text-accent-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
