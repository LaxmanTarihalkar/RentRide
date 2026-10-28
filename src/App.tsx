import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import './i18n'; // Initialize i18n
import Index from "./pages/Index";
import Cars from "./pages/Cars";
import Profile from "./pages/Profile";
import VerifyEmail from "./pages/VerifyEmail";
import Payment from "./pages/Payment";
import BookingSuccess from "./pages/BookingSuccess";
import Bookings from "./pages/Bookings";
import LanguageTest from "./pages/LanguageTest";
import NotFound from "./pages/NotFound";
import { RentOut } from "./pages/RentOut";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ManageOwners } from "./pages/admin/ManageOwners";
import { ManageCustomers } from "./pages/admin/ManageCustomers";
import { ManageVehicles } from "./pages/admin/ManageVehicles";
import { ManageCars } from "./pages/admin/ManageCars";
import { ViewBookings } from "./pages/admin/ViewBookings";
import { Disputes } from "./pages/admin/Disputes";
import { Reports } from "./pages/admin/Reports";
import { Notify } from "./pages/admin/Notify";
import UserDashboard from "./pages/UserDashboard";
import UserMap from "./pages/UserMap";
import OwnerDashboard from "./pages/OwnerDashboard";
import DashboardLayout from "./components/layout/DashboardLayout";
import OwnerLayout from "./components/layout/OwnerLayout";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";
import PaymentHistory from "./pages/PaymentHistory";

import MyVehicles from "./pages/owner/MyVehicles";
import AddVehicle from "./pages/owner/AddVehicle";
import OwnerBookings from "./pages/owner/OwnerBookings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/language-test" element={<LanguageTest />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/rent-out" element={<RentOut />} />

            {/* Dashboard Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/dashboard/map" element={<UserMap />} />
              <Route path="/dashboard/cars" element={<Cars dashboardView={true} />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/booking-success" element={<BookingSuccess />} />
              <Route path="/payment-history" element={<PaymentHistory />} />
            </Route>

            {/* Owner Routes */}
            {/* Owner Routes */}
            <Route element={<OwnerLayout />}>
              <Route path="/owner-dashboard" element={<OwnerDashboard />} />
              <Route path="/owner/vehicles" element={<MyVehicles />} />
              <Route path="/owner/add-vehicle" element={<AddVehicle />} />
              <Route path="/owner/earnings" element={<OwnerDashboard />} /> {/* Placeholder */}
              <Route path="/owner/bookings" element={<OwnerBookings />} />
            </Route>
            {/* Admin Routes - Protected */}
            <Route path="/admin" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            <Route path="/admin/vehicles" element={<ProtectedAdminRoute><ManageVehicles /></ProtectedAdminRoute>} />
            <Route path="/admin/owners" element={<ProtectedAdminRoute><ManageOwners /></ProtectedAdminRoute>} />
            <Route path="/admin/customers" element={<ProtectedAdminRoute><ManageCustomers /></ProtectedAdminRoute>} />
            <Route path="/admin/cars" element={<ProtectedAdminRoute><ManageCars /></ProtectedAdminRoute>} />
            <Route path="/admin/bookings" element={<ProtectedAdminRoute><ViewBookings /></ProtectedAdminRoute>} />
            <Route path="/admin/disputes" element={<ProtectedAdminRoute><Disputes /></ProtectedAdminRoute>} />
            <Route path="/admin/reports" element={<ProtectedAdminRoute><Reports /></ProtectedAdminRoute>} />
            <Route path="/admin/notify" element={<ProtectedAdminRoute><Notify /></ProtectedAdminRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
