import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Phone, Mail, Car, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Booking {
    id: string;
    pickup_date: string;
    return_date: string;
    total_amount: number;
    booking_status: string;
    payment_status: string;
    total_days: number;
    vehicles: {
        id: string;
        name: string;
        brand: string;
        model: string;
        primary_image: string;
    };
    users: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
    };
}

const OwnerBookings = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/owner-bookings`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();

                if (result.success) {
                    setBookings(result.bookings);
                } else {
                    toast({
                        title: "Error",
                        description: result.message || "Failed to fetch bookings",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error("Error fetching bookings:", error);
                toast({
                    title: "Error",
                    description: "Failed to load bookings",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchBookings();
        }
    }, [user, toast]);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'completed': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'cancelled': return 'bg-red-100 text-red-800 hover:bg-red-100';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Vehicle Bookings</h1>
                    <p className="text-muted-foreground mt-2">
                        View and manage bookings for your fleet.
                    </p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                    <span className="text-sm font-medium text-gray-500">Total Bookings</span>
                    <p className="text-2xl font-bold text-indigo-600">{bookings.length}</p>
                </div>
            </div>

            {bookings.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No bookings yet</h3>
                        <p className="text-muted-foreground mt-2">
                            When users book your vehicles, they will appear here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {bookings.map((booking) => (
                        <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                            <CardContent className="p-0">
                                <div className="flex flex-col md:flex-row">
                                    {/* Vehicle Image section */}
                                    <div className="w-full md:w-48 h-48 md:h-auto bg-gray-100 relative shrink-0">
                                        <img
                                            src={booking.vehicles.primary_image}
                                            alt={booking.vehicles.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=300&h=200';
                                            }}
                                        />
                                        <div className="absolute top-2 right-2 md:hidden">
                                            <Badge className={getStatusColor(booking.booking_status)}>
                                                {booking.booking_status}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Content section */}
                                    <div className="flex-1 p-6">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {booking.vehicles.brand} {booking.vehicles.model}
                                                    </h3>
                                                    <Badge className={`hidden md:inline-flex ${getStatusColor(booking.booking_status)}`}>
                                                        {booking.booking_status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-4">{booking.vehicles.name}</p>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center text-gray-600">
                                                            <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                                                            <span>Pickup: {new Date(booking.pickup_date).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <Clock className="h-4 w-4 mr-2 text-indigo-500" />
                                                            <span>Return: {new Date(booking.return_date).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="font-medium text-gray-900 mt-2">
                                                            Duration: {booking.total_days} days
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center text-gray-600">
                                                            <User className="h-4 w-4 mr-2 text-green-500" />
                                                            <span>{booking.users.first_name} {booking.users.last_name}</span>
                                                        </div>
                                                        <div className="flex items-center text-gray-600">
                                                            <Mail className="h-4 w-4 mr-2 text-green-500" />
                                                            <span className="truncate max-w-[200px]">{booking.users.email}</span>
                                                        </div>
                                                        {booking.users.phone && (
                                                            <div className="flex items-center text-gray-600">
                                                                <Phone className="h-4 w-4 mr-2 text-green-500" />
                                                                <span>{booking.users.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end justify-between h-full gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0">
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">Total Earnings</p>
                                                    <p className="text-2xl font-bold text-green-600">
                                                        ₹{(booking.total_amount * 0.70).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                    </p>
                                                    <p className="text-xs text-gray-400">Total Booking: ₹{booking.total_amount}</p>
                                                </div>

                                                <Button variant="outline" className="w-full md:w-auto">
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OwnerBookings;
