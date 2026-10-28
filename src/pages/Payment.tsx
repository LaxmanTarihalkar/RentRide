import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  CreditCard,
  Shield,
  ArrowLeft,
  IndianRupee,
  Calendar,
  Car,
  CheckCircle
} from "lucide-react";

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface BookingDetails {
  car: {
    id: string;
    name: string;
    category: string;
    image: string;
    price: number;
    carsLeft: number;
  };
  fromDate: string;
  toDate: string;
  fromTime: string;
  toTime: string;
  days: number;
  totalPrice: number;
}

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [paymentOption, setPaymentOption] = useState("full");
  const [isLoading, setIsLoading] = useState(false);

  const bookingDetails = location.state as BookingDetails;

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Redirect if no booking details
  if (!bookingDetails) {
    navigate('/cars');
    return null;
  }

  const { car, fromDate, toDate, fromTime, toTime, days, totalPrice } = bookingDetails;
  const minimumPayment = Math.round(totalPrice * 0.6); // 60%
  const remainingPayment = totalPrice - minimumPayment;
  const paymentAmount = paymentOption === "minimum" ? minimumPayment : totalPrice;

  const handlePayment = async () => {
    setIsLoading(true);

    try {
      if (!window.Razorpay) {
        alert("Payment gateway is loading. Please try again in a moment.");
        setIsLoading(false);
        return;
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;

      if (!razorpayKey) {
        alert("Payment configuration error. Please contact support.");
        setIsLoading(false);
        return;
      }

      // Create Razorpay order via backend
      const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: paymentAmount,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: {
            car_id: car.id,
            car_name: car.name,
            booking_days: days,
            payment_type: paymentOption,
            from_date: fromDate,
            to_date: toDate
          }
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create order');
      }

      const options = {
        key: razorpayKey,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Premium Car Rentals",
        description: `Booking for ${car.name}`,
        image: "https://cdn-icons-png.flaticon.com/512/3202/3202926.png", // Use a public icon instead
        order_id: orderData.order.id,
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              // Payment verified successfully - now create booking
              try {
                const token = localStorage.getItem('auth_token');
                const bookingResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/create`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    car_id: car.id,
                    car_name: car.name,
                    car_category: car.category,
                    car_image: car.image,
                    car_price: car.price,
                    from_date: fromDate.split('T')[0], // Extract date part
                    from_time: fromTime + ':00', // Add seconds
                    to_date: toDate.split('T')[0], // Extract date part
                    to_time: toTime + ':00', // Add seconds
                    days: days,
                    total_price: totalPrice,
                    payment_amount: paymentAmount,
                    payment_type: paymentOption,
                    remaining_amount: paymentOption === "minimum" ? remainingPayment : 0,
                    payment_id: response.razorpay_payment_id,
                    order_id: response.razorpay_order_id
                  })
                });

                const bookingData = await bookingResponse.json();

                if (bookingData.success) {
                  // Booking created successfully
                  navigate('/booking-success', {
                    state: {
                      ...bookingDetails,
                      paymentId: response.razorpay_payment_id,
                      orderId: response.razorpay_order_id,
                      paymentAmount,
                      paymentType: paymentOption,
                      remainingAmount: paymentOption === "minimum" ? remainingPayment : 0,
                      bookingId: bookingData.booking.id
                    }
                  });
                } else {
                  console.error('Booking creation failed:', bookingData.message);
                  alert(`Booking failed: ${bookingData.message}\n${bookingData.error || ''}`);
                  // Do NOT navigate to success
                }
              } catch (bookingError) {
                console.error('Booking creation error:', bookingError);
                // Still navigate to success page even if booking creation fails
                navigate('/booking-success', {
                  state: {
                    ...bookingDetails,
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                    paymentAmount,
                    paymentType: paymentOption,
                    remainingAmount: paymentOption === "minimum" ? remainingPayment : 0
                  }
                });
              }
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: "John Doe", // Get from user profile
          email: "john@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#3B82F6"
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <section className="bg-hero-gradient text-primary-foreground py-16 pt-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/cars')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{t('payment.title')}</h1>
              <p className="text-primary-foreground/90 mt-2">
                {t('payment.subtitle', { carName: car.name })}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                      {car.category}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">{car.name}</h3>
                    <p className="text-muted-foreground text-sm">{car.carsLeft} cars available</p>
                  </div>

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pickup:</span>
                      <span className="font-medium">{new Date(fromDate).toLocaleDateString()} at {fromTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Return:</span>
                      <span className="font-medium">{new Date(toDate).toLocaleDateString()} at {toTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rate per day:</span>
                      <span className="font-medium">₹{car.price.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="font-bold text-xl text-accent">
                      ₹{totalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Options */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Options
                  </CardTitle>
                  <CardDescription>
                    Choose your preferred payment method
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                  {/* Payment Type Selection */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">Payment Details</Label>
                    <RadioGroup value={paymentOption} onValueChange={setPaymentOption} className="space-y-4">
                      <div className="flex items-start space-x-3 p-4 border rounded-lg bg-indigo-50/50 border-indigo-100">
                        <RadioGroupItem value="full" id="full" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="full" className="font-medium">
                            Full Payment Required
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Pay the complete amount to confirm your booking
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-indigo-700">₹{totalPrice.toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Payment Method */}
                  <div>
                    <Label className="text-base font-semibold mb-4 block">Payment Method</Label>
                    <div className="p-4 border rounded-lg bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                          <span className="text-white font-bold text-xs">R</span>
                        </div>
                        <div>
                          <p className="font-medium">Razorpay</p>
                          <p className="text-sm text-muted-foreground">
                            Credit Card, Debit Card, UPI, Net Banking, Wallets
                          </p>
                        </div>
                        <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                      </div>
                    </div>
                  </div>



                  {/* Security Info */}
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <Shield className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your payment is secured with 256-bit SSL encryption
                    </p>
                  </div>

                </CardContent>
                <CardFooter>
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full"
                    onClick={handlePayment}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Processing..."
                    ) : (
                      <>
                        <IndianRupee className="h-5 w-5 mr-2" />
                        {t('payment.pay')} ₹{paymentAmount.toLocaleString('en-IN')}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>

          </div>
        </div>
      </section>


    </div>
  );
};

export default Payment;