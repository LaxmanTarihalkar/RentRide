import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Car,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Filter,
  Search,
  Users,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OwnerRequest {
  id: number;
  businessType: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  totalCars: string;
  carTypes: string[];
  operatingYears: string;
  description?: string;
  website?: string;
  socialMedia?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  approvalDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const OwnerManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [requests, setRequests] = useState<OwnerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<OwnerRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Use existing admin owners route
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/admin/owners?page=${currentPage}&limit=10&status=${statusFilter}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();

      if (result.success && result.data) {
        // Convert owners data to requests format
        const owners = result.data.owners || [];
        const convertedRequests = owners.map((owner: any) => ({
          id: owner.id,
          businessType: owner.businessType,
          businessName: owner.businessName,
          ownerName: owner.ownerName,
          email: owner.email,
          phone: owner.phone,
          alternatePhone: owner.alternatePhone,
          address: owner.address,
          city: owner.city,
          state: owner.state,
          pincode: owner.pincode,
          totalCars: owner.totalCars,
          carTypes: owner.carTypes || [],
          operatingYears: owner.operatingYears,
          description: owner.description,
          website: owner.website,
          socialMedia: owner.socialMedia,
          verificationStatus: owner.verificationStatus,
          approvalDate: owner.approvalDate,
          rejectionReason: owner.rejectionReason,
          createdAt: owner.createdAt,
          updatedAt: owner.updatedAt
        }));

        setRequests(convertedRequests);
        setTotalPages(result.data.pagination.pages);
        setTotalRequests(result.data.pagination.total);
      } else {
        throw new Error(result.message || 'Failed to fetch requests');
      }
    } catch (error) {
      console.error('Fetch requests error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch owner requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/admin/owners/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Owner request approved successfully! Login credentials have been sent via email.",
        });
        fetchRequests();
      } else {
        throw new Error(result.message || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast({
        title: "Error",
        description: "Failed to approve owner request",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/admin/owners/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Owner request rejected successfully! Notification email has been sent.",
        });
        setRejectionReason("");
        setSelectedRequest(null);
        fetchRequests();
      } else {
        throw new Error(result.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Reject error:', error);
      toast({
        title: "Error",
        description: "Failed to reject owner request",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete owner "${name}"? This will also revert their user role to 'user'.`)) {
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/admin/owners/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Owner deleted successfully",
        });
        fetchRequests();
      } else {
        throw new Error(result.message || 'Failed to delete owner');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete owner",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBusinessTypeLabel = (type: string) => {
    const types = {
      individual: "Individual Car Owner",
      agency: "Car Rental Agency",
      company: "Fleet Company",
      dealership: "Car Dealership"
    };
    return types[type as keyof typeof types] || type;
  };

  const filteredRequests = requests.filter(request =>
    request.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchRequests();
  }, [currentPage, statusFilter]);

  const pendingCount = requests.filter(r => r.verificationStatus === 'pending').length;
  const approvedCount = requests.filter(r => r.verificationStatus === 'approved').length;
  const rejectedCount = requests.filter(r => r.verificationStatus === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{totalRequests}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by business name, owner name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="status" className="text-sm font-medium mb-2 block">Status Filter</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Owner Requests</CardTitle>
          <CardDescription>
            {filteredRequests.length} of {requests.length} requests shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No owner requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Building2 className="w-5 h-5 text-blue-500" />
                          <h3 className="text-lg font-semibold">{request.businessName}</h3>
                          {getStatusBadge(request.verificationStatus)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{request.ownerName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{request.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{request.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{request.city}, {request.state}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{request.totalCars} cars</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{new Date(request.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-1">Business Type:</p>
                          <p className="text-sm">{getBusinessTypeLabel(request.businessType)}</p>
                        </div>

                        {request.carTypes && request.carTypes.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-muted-foreground mb-2">Car Types:</p>
                            <div className="flex flex-wrap gap-1">
                              {request.carTypes.map((type, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {request.rejectionReason && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertCircle className="w-4 h-4 text-red-500" />
                              <span className="text-sm font-medium text-red-700">Rejection Reason:</span>
                            </div>
                            <p className="text-sm text-red-600">{request.rejectionReason}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                            onClick={() => handleDelete(request.id, request.ownerName)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Owner Request Details</DialogTitle>
                              <DialogDescription>
                                Complete information for {selectedRequest?.businessName}
                              </DialogDescription>
                            </DialogHeader>

                            {selectedRequest && (
                              <div className="space-y-6">
                                <Tabs defaultValue="business" className="w-full">
                                  <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="business">Business Info</TabsTrigger>
                                    <TabsTrigger value="contact">Contact & Address</TabsTrigger>
                                    <TabsTrigger value="fleet">Fleet Details</TabsTrigger>
                                  </TabsList>

                                  <TabsContent value="business" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-sm font-medium">Business Type</Label>
                                        <p className="text-sm text-muted-foreground">{getBusinessTypeLabel(selectedRequest.businessType)}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Business Name</Label>
                                        <p className="text-sm text-muted-foreground">{selectedRequest.businessName}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Owner Name</Label>
                                        <p className="text-sm text-muted-foreground">{selectedRequest.ownerName}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Operating Years</Label>
                                        <p className="text-sm text-muted-foreground">{selectedRequest.operatingYears}</p>
                                      </div>
                                    </div>

                                    {selectedRequest.description && (
                                      <div>
                                        <Label className="text-sm font-medium">Description</Label>
                                        <p className="text-sm text-muted-foreground">{selectedRequest.description}</p>
                                      </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                      {selectedRequest.website && (
                                        <div>
                                          <Label className="text-sm font-medium">Website</Label>
                                          <p className="text-sm text-blue-600">{selectedRequest.website}</p>
                                        </div>
                                      )}
                                      {selectedRequest.socialMedia && (
                                        <div>
                                          <Label className="text-sm font-medium">Social Media</Label>
                                          <p className="text-sm text-muted-foreground">{selectedRequest.socialMedia}</p>
                                        </div>
                                      )}
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="contact" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-sm font-medium">Email</Label>
                                        <p className="text-sm text-muted-foreground">{selectedRequest.email}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">Phone</Label>
                                        <p className="text-sm text-muted-foreground">{selectedRequest.phone}</p>
                                      </div>
                                      {selectedRequest.alternatePhone && (
                                        <div className="col-span-2">
                                          <Label className="text-sm font-medium">Alternate Phone</Label>
                                          <p className="text-sm text-muted-foreground">{selectedRequest.alternatePhone}</p>
                                        </div>
                                      )}
                                    </div>

                                    <div>
                                      <Label className="text-sm font-medium">Address</Label>
                                      <p className="text-sm text-muted-foreground">{selectedRequest.address}</p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                      <div>
                                        <Label className="text-sm font-medium">City</Label>
                                        <p className="text-sm text-muted-foreground">{selectedRequest.city}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">State</Label>
                                        <p className="text-sm text-muted-foreground">{selectedRequest.state}</p>
                                      </div>
                                      <div>
                                        <Label className="text-sm font-medium">PIN Code</Label>
                                        <p className="text-sm text-muted-foreground">{selectedRequest.pincode}</p>
                                      </div>
                                    </div>
                                  </TabsContent>

                                  <TabsContent value="fleet" className="space-y-4">
                                    <div>
                                      <Label className="text-sm font-medium">Total Cars</Label>
                                      <p className="text-sm text-muted-foreground">{selectedRequest.totalCars}</p>
                                    </div>

                                    {selectedRequest.carTypes && selectedRequest.carTypes.length > 0 && (
                                      <div>
                                        <Label className="text-sm font-medium">Car Types</Label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {selectedRequest.carTypes.map((type, index) => (
                                            <Badge key={index} variant="secondary">{type}</Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </TabsContent>
                                </Tabs>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>


                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};