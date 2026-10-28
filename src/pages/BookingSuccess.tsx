import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Calendar,
  Car,
  IndianRupee,
  Download,
  Home,
  Phone
} from "lucide-react";

interface BookingSuccessDetails {
  car: {
    id: number;
    name: string;
    category: string;
    image: string;
    price: number;
  };
  fromDate: string;
  toDate: string;
  days: number;
  totalPrice: number;
  paymentId: string;
  paymentAmount: number;
  paymentType: string;
  remainingAmount: number;
}

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const bookingDetails = location.state as BookingSuccessDetails;

  // Redirect if no booking details
  if (!bookingDetails) {
    navigate('/');
    return null;
  }

  const { car, fromDate, toDate, days, totalPrice, paymentId, paymentAmount, paymentType, remainingAmount } = bookingDetails;
  const bookingId = `BK${Date.now().toString().slice(-8)}`;

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Success Header */}
      <section className="bg-green-50 dark:bg-green-950/20 py-16 pt-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-green-700 dark:text-green-300">
              {t('bookingSuccess.title')}
            </h1>
            <p className="text-lg text-green-600 dark:text-green-400">
              {t('bookingSuccess.subtitle', { carName: car.name })}
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 inline-block">
              <p className="text-sm text-muted-foreground">Booking ID</p>
              <p className="font-mono font-bold text-lg">{bookingId}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Booking Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <img
                    src={car.image}
                    alt={car.name}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                    {car.category}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-xl">{car.name}</h3>
                  <p className="text-muted-foreground">Booking ID: {bookingId}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Pickup Date</p>
                    <p className="font-medium">{new Date(fromDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Return Date</p>
                    <p className="font-medium">{new Date(toDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{days} days</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Rate per day</p>
                    <p className="font-medium">₹{car.price.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-semibold">₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Paid Now:</span>
                    <span className="font-semibold">₹{paymentAmount.toLocaleString('en-IN')}</span>
                  </div>
                  {remainingAmount > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Due at Pickup:</span>
                      <span className="font-semibold">₹{remainingAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment & Next Steps */}
            <div className="space-y-6">

              {/* Payment Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment ID:</span>
                    <span className="font-mono text-sm">{paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Method:</span>
                    <span>Razorpay</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Type:</span>
                    <span className="capitalize">{paymentType} Payment</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Confirmed
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>What's Next?</CardTitle>
                  <CardDescription>
                    Here's what you need to know for your pickup
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-bold">1</div>
                      <div>
                        <p className="font-medium">Confirmation Email</p>
                        <p className="text-muted-foreground">Check your email for booking confirmation and pickup details</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-bold">2</div>
                      <div>
                        <p className="font-medium">Bring Documents</p>
                        <p className="text-muted-foreground">Valid driving license and ID proof required at pickup</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-bold">3</div>
                      <div>
                        <p className="font-medium">Pickup Location</p>
                        <p className="text-muted-foreground">Visit our nearest location 30 minutes before pickup time</p>
                      </div>
                    </div>
                    {remainingAmount > 0 && (
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                        <div>
                          <p className="font-medium">Remaining Payment</p>
                          <p className="text-muted-foreground">Pay ₹{remainingAmount.toLocaleString('en-IN')} at pickup location</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button variant="outline" className="w-full" onClick={() => window.print()}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
                <Button variant="outline" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/bookings')}>
                  <Calendar className="h-4 w-4 mr-2" />
                  View All Bookings
                </Button>
                <Button variant="hero" className="w-full" onClick={() => navigate('/')}>
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </div>

            </div>

          </div>
        </div>
      </section>


    </div>
  );
};

export default BookingSuccess;