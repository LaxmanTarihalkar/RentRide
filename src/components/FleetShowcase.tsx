import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Zap, Fuel } from "lucide-react";

const vehicles = [
  {
    name: "Tesla Model S",
    category: "Luxury Sedan",
    price: "₹8,500",
    specs: { passengers: 5, power: "Electric", range: "650 km" },
    image: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=800&q=80",
  },
  {
    name: "BMW X5",
    category: "Premium SUV",
    price: "₹10,500",
    specs: { passengers: 7, power: "Hybrid", range: "720 km" },
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
  },
  {
    name: "Mercedes S-Class",
    category: "Executive Sedan",
    price: "₹12,800",
    specs: { passengers: 5, power: "V8", range: "840 km" },
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
  },
];

export const FleetShowcase = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Premium Fleet</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our collection of luxury vehicles, each maintained to the highest standards
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle, index) => (
            <Card
              key={index}
              className="group overflow-hidden hover:shadow-2xl transition-all duration-500 animate-slide-in-left border-border/50"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-accent-gradient px-4 py-2 rounded-full">
                  <span className="text-accent-foreground font-bold">{vehicle.price}/day</span>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="mb-4">
                  <span className="text-sm text-muted-foreground">{vehicle.category}</span>
                  <h3 className="text-2xl font-bold mt-1">{vehicle.name}</h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{vehicle.specs.passengers}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    <span>{vehicle.specs.power}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Fuel className="w-4 h-4" />
                    <span>{vehicle.specs.range}</span>
                  </div>
                </div>
                <Button className="w-full" variant="hero">
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
