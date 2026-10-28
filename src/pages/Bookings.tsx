import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  Car,
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Download,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Booking {
  id: string;
  vehicle_id: string;
  pickup_date: string;
  return_date: string;
  total_days: number;
  total_amount: number;
  payment_amount: number;
  payment_type: string;
  remaining_amount: number;
  payment_id: string;
  order_id: string;
  booking_status: string;
  payment_status: string;
  created_at: string;
  vehicles?: {
    name: string;
    brand: string;
    model: string;
    primary_image: string;
    location: string;
  };
}

interface BookingsData {
  all: Booking[];
  upcoming: Booking[];
  ongoing: Booking[];
  completed: Booking[];
  cancelled: Booking[];
}

const Bookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<BookingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/my-bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings);
      } else {
        console.error('Failed to fetch bookings:', data.message);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Refresh bookings
        fetchBookings();
        alert('Booking cancelled successfully');
      } else {
        alert(data.message || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      case 'completed':
        return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Invalid Date';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '10:00';
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getCarName = (booking: Booking) => {
    if (booking.vehicles) {
      return `${booking.vehicles.brand} ${booking.vehicles.model}`;
    }
    return "Unknown Car";
  };

  const getCarImage = (booking: Booking) => {
    if (booking.vehicles && booking.vehicles.primary_image) {
      return booking.vehicles.primary_image;
    }
    return "/placeholder.png";
  };


  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={getCarImage(booking)}
              alt={getCarName(booking)}
              className="w-16 h-12 object-cover rounded-lg"
            />
            <div>
              <CardTitle className="text-lg">{getCarName(booking)}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="outline">Car</Badge>
                {getStatusBadge(booking.booking_status)}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.print()}>
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Phone className="h-4 w-4 mr-2" />
                Contact Support
              </DropdownMenuItem>
              {booking.booking_status === 'confirmed' && new Date(booking.pickup_date) > new Date() && (
                <DropdownMenuItem
                  onClick={() => cancelBooking(booking.id)}
                  className="text-destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Booking
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Pickup</p>
              <p className="font-medium">{formatDate(booking.pickup_date)} at {formatTime(booking.pickup_date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Return</p>
              <p className="font-medium">{formatDate(booking.return_date)} at {formatTime(booking.return_date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-medium">{booking.total_days} days</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="font-medium">₹{booking.total_amount?.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center text-sm">
          <div>
            <p className="text-muted-foreground">Payment Status</p>
            <p className="font-medium capitalize">{booking.payment_type || 'Full'} Payment</p>
            <p className="text-xs text-muted-foreground">ID: {booking.payment_id}</p>
          </div>
          <div className="text-right">
            <p className="text-green-600 font-medium">Paid: ₹{booking.payment_amount.toLocaleString('en-IN')}</p>
            {booking.remaining_amount > 0 && (
              <p className="text-orange-600 text-sm">Due: ₹{booking.remaining_amount.toLocaleString('en-IN')}</p>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Booked on {new Date(booking.created_at).toLocaleDateString('en-IN')}
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar forceBackground={true} />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your bookings...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <section className="bg-hero-gradient text-primary-foreground py-16 pt-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold">{t('bookings.title')}</h1>
            <p className="text-xl text-primary-foreground/90">
              {t('bookings.subtitle')}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Upcoming ({bookings?.upcoming.length || 0})
              </TabsTrigger>
              <TabsTrigger value="ongoing" className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                Ongoing ({bookings?.ongoing.length || 0})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed ({bookings?.completed.length || 0})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Cancelled ({bookings?.cancelled.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {bookings?.upcoming.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Upcoming Bookings</h3>
                    <p className="text-muted-foreground mb-4">You don't have any upcoming car rentals.</p>
                    <Button onClick={() => navigate('/cars')}>Browse Cars</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {bookings?.upcoming.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ongoing" className="space-y-4">
              {bookings?.ongoing.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Ongoing Rentals</h3>
                    <p className="text-muted-foreground">You don't have any active car rentals.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {bookings?.ongoing.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {bookings?.completed.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Completed Bookings</h3>
                    <p className="text-muted-foreground">Your completed rentals will appear here.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {bookings?.completed.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              {bookings?.cancelled.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Cancelled Bookings</h3>
                    <p className="text-muted-foreground">Your cancelled bookings will appear here.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {bookings?.cancelled.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>


    </div>
  );
};

export default Bookings;