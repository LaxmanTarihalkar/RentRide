import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  Car,
  Users,
  Fuel,
  Gauge,
  Settings,
  Search,
  Filter,
  Star,
  Calendar,
  IndianRupee
} from "lucide-react";

interface Car {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
  seats: number;
  transmission: string;
  fuel: string;
  speed: string;
  features: string[];
  available: boolean;
  carsLeft: number;
}

interface CarsProps {
  dashboardView?: boolean;
}

const Cars = ({ dashboardView = false }: CarsProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [fromTime, setFromTime] = useState("10:00");
  const [toTime, setToTime] = useState("10:00");

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vehicles/public`);
        const data = await response.json();

        if (data.success) {
          // Transform backend data to frontend Car interface
          const mappedCars: Car[] = data.data.map((vehicle: any) => ({
            id: vehicle.id,
            name: vehicle.name,
            category: vehicle.category_name || "Car",
            image: vehicle.primary_image,
            price: vehicle.price_per_day,
            rating: 4.8, // Default rating as it's not in DB yet
            reviews: 0,
            seats: vehicle.specifications?.seats || 4,
            transmission: vehicle.specifications?.transmission || "Automatic",
            fuel: vehicle.specifications?.fuel_type || "Petrol",
            speed: vehicle.specifications?.max_speed || "180 km/h",
            features: vehicle.features || [],
            available: vehicle.is_available,
            carsLeft: 1 // Default to 1
          }));
          setCars(mappedCars);
        }
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  const categories = ["all", "Electric", "Sports", "Luxury", "SUV", "Exotic"];

  const handleBookNow = (car: Car) => {
    setSelectedCar(car);
    setFromDate(undefined);
    setToDate(undefined);
    setFromTime("10:00");
    setToTime("10:00");
    setIsBookingModalOpen(true);
  };

  const handleConfirmBooking = () => {
    if (fromDate && toDate && selectedCar) {
      // Calculate total days and price
      const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalPrice = days * selectedCar.price;

      // Navigate to payment page with booking details
      navigate('/payment', {
        state: {
          car: selectedCar,
          fromDate: fromDate.toISOString(),
          toDate: toDate.toISOString(),
          fromTime,
          toTime,
          days,
          totalPrice
        }
      });

      setIsBookingModalOpen(false);
      setSelectedCar(null);
      setFromDate(undefined);
      setToDate(undefined);
    }
  };

  const filteredCars = cars
    .filter((car) => {
      const matchesSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || car.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0; // popular (default order)
    });

  return (
    <div className="min-h-screen bg-background">
      {!dashboardView && <Navbar />}

      {/* Header Section */}
      {!dashboardView && (
        <section className="relative bg-hero-gradient text-primary-foreground py-20 pt-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-4 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold">{t('cars.title')}</h1>
              <p className="text-xl text-primary-foreground/90">
                {t('cars.subtitle')}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Filters Section */}
      <section className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('cars.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Settings className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Cars Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing {filteredCars.length} of {cars.length} cars
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCars.map((car) => (
              <Card key={car.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
                {/* Car Image */}
                <div className="relative h-48 overflow-hidden flex-shrink-0">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-accent text-accent-foreground">
                      {car.category}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant={car.carsLeft <= 2 ? "destructive" : "secondary"} className="bg-background/90 text-foreground">
                      {car.carsLeft} left
                    </Badge>
                  </div>
                  {!car.available && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Badge variant="destructive" className="text-lg px-4 py-2">
                        Not Available
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <div className="min-h-[60px]">
                      <CardTitle className="text-xl group-hover:text-accent transition-colors line-clamp-2">
                        {car.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span className="font-semibold">{car.rating}</span>
                        <span className="text-muted-foreground">({car.reviews})</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 flex-grow">
                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{car.seats} Seats</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Settings className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{car.transmission}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Fuel className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{car.fuel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Gauge className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{car.speed}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1 min-h-[28px]">
                    {car.features.slice(0, 2).map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {car.features.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{car.features.length - 2}
                      </Badge>
                    )}
                  </div>

                  {/* Price */}
                  <div className="pt-2 border-t">
                    <div className="flex items-baseline gap-1">
                      <IndianRupee className="h-6 w-6 text-accent" />
                      <span className="text-3xl font-bold text-accent">{car.price.toLocaleString('en-IN')}</span>
                      <span className="text-muted-foreground">/day</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="hero"
                    className="flex-1"
                    disabled={!car.available}
                    onClick={() => handleBookNow(car)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('cars.bookNow')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredCars.length === 0 && (
            <div className="text-center py-12">
              <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No cars found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('booking.title', { carName: selectedCar?.name })}</DialogTitle>
            <DialogDescription>
              {t('booking.subtitle')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* From Date & Time */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">{t('booking.pickupDateTime')}</Label>
              <CalendarComponent
                mode="single"
                selected={fromDate}
                onSelect={setFromDate}
                disabled={(date) => date < new Date() || (toDate && date >= toDate)}
                className="rounded-md border"
              />
              <div className="mt-3">
                <Label className="text-sm font-medium">{t('booking.pickupTime')}</Label>
                <Select value={fromTime} onValueChange={setFromTime}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="08:00">08:00 AM</SelectItem>
                    <SelectItem value="09:00">09:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="13:00">01:00 PM</SelectItem>
                    <SelectItem value="14:00">02:00 PM</SelectItem>
                    <SelectItem value="15:00">03:00 PM</SelectItem>
                    <SelectItem value="16:00">04:00 PM</SelectItem>
                    <SelectItem value="17:00">05:00 PM</SelectItem>
                    <SelectItem value="18:00">06:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* To Date & Time */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Return Date & Time</Label>
              <CalendarComponent
                mode="single"
                selected={toDate}
                onSelect={setToDate}
                disabled={(date) => date < new Date() || (fromDate && date <= fromDate)}
                className="rounded-md border"
              />
              <div className="mt-3">
                <Label className="text-sm font-medium">Return Time</Label>
                <Select value={toTime} onValueChange={setToTime}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="08:00">08:00 AM</SelectItem>
                    <SelectItem value="09:00">09:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="13:00">01:00 PM</SelectItem>
                    <SelectItem value="14:00">02:00 PM</SelectItem>
                    <SelectItem value="15:00">03:00 PM</SelectItem>
                    <SelectItem value="16:00">04:00 PM</SelectItem>
                    <SelectItem value="17:00">05:00 PM</SelectItem>
                    <SelectItem value="18:00">06:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          {fromDate && toDate && selectedCar && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold">Booking Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Pickup:</span>
                  <p className="font-medium">{fromDate.toLocaleDateString()} at {fromTime}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Return:</span>
                  <p className="font-medium">{toDate.toLocaleDateString()} at {toTime}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <p className="font-medium">
                    {Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Price:</span>
                  <p className="font-bold text-accent text-lg">
                    ₹{(Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) * selectedCar.price).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="hero"
              onClick={handleConfirmBooking}
              disabled={!fromDate || !toDate}
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!dashboardView && <Footer />}
    </div>
  );
};

export default Cars;