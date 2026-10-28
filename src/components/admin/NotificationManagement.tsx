import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Send,
  Plus,
  Bell,
  Mail,
  MessageSquare,
  Users,
  User,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  target: 'all_users' | 'customers' | 'owners' | 'specific';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipients_count: number;
  sent_count?: number;
  failed_count?: number;
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
  created_by: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'email' | 'sms' | 'push';
  category: 'booking' | 'payment' | 'promotion' | 'system' | 'reminder';
}

export const NotificationManagement = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "email" as 'email' | 'sms' | 'push' | 'in_app',
    target: "all_users" as 'all_users' | 'customers' | 'owners' | 'specific',
    scheduled_at: "",
    send_immediately: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Mock data for notifications
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "New Year Special Offer",
          message: "Get 20% off on all bookings this New Year! Use code NEWYEAR2024",
          type: 'email',
          target: 'all_users',
          status: 'sent',
          recipients_count: 156,
          sent_count: 152,
          failed_count: 4,
          sent_at: "2024-01-01T10:00:00Z",
          created_at: "2023-12-30T14:00:00Z",
          created_by: "Admin User"
        },
        {
          id: "2",
          title: "Booking Reminder",
          message: "Your booking starts tomorrow. Please ensure you have all required documents.",
          type: 'sms',
          target: 'customers',
          status: 'sent',
          recipients_count: 23,
          sent_count: 23,
          failed_count: 0,
          sent_at: "2024-01-20T18:00:00Z",
          created_at: "2024-01-20T17:45:00Z",
          created_by: "System"
        },
        {
          id: "3",
          title: "System Maintenance Notice",
          message: "Our system will be under maintenance on Jan 25th from 2 AM to 4 AM. Services may be temporarily unavailable.",
          type: 'push',
          target: 'all_users',
          status: 'scheduled',
          recipients_count: 156,
          scheduled_at: "2024-01-24T20:00:00Z",
          created_at: "2024-01-20T12:00:00Z",
          created_by: "Admin User"
        },
        {
          id: "4",
          title: "Payment Reminder",
          message: "You have a pending payment of ₹2,500 for your recent booking. Please complete the payment.",
          type: 'email',
          target: 'specific',
          status: 'draft',
          recipients_count: 5,
          created_at: "2024-01-21T09:30:00Z",
          created_by: "Admin User"
        }
      ];

      // Mock data for templates
      const mockTemplates: NotificationTemplate[] = [
        {
          id: "1",
          name: "Booking Confirmation",
          subject: "Booking Confirmed - {{vehicle_name}}",
          content: "Your booking for {{vehicle_name}} has been confirmed. Pickup date: {{pickup_date}}",
          type: 'email',
          category: 'booking'
        },
        {
          id: "2",
          name: "Payment Reminder",
          subject: "Payment Due - {{amount}}",
          content: "You have a pending payment of {{amount}} for booking {{booking_id}}",
          type: 'sms',
          category: 'payment'
        },
        {
          id: "3",
          name: "Promotional Offer",
          subject: "Special Offer - {{discount}}% Off",
          content: "Limited time offer! Get {{discount}}% off on your next booking. Use code: {{promo_code}}",
          type: 'email',
          category: 'promotion'
        }
      ];

      setNotifications(mockNotifications);
      setTemplates(mockTemplates);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendNotification = async () => {
    try {
      if (!formData.title || !formData.message) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // API call would go here
      console.log("Sending notification:", formData);

      const newNotification: Notification = {
        id: Date.now().toString(),
        title: formData.title,
        message: formData.message,
        type: formData.type,
        target: formData.target,
        status: formData.send_immediately ? 'sent' : 'scheduled',
        recipients_count: formData.target === 'all_users' ? 156 : formData.target === 'customers' ? 89 : 45,
        sent_count: formData.send_immediately ? (formData.target === 'all_users' ? 152 : formData.target === 'customers' ? 87 : 44) : undefined,
        failed_count: formData.send_immediately ? 4 : undefined,
        scheduled_at: formData.send_immediately ? undefined : formData.scheduled_at,
        sent_at: formData.send_immediately ? new Date().toISOString() : undefined,
        created_at: new Date().toISOString(),
        created_by: "Admin User"
      };

      setNotifications(prev => [newNotification, ...prev]);

      toast({
        title: "Success",
        description: formData.send_immediately ? "Notification sent successfully" : "Notification scheduled successfully",
      });

      // Reset form
      setFormData({
        title: "",
        message: "",
        type: "email",
        target: "all_users",
        scheduled_at: "",
        send_immediately: true
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter;
    const matchesType = typeFilter === "all" || notification.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-100 text-green-800">Sent</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'push':
        return <Bell className="h-4 w-4 text-purple-500" />;
      case 'in_app':
        return <Bell className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
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
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notification Management</h2>
          <p className="text-gray-600">Send notifications and manage communication</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
              <DialogDescription>
                Send notifications to users via email, SMS, or push notifications
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Notification Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                      <SelectItem value="in_app">In-App Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="target">Target Audience</Label>
                  <Select value={formData.target} onValueChange={(value: any) => setFormData(prev => ({ ...prev, target: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_users">All Users</SelectItem>
                      <SelectItem value="customers">Customers Only</SelectItem>
                      <SelectItem value="owners">Owners Only</SelectItem>
                      <SelectItem value="specific">Specific Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter notification title"
                />
              </div>
              
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter notification message"
                  rows={4}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="send_immediately"
                  checked={formData.send_immediately}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, send_immediately: checked as boolean }))}
                />
                <Label htmlFor="send_immediately">Send immediately</Label>
              </div>
              
              {!formData.send_immediately && (
                <div>
                  <Label htmlFor="scheduled_at">Schedule Date & Time</Label>
                  <Input
                    id="scheduled_at"
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                  />
                </div>
              )}
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendNotification}>
                  <Send className="h-4 w-4 mr-2" />
                  {formData.send_immediately ? "Send Now" : "Schedule"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-2xl font-bold">{notifications.filter(n => n.status === 'sent').length}</p>
              </div>
              <Send className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold">{notifications.filter(n => n.status === 'scheduled').length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Drafts</p>
                <p className="text-2xl font-bold">{notifications.filter(n => n.status === 'draft').length}</p>
              </div>
              <Edit className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Recipients</p>
                <p className="text-2xl font-bold">{notifications.reduce((sum, n) => sum + (n.sent_count || 0), 0)}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search notifications..."
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
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="push">Push</SelectItem>
                    <SelectItem value="in_app">In-App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Notifications ({filteredNotifications.length})</CardTitle>
              <CardDescription>Manage all sent and scheduled notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{notification.message}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(notification.type)}
                          <span className="capitalize">{notification.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize">{notification.target.replace('_', ' ')}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{notification.recipients_count}</p>
                          {notification.sent_count !== undefined && (
                            <p className="text-sm text-gray-500">
                              {notification.sent_count} sent
                              {notification.failed_count && notification.failed_count > 0 && (
                                <span className="text-red-500">, {notification.failed_count} failed</span>
                              )}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(notification.status)}</TableCell>
                      <TableCell>
                        <div>
                          {notification.sent_at && (
                            <p className="text-sm">Sent: {formatDate(notification.sent_at)}</p>
                          )}
                          {notification.scheduled_at && (
                            <p className="text-sm">Scheduled: {formatDate(notification.scheduled_at)}</p>
                          )}
                          <p className="text-xs text-gray-500">Created: {formatDate(notification.created_at)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {notification.status === 'draft' && (
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredNotifications.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                  <p className="text-gray-500">
                    {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                      ? "Try adjusting your filters"
                      : "No notifications have been created yet"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
              <CardDescription>Pre-built templates for common notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <Card key={template.id} className="border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        {getTypeIcon(template.type)}
                        <Badge variant="outline" className="capitalize">{template.category}</Badge>
                      </div>
                      <h3 className="font-semibold mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{template.content}</p>
                      <Button size="sm" variant="outline" className="w-full mt-4">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};