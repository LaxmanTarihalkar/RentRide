import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Car,
    IndianRupee,
    TrendingUp,
    PlusCircle,
    Settings,
    AlertCircle,
    ChevronRight,
    Activity
} from "lucide-react";

import { supabase } from "@/lib/supabase";

const OwnerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [revenue, setRevenue] = useState(0);
    const [stats, setStats] = useState({ activeRentals: 0, fleetSize: 0, issues: 0 });

    useEffect(() => {
        // Determine user status
        if (!user) {
            navigate('/');
            return;
        }

        const fetchOwnerStats = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/owners/dashboard-stats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const result = await response.json();

                if (result.success) {
                    setRevenue(result.stats.revenue);
                    setStats({
                        activeRentals: result.stats.activeRentals,
                        fleetSize: result.stats.fleetSize,
                        issues: result.stats.issues
                    });
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOwnerStats();
    }, [user, navigate]);

    if (!user) return null;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <IndianRupee className="h-4 w-4 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                            +0% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Rentals</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Activity className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeRentals}</div>
                        <p className="text-xs text-muted-foreground mt-1">Vehicles currently out</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow border-l-4 border-l-indigo-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Fleet Size</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Car className="h-4 w-4 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.fleetSize}</div>
                        <p className="text-xs text-muted-foreground mt-1">Registered vehicles</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default OwnerDashboard;
