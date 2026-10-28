import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    User,
    Car,
    Calendar,
    IndianRupee,
    CreditCard,
    LayoutDashboard,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    ShieldCheck,
    ChevronRight,
    Home
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UserDashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [activeBookings, setActiveBookings] = useState<any[]>([]);
    const [stats, setStats] = useState({ active: 0, completed: 0, total: 0, totalSpent: 0 });
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/my-bookings`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (data.success && data.bookings) {
                    // Combine upcoming and ongoing for "Active" view
                    const active = [...data.bookings.ongoing, ...data.bookings.upcoming];
                    setActiveBookings(active);

                    // Calculate total spent from completed bookings
                    const spent = data.bookings.completed.reduce((acc: number, curr: any) => acc + (curr.total_price || 0), 0);

                    setStats({
                        active: active.length,
                        completed: data.bookings.completed.length,
                        total: data.bookings.all.length,
                        totalSpent: spent
                    });
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load dashboard data."
                });
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        } else {
            navigate('/');
        }
    }, [user, navigate]);

    const handleLogout = async () => {
        await signOut();
        toast({
            title: "Signed out",
            description: "You have been successfully signed out.",
        });
        navigate('/');
    };

    const sidebarItems = [
        { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
        { label: "Browse Cars", icon: Search, path: "/cars" },
        { label: "My Bookings", icon: Calendar, path: "/bookings" },
        { label: "Profile", icon: User, path: "/profile" },

        { label: "Back to Home", icon: Home, path: "/" },
    ];

    if (!user) return null;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active}</div>
                        <p className="text-xs text-muted-foreground">Current ongoing & upcoming</p>
                    </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/bookings')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.completed}</div>
                        <p className="text-xs text-muted-foreground">Lifetime completed trips</p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/profile')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Active</div>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/bookings')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <IndianRupee className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.totalSpent.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-muted-foreground">Lifetime rental value</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="space-y-6">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Your latest bookings and rental status.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : activeBookings.length > 0 ? (
                                <div className="space-y-4">
                                    {activeBookings.map((booking, idx) => (
                                        <div key={idx} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                                    <Car className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{booking.car_name}</p>
                                                    <p className="text-sm text-muted-foreground">Booking #{booking.id}</p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-0">Active</Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 px-4 border-2 border-dashed rounded-lg">
                                    <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Car className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium">No Recent Trips</h3>
                                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                        You haven't made any bookings yet. Browse our fleet to find your perfect ride.
                                    </p>
                                    <Button onClick={() => navigate('/cars')}>
                                        Browse Cars
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
