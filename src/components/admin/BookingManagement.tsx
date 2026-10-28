import { useState, useEffect } from "react";
import { getAdminBookings } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Car,
  User,
  MapPin,
  CreditCard,
  AlertTriangle
} from "lucide-react";

interface Booking {
  id: string;
  booking_id: string;
  customer_name: string;
  customer_email: string;
  vehicle_name: string;
  vehicle_category: string;
  vehicle_image: string;
  from_date: string;
  to_date: string;
  from_time: string;
  to_time: string;
  days: number;
  total_price: number;
  payment_amount: number;
  remaining_amount: number;
  payment_type: 'minimum' | 'full';
  payment_status: 'paid' | 'pending' | 'failed';
  booking_status: 'confirmed' | 'cancelled' | 'completed' | 'active';
  payment_id: string;
  created_at: string;
  pickup_location?: string;
}

export const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const response = await getAdminBookings();
      if (response.success && response.data) {
        setBookings(response.data.bookings);
      } else {
        toast({
          title: "Error",
          description: "Failed to load bookings",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsViewDialogOpen(true);
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      // API call would go here
      console.log(`Updating booking ${bookingId} status to ${newStatus}`);

      setBookings(prev => prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, booking_status: newStatus as any }
          : booking
      ));

      toast({
        title: "Success",
        description: `Booking status updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.booking_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || booking.booking_status === statusFilter;
    const matchesPayment = paymentFilter === "all" || booking.payment_status === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
          <p className="text-gray-600">Monitor and manage all vehicle bookings</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">{bookings.filter(b => b.booking_status === 'active').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold">{bookings.filter(b => b.booking_status === 'confirmed').length}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{bookings.filter(b => b.booking_status === 'completed').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold">₹{bookings.reduce((sum, b) => sum + b.payment_amount, 0).toLocaleString()}</p>
              </div>
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Booking Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
          <CardDescription>Manage and monitor all vehicle bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-medium">{booking.booking_id}</div>
                    <div className="text-sm text-gray-500">{formatDateTime(booking.created_at)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{booking.customer_name}</p>
                        <p className="text-sm text-gray-500">{booking.customer_email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={booking.vehicle_image}
                        alt={booking.vehicle_name}
                        className="h-10 w-10 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{booking.vehicle_name}</p>
                        <p className="text-sm text-gray-500">{booking.vehicle_category}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{formatDate(booking.from_date)} - {formatDate(booking.to_date)}</p>
                      <p className="text-sm text-gray-500">{booking.days} day{booking.days > 1 ? 's' : ''}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">₹{booking.total_price.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">
                        Paid: ₹{booking.payment_amount.toLocaleString()}
                        {booking.remaining_amount > 0 && (
                          <span className="text-orange-600"> (₹{booking.remaining_amount.toLocaleString()} due)</span>
                        )}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getPaymentBadge(booking.payment_status)}</TableCell>
                  <TableCell>{getStatusBadge(booking.booking_status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewBooking(booking)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {booking.booking_status === 'confirmed' && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleUpdateBookingStatus(booking.id, 'active')}
                        >
                          Start
                        </Button>
                      )}
                      {booking.booking_status === 'active' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all" || paymentFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No bookings have been made yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              View detailed information about this booking
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Booking Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Booking ID</Label>
                      <p className="text-lg font-medium">{selectedBooking.booking_id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <div className="mt-1">{getStatusBadge(selectedBooking.booking_status)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Created</Label>
                      <p>{formatDateTime(selectedBooking.created_at)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Name</Label>
                      <p className="font-medium">{selectedBooking.customer_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p>{selectedBooking.customer_email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Vehicle & Rental Details</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Vehicle</Label>
                      <div className="flex items-center gap-3 mt-1">
                        <img
                          src={selectedBooking.vehicle_image}
                          alt={selectedBooking.vehicle_name}
                          className="h-12 w-12 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium">{selectedBooking.vehicle_name}</p>
                          <p className="text-sm text-gray-500">{selectedBooking.vehicle_category}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Pickup Location</Label>
                      <p>{selectedBooking.pickup_location || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Rental Period</Label>
                      <p className="font-medium">
                        {formatDate(selectedBooking.from_date)} - {formatDate(selectedBooking.to_date)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedBooking.from_time} - {selectedBooking.to_time} ({selectedBooking.days} day{selectedBooking.days > 1 ? 's' : ''})
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Total Amount</Label>
                    <p className="text-2xl font-bold text-blue-600">₹{selectedBooking.total_price.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Amount Paid</Label>
                    <p className="text-2xl font-bold text-green-600">₹{selectedBooking.payment_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Remaining</Label>
                    <p className="text-2xl font-bold text-orange-600">₹{selectedBooking.remaining_amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Payment Type</Label>
                    <p className="capitalize">{selectedBooking.payment_type} Payment</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Payment Status</Label>
                    <div className="mt-1">{getPaymentBadge(selectedBooking.payment_status)}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <Label className="text-sm font-medium text-gray-500">Payment ID</Label>
                  <p className="font-mono text-sm">{selectedBooking.payment_id}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};