import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Car,
  Calendar,
  FileText
} from "lucide-react";

interface Dispute {
  id: string;
  dispute_id: string;
  booking_id: string;
  customer_name: string;
  customer_email: string;
  vehicle_name: string;
  dispute_type: 'damage' | 'billing' | 'service' | 'refund' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  subject: string;
  description: string;
  amount_disputed?: number;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  resolution?: string;
  attachments?: string[];
}

export const DisputeManagement = () => {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [resolution, setResolution] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadDisputes();
  }, []);

  const loadDisputes = async () => {
    setIsLoading(true);
    try {
      // Mock data for now - replace with actual API call
      const mockDisputes: Dispute[] = [
        {
          id: "1",
          dispute_id: "DSP001",
          booking_id: "BK001",
          customer_name: "John Doe",
          customer_email: "john.doe@example.com",
          vehicle_name: "Honda City Premium",
          dispute_type: 'damage',
          priority: 'high',
          status: 'open',
          subject: "Vehicle damage claim",
          description: "The car had a scratch on the rear bumper when I picked it up, but I was charged for damage. I have photos to prove this.",
          amount_disputed: 5000,
          created_at: "2024-01-20T10:00:00Z",
          updated_at: "2024-01-20T10:00:00Z",
          attachments: ["photo1.jpg", "photo2.jpg"]
        },
        {
          id: "2",
          dispute_id: "DSP002",
          booking_id: "BK003",
          customer_name: "Jane Smith",
          customer_email: "jane.smith@example.com",
          vehicle_name: "Royal Enfield Classic 350",
          dispute_type: 'billing',
          priority: 'medium',
          status: 'in_progress',
          subject: "Incorrect billing amount",
          description: "I was charged extra for fuel, but I returned the bike with the same fuel level as when I picked it up.",
          amount_disputed: 800,
          created_at: "2024-01-18T14:30:00Z",
          updated_at: "2024-01-19T09:15:00Z",
          assigned_to: "Admin User"
        },
        {
          id: "3",
          dispute_id: "DSP003",
          booking_id: "BK005",
          customer_name: "Mike Wilson",
          customer_email: "mike.wilson@example.com",
          vehicle_name: "Mahindra Thar 4x4",
          dispute_type: 'service',
          priority: 'urgent',
          status: 'open',
          subject: "Poor vehicle condition",
          description: "The vehicle was not cleaned properly and had mechanical issues during the trip. This ruined our vacation experience.",
          created_at: "2024-01-19T16:45:00Z",
          updated_at: "2024-01-19T16:45:00Z"
        },
        {
          id: "4",
          dispute_id: "DSP004",
          booking_id: "BK007",
          customer_name: "Sarah Johnson",
          customer_email: "sarah.johnson@example.com",
          vehicle_name: "Toyota Innova",
          dispute_type: 'refund',
          priority: 'low',
          status: 'resolved',
          subject: "Refund request for cancelled booking",
          description: "I had to cancel my booking due to emergency, but the refund policy was not clearly explained.",
          amount_disputed: 2000,
          created_at: "2024-01-15T11:20:00Z",
          updated_at: "2024-01-17T14:30:00Z",
          assigned_to: "Admin User",
          resolution: "Partial refund of ₹1,500 processed as per cancellation policy. Customer satisfied with resolution."
        },
        {
          id: "5",
          dispute_id: "DSP005",
          booking_id: "BK009",
          customer_name: "Alex Brown",
          customer_email: "alex.brown@example.com",
          vehicle_name: "Honda Activa",
          dispute_type: 'other',
          priority: 'medium',
          status: 'closed',
          subject: "Booking modification issue",
          description: "Unable to modify booking dates through the app. Customer service was not responsive.",
          created_at: "2024-01-12T09:15:00Z",
          updated_at: "2024-01-14T16:00:00Z",
          assigned_to: "Admin User",
          resolution: "Booking modification completed manually. App issue has been reported to development team."
        }
      ];
      
      setDisputes(mockDisputes);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load disputes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDispute = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setResolution(dispute.resolution || "");
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = async (disputeId: string, newStatus: string) => {
    try {
      // API call would go here
      console.log(`Updating dispute ${disputeId} status to ${newStatus}`);
      
      setDisputes(prev => prev.map(dispute => 
        dispute.id === disputeId 
          ? { ...dispute, status: newStatus as any, updated_at: new Date().toISOString() }
          : dispute
      ));
      
      toast({
        title: "Success",
        description: `Dispute status updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update dispute status",
        variant: "destructive",
      });
    }
  };

  const handleSaveResolution = async () => {
    if (!selectedDispute || !resolution.trim()) {
      toast({
        title: "Error",
        description: "Please enter a resolution",
        variant: "destructive",
      });
      return;
    }

    try {
      // API call would go here
      console.log(`Saving resolution for dispute ${selectedDispute.id}:`, resolution);
      
      setDisputes(prev => prev.map(dispute => 
        dispute.id === selectedDispute.id 
          ? { 
              ...dispute, 
              resolution, 
              status: 'resolved' as any,
              updated_at: new Date().toISOString(),
              assigned_to: 'Admin User'
            }
          : dispute
      ));
      
      toast({
        title: "Success",
        description: "Resolution saved successfully",
      });
      
      setIsViewDialogOpen(false);
      setResolution("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save resolution",
        variant: "destructive",
      });
    }
  };

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = 
      dispute.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.dispute_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || dispute.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || dispute.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-red-100 text-red-800">Open</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge className="bg-red-500 text-white">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'damage':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'billing':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'service':
        return <Car className="h-4 w-4 text-purple-500" />;
      case 'refund':
        return <XCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
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
          <p className="text-gray-600">Loading disputes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dispute Management</h2>
          <p className="text-gray-600">Handle customer disputes and complaints</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Disputes</p>
                <p className="text-2xl font-bold">{disputes.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-bold">{disputes.filter(d => d.status === 'open').length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{disputes.filter(d => d.status === 'in_progress').length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold">{disputes.filter(d => d.status === 'resolved' || d.status === 'closed').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
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
                  placeholder="Search disputes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Disputes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Disputes ({filteredDisputes.length})</CardTitle>
          <CardDescription>Manage customer disputes and complaints</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispute ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDisputes.map((dispute) => (
                <TableRow key={dispute.id}>
                  <TableCell>
                    <div className="font-medium">{dispute.dispute_id}</div>
                    <div className="text-sm text-gray-500">Booking: {dispute.booking_id}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{dispute.customer_name}</p>
                        <p className="text-sm text-gray-500">{dispute.customer_email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(dispute.dispute_type)}
                      <span className="capitalize">{dispute.dispute_type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{dispute.subject}</p>
                      <p className="text-sm text-gray-500">{dispute.vehicle_name}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(dispute.priority)}</TableCell>
                  <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                  <TableCell>{formatDate(dispute.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDispute(dispute)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {dispute.status === 'open' && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleUpdateStatus(dispute.id, 'in_progress')}
                        >
                          Start
                        </Button>
                      )}
                      {dispute.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUpdateStatus(dispute.id, 'resolved')}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredDisputes.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No disputes found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No disputes have been reported"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dispute Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dispute Details - {selectedDispute?.dispute_id}</DialogTitle>
            <DialogDescription>
              View and manage dispute information
            </DialogDescription>
          </DialogHeader>
          
          {selectedDispute && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Dispute Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Dispute ID</Label>
                      <p className="text-lg font-medium">{selectedDispute.dispute_id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Type</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {getTypeIcon(selectedDispute.dispute_type)}
                        <span className="capitalize">{selectedDispute.dispute_type}</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Priority</Label>
                      <div className="mt-1">{getPriorityBadge(selectedDispute.priority)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Status</Label>
                      <div className="mt-1">{getStatusBadge(selectedDispute.status)}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Customer & Booking</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Customer</Label>
                      <p className="font-medium">{selectedDispute.customer_name}</p>
                      <p className="text-sm text-gray-500">{selectedDispute.customer_email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Booking ID</Label>
                      <p>{selectedDispute.booking_id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Vehicle</Label>
                      <p>{selectedDispute.vehicle_name}</p>
                    </div>
                    {selectedDispute.amount_disputed && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Disputed Amount</Label>
                        <p className="text-lg font-bold text-red-600">₹{selectedDispute.amount_disputed.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Dispute Details</h3>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Subject</Label>
                    <p className="font-medium">{selectedDispute.subject}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Description</Label>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedDispute.description}</p>
                  </div>
                  {selectedDispute.attachments && selectedDispute.attachments.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Attachments</Label>
                      <div className="flex gap-2 mt-1">
                        {selectedDispute.attachments.map((attachment, index) => (
                          <Badge key={index} variant="outline">{attachment}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Resolution</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="resolution">Resolution Notes</Label>
                    <Textarea
                      id="resolution"
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Enter resolution details..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  {selectedDispute.resolution && (
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Previous Resolution</Label>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded mt-1">{selectedDispute.resolution}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-500">
                  <p>Created: {formatDate(selectedDispute.created_at)}</p>
                  <p>Updated: {formatDate(selectedDispute.updated_at)}</p>
                  {selectedDispute.assigned_to && (
                    <p>Assigned to: {selectedDispute.assigned_to}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                    Close
                  </Button>
                  {selectedDispute.status !== 'resolved' && selectedDispute.status !== 'closed' && (
                    <Button onClick={handleSaveResolution}>
                      Save Resolution
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};