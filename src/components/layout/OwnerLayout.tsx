import { useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
    Car,
    CreditCard,
    LayoutDashboard,
    LogOut,
    Menu,
    X,
    Bell,
    PlusCircle,
    Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OwnerLayout = () => {
    const { user, signOut } = useAuth();
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
        { label: "Dashboard", icon: LayoutDashboard, path: "/owner-dashboard" },
        { label: "Bookings", icon: Calendar, path: "/owner/bookings" },
        { label: "My Vehicles", icon: Car, path: "/owner/vehicles" },
        { label: "Add Vehicle", icon: PlusCircle, path: "/owner/add-vehicle" },
        { label: "Earnings", icon: CreditCard, path: "/owner/earnings" }, // Placeholder for now
    ];

    if (!user) {
        navigate('/');
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
                className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex h-16 items-center border-b border-slate-800 px-6">
                    <Car className="h-6 w-6 text-indigo-400 mr-2" />
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">RentRide Partner</span>
                    <button
                        className="ml-auto lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="h-6 w-6 text-slate-400" />
                    </button>
                </div>

                <div className="flex flex-col h-[calc(100vh-4rem)] justify-between py-6 px-4">
                    <div className="space-y-1">
                        {sidebarItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <Button
                                        variant="ghost"
                                        className={`w-full justify-start mb-1 ${isActive
                                            ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800"}`}
                                    >
                                        <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                                        {item.label}
                                    </Button>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-lg bg-slate-800 p-4 border border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                                    {user.user_metadata?.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="truncate font-medium text-sm text-white">
                                        {user.user_metadata?.first_name
                                            ? `${user.user_metadata.first_name} ${user.user_metadata?.last_name || ''}`
                                            : 'Partner'}
                                    </p>
                                    <p className="truncate text-xs text-slate-400">{user.email}</p>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full justify-start border-slate-700 text-slate-400 hover:text-white hover:bg-red-900/20 hover:border-red-900/50"
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
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/80 backdrop-blur px-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="h-6 w-6 text-slate-600" />
                        </button>
                        <h1 className="text-xl font-semibold text-slate-800">
                            {sidebarItems.find(i => i.path === location.pathname)?.label || "Dashboard"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="relative text-slate-500">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
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

export default OwnerLayout;
