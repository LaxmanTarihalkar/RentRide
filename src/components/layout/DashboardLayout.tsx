import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
    User,
    Car,
    Calendar,
    CreditCard,
    LayoutDashboard,
    LogOut,
    Menu,
    X,
    Bell,
    Search,
    Home,
    Map
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DashboardLayout = () => {
    const { user, signOut, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        { label: "Browse Cars", icon: Search, path: "/dashboard/cars" },
        { label: "Map View", icon: Map, path: "/dashboard/map" },
        { label: "My Bookings", icon: Calendar, path: "/bookings" },

    ];



    useEffect(() => {
        if (!loading && !user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex h-16 items-center border-b px-6">
                    <Car className="h-6 w-6 text-primary mr-2" />
                    <span className="text-xl font-bold text-primary">RentRide</span>
                    <button
                        className="ml-auto lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="h-6 w-6 text-muted-foreground" />
                    </button>
                </div>

                <div className="flex flex-col h-[calc(100vh-4rem)] justify-between py-6 px-4">
                    <div className="space-y-1">
                        {sidebarItems.map((item) => {
                            // Match path partially for nested routes if needed, but exact is fine for now
                            const isActive = location.pathname === item.path;
                            return (
                                <Button
                                    key={item.path}
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={`w-full justify-start ${isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"}`}
                                    onClick={() => {
                                        navigate(item.path);
                                        setIsSidebarOpen(false);
                                    }}
                                >
                                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                                    {item.label}
                                </Button>
                            );
                        })}
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-lg bg-primary/5 p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {user.user_metadata?.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="truncate font-medium text-sm">
                                        {user.user_metadata?.first_name
                                            ? `${user.user_metadata.first_name} ${user.user_metadata?.last_name || ''}`
                                            : 'User'}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={handleLogout}
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64">
                {/* Top Header */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/95 backdrop-blur px-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6 text-muted-foreground" />
                        </button>
                        <h1 className="text-xl font-semibold text-gray-800">
                            {sidebarItems.find(i => i.path === location.pathname)?.label || "Dashboard"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
                        </Button>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
