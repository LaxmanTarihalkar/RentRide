import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getAdminDashboard, DashboardData } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Car,
  Calendar,
  AlertTriangle,
  BarChart3,
  Bell,
  LogOut,
  Menu,
  X,
  TrendingUp,
  DollarSign,
  Activity,
  Eye
} from "lucide-react";
import { OwnerManagement } from "@/components/admin/OwnerManagement";
import { VehicleManagement } from "@/components/admin/VehicleManagement";
import { CustomerManagement } from "@/components/admin/CustomerManagement";
import { BookingManagement } from "@/components/admin/BookingManagement";
import { ReportsManagement } from "@/components/admin/ReportsManagement";

interface AdminDashboardProps {
  activeSection?: string;
}

export const AdminDashboard = ({ activeSection = "dashboard" }: AdminDashboardProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { id: "vehicles", label: "Manage Vehicles", icon: Car, path: "/admin/vehicles" },
    { id: "owners", label: "Manage Owners", icon: Users, path: "/admin/owners" },
    { id: "customers", label: "Manage Customers", icon: UserCheck, path: "/admin/customers" },
    { id: "bookings", label: "View Bookings", icon: Calendar, path: "/admin/bookings" },
    { id: "reports", label: "Reports", icon: BarChart3, path: "/admin/reports" },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    if (activeSection === "dashboard") {
      loadDashboardData();
    }
  }, [activeSection]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const result = await getAdminDashboard();
      if (result.success && result.data) {
        setDashboardData(result.data);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to load dashboard data",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const renderDashboardContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      );
    }

    if (!dashboardData) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">Failed to load dashboard data</p>
          <button
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      );
    }

    const { stats } = dashboardData;

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs opacity-80">Total earnings</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Activity className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeBookings}</div>
              <p className="text-xs opacity-80">Currently active</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
              <Car className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCars}</div>
              <p className="text-xs opacity-80">In fleet</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <TrendingUp className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs opacity-80">Registered users</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest car rental bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentBookings.length > 0 ? (
                  dashboardData.recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">{booking.customer}</p>
                          <p className="text-sm text-muted-foreground">{booking.car}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          booking.status === "active" ? "default" :
                            booking.status === "completed" ? "secondary" : "outline"
                        }>
                          {booking.status}
                        </Badge>
                        <span className="font-medium">{booking.amount}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No recent bookings</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Newly registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentUsers.length > 0 ? (
                  dashboardData.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {new Date(user.joinDate).toLocaleDateString()}
                        </span>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No recent users</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => handleNavigation('/admin/vehicles')}>
                <Car className="h-6 w-6" />
                <span>Manage Vehicles</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => handleNavigation('/admin/cars')}>
                <Car className="h-6 w-6" />
                <span>Manage Cars</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => handleNavigation('/admin/bookings')}>
                <Calendar className="h-6 w-6" />
                <span>View Bookings</span>
              </Button>

              <Button variant="outline" className="h-20 flex-col space-y-2" onClick={() => handleNavigation('/admin/reports')}>
                <BarChart3 className="h-6 w-6" />
                <span>Generate Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex items-center ml-4 lg:ml-0">
                <Car className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">RentRide Admin</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Fixed Sidebar */}
        <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:fixed top-16 left-0 bottom-0 z-40 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out`}>
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.path)}
                      className={`${isActive
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group flex items-center px-2 py-2 text-sm font-medium border-l-4 w-full text-left transition-colors duration-200`}
                    >
                      <Icon className={`${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'} mr-3 h-5 w-5`} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <main className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {sidebarItems.find(item => item.id === activeSection)?.label || "Dashboard"}
                </h1>
                <p className="text-gray-600">Welcome to RentRide Admin Panel</p>
              </div>

              {activeSection === "dashboard" && renderDashboardContent()}
              {activeSection === "vehicles" && <VehicleManagement />}

              {activeSection === "owners" && <OwnerManagement />}
              {activeSection === "customers" && <CustomerManagement />}
              {activeSection === "bookings" && <BookingManagement />}
              {activeSection === "reports" && <ReportsManagement />}
              {activeSection !== "dashboard" && activeSection !== "vehicles" && activeSection !== "owners" && activeSection !== "customers" && activeSection !== "bookings" && activeSection !== "reports" && (
                <Card>
                  <CardHeader>
                    <CardTitle>{sidebarItems.find(item => item.id === activeSection)?.label}</CardTitle>
                    <CardDescription>This section is under development</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      The {sidebarItems.find(item => item.id === activeSection)?.label} functionality will be implemented here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-gray-600 bg-opacity-75"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};