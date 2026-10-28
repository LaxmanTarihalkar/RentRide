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
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Car,
  Truck,
  Bike,
  Ship,
  Home,
  Mountain,
  CheckCircle,
  XCircle,
  Upload,
  Search,
  Filter
} from "lucide-react";
import {
  getVehicleCategories,
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  toggleVehicleAvailability,
  type Vehicle,
  type VehicleCategory,
  type CreateVehicleData
} from "@/services/vehicleService";

const vehicleIcons = {
  car: Car,
  truck: Truck,
  bike: Bike,
  bicycle: Bike,
  van: Truck,
  bus: Truck,
  ship: Ship,
  home: Home,
  mountain: Mountain,
};

export const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const { toast } = useToast();

  // Form state for adding/editing vehicles
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    description: "",
    price_per_day: "",
    price_per_hour: "",
    price_per_week: "",
    price_per_month: "",
    primary_image: "",
    location: "",
    specifications: {
      fuel_type: "",
      transmission: "",
      seats: "",
      engine: "",
      mileage: ""
    },
    features: [] as string[],
    owner_name: "RentRide Fleet"
  });

  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Reload vehicles when filters change
    if (categories.length > 0) {
      loadVehicles();
    }
  }, [searchTerm, selectedCategory, selectedStatus]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load categories and vehicles
      await Promise.all([loadCategories(), loadVehicles()]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await getVehicleCategories();
      if (result.success) {
        setCategories(result.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load vehicle categories",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      const result = await getVehicles({
        search: searchTerm,
        category: selectedCategory === "all" ? undefined : selectedCategory,
        status: selectedStatus === "all" ? undefined : selectedStatus
      });
      
      if (result.success && result.data) {
        setVehicles(result.data.vehicles || []);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to load vehicles",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      toast({
        title: "Error",
        description: "Failed to load vehicles",
        variant: "destructive",
      });
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!formData.name || !formData.category_id || !formData.brand || !formData.model || !formData.price_per_day) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const vehicleData: CreateVehicleData = {
        name: formData.name,
        category_id: formData.category_id,
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        description: formData.description,
        specifications: formData.specifications,
        price_per_day: parseFloat(formData.price_per_day),
        price_per_hour: formData.price_per_hour ? parseFloat(formData.price_per_hour) : undefined,
        price_per_week: formData.price_per_week ? parseFloat(formData.price_per_week) : undefined,
        price_per_month: formData.price_per_month ? parseFloat(formData.price_per_month) : undefined,
        primary_image: formData.primary_image,
        location: formData.location,
        features: formData.features,
        owner_name: formData.owner_name
      };

      let result;
      if (editingVehicle) {
        result = await updateVehicle(editingVehicle.id, vehicleData);
      } else {
        result = await createVehicle(vehicleData);
      }

      if (result.success) {
        toast({
          title: "Success",
          description: editingVehicle ? "Vehicle updated successfully" : "Vehicle added successfully",
        });

        // Reset form and close dialog
        resetForm();
        setIsAddDialogOpen(false);
        setEditingVehicle(null);
        
        // Reload data
        await loadVehicles();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save vehicle",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save vehicle",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category_id: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      description: "",
      price_per_day: "",
      price_per_hour: "",
      price_per_week: "",
      price_per_month: "",
      primary_image: "",
      location: "",
      specifications: {
        fuel_type: "",
        transmission: "",
        seats: "",
        engine: "",
        mileage: ""
      },
      features: [],
      owner_name: "RentRide Fleet"
    });
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      category_id: categories.find(c => c.name === vehicle.category_name)?.id || "",
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      description: vehicle.description,
      price_per_day: vehicle.price_per_day.toString(),
      price_per_hour: vehicle.price_per_hour?.toString() || "",
      price_per_week: vehicle.price_per_week?.toString() || "",
      price_per_month: vehicle.price_per_month?.toString() || "",
      primary_image: vehicle.primary_image,
      location: vehicle.location,
      specifications: vehicle.specifications,
      features: vehicle.features,
      owner_name: vehicle.owner_name
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (vehicleId: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      try {
        const result = await deleteVehicle(vehicleId);
        
        if (result.success) {
          toast({
            title: "Success",
            description: "Vehicle deleted successfully",
          });
          
          await loadVehicles();
        } else {
          toast({
            title: "Error",
            description: result.message || "Failed to delete vehicle",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete vehicle",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleStatus = async (vehicleId: string, currentStatus: boolean) => {
    try {
      const result = await toggleVehicleAvailability(vehicleId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Vehicle ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
        });
        
        await loadVehicles();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update vehicle status",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vehicle status",
        variant: "destructive",
      });
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || vehicle.category_name === selectedCategory;
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "available" && vehicle.is_available) ||
                         (selectedStatus === "unavailable" && !vehicle.is_available) ||
                         (selectedStatus === "verified" && vehicle.is_verified) ||
                         (selectedStatus === "unverified" && !vehicle.is_verified);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Vehicle Management</h2>
          <p className="text-gray-600">Manage all vehicles in your fleet</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</DialogTitle>
              <DialogDescription>
                {editingVehicle ? "Update vehicle information" : "Add a new vehicle to your fleet"}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="pricing">Pricing</TabsTrigger>
                  <TabsTrigger value="specs">Specifications</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Vehicle Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Honda City Premium"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category_id} onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="brand">Brand *</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                        placeholder="e.g., Honda"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                        placeholder="e.g., City"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                        min="1990"
                        max={new Date().getFullYear() + 1}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the vehicle..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primary_image">Primary Image URL</Label>
                      <Input
                        id="primary_image"
                        value={formData.primary_image}
                        onChange={(e) => setFormData(prev => ({ ...prev, primary_image: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g., Mumbai, Maharashtra"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="pricing" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price_per_day">Price per Day (₹) *</Label>
                      <Input
                        id="price_per_day"
                        type="number"
                        value={formData.price_per_day}
                        onChange={(e) => setFormData(prev => ({ ...prev, price_per_day: e.target.value }))}
                        placeholder="2500"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price_per_hour">Price per Hour (₹)</Label>
                      <Input
                        id="price_per_hour"
                        type="number"
                        value={formData.price_per_hour}
                        onChange={(e) => setFormData(prev => ({ ...prev, price_per_hour: e.target.value }))}
                        placeholder="300"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price_per_week">Price per Week (₹)</Label>
                      <Input
                        id="price_per_week"
                        type="number"
                        value={formData.price_per_week}
                        onChange={(e) => setFormData(prev => ({ ...prev, price_per_week: e.target.value }))}
                        placeholder="15000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price_per_month">Price per Month (₹)</Label>
                      <Input
                        id="price_per_month"
                        type="number"
                        value={formData.price_per_month}
                        onChange={(e) => setFormData(prev => ({ ...prev, price_per_month: e.target.value }))}
                        placeholder="50000"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="specs" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fuel_type">Fuel Type</Label>
                      <Select 
                        value={formData.specifications.fuel_type} 
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          specifications: { ...prev.specifications, fuel_type: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select fuel type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Petrol">Petrol</SelectItem>
                          <SelectItem value="Diesel">Diesel</SelectItem>
                          <SelectItem value="Electric">Electric</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                          <SelectItem value="CNG">CNG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="transmission">Transmission</Label>
                      <Select 
                        value={formData.specifications.transmission} 
                        onValueChange={(value) => setFormData(prev => ({ 
                          ...prev, 
                          specifications: { ...prev.specifications, transmission: value }
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select transmission" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Manual">Manual</SelectItem>
                          <SelectItem value="Automatic">Automatic</SelectItem>
                          <SelectItem value="CVT">CVT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="seats">Seats</Label>
                      <Input
                        id="seats"
                        value={formData.specifications.seats}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          specifications: { ...prev.specifications, seats: e.target.value }
                        }))}
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="engine">Engine</Label>
                      <Input
                        id="engine"
                        value={formData.specifications.engine}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          specifications: { ...prev.specifications, engine: e.target.value }
                        }))}
                        placeholder="1.5L i-VTEC"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mileage">Mileage</Label>
                      <Input
                        id="mileage"
                        value={formData.specifications.mileage}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          specifications: { ...prev.specifications, mileage: e.target.value }
                        }))}
                        placeholder="17 kmpl"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="features" className="space-y-4">
                  <div>
                    <Label>Add Features</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Enter a feature"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                      />
                      <Button type="button" onClick={handleAddFeature}>Add</Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Current Features</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveFeature(feature)}>
                          {feature} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingVehicle ? "Update Vehicle" : "Add Vehicle"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => {
          const IconComponent = vehicleIcons[vehicle.category_name.toLowerCase() as keyof typeof vehicleIcons] || Car;
          
          return (
            <Card key={vehicle.id} className="overflow-hidden">
              <div className="relative">
                <img
                  src={vehicle.primary_image}
                  alt={vehicle.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge variant={vehicle.is_available ? "default" : "secondary"}>
                    {vehicle.is_available ? "Available" : "Unavailable"}
                  </Badge>
                  <Badge variant={vehicle.is_verified ? "default" : "destructive"}>
                    {vehicle.is_verified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <IconComponent className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">{vehicle.category_name}</span>
                </div>
                
                <h3 className="font-semibold text-lg mb-1">{vehicle.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{vehicle.description}</p>
                
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="text-lg font-bold text-green-600">₹{vehicle.price_per_day}</span>
                    <span className="text-sm text-gray-500">/day</span>
                  </div>
                  <span className="text-sm text-gray-500">{vehicle.location}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(vehicle)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant={vehicle.is_available ? "secondary" : "default"}
                    onClick={() => handleToggleStatus(vehicle.id, vehicle.is_available)}
                  >
                    {vehicle.is_available ? <XCircle className="h-4 w-4 mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                    {vehicle.is_available ? "Disable" : "Enable"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(vehicle.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredVehicles.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory !== "all" || selectedStatus !== "all"
                ? "Try adjusting your filters"
                : "Get started by adding your first vehicle"}
            </p>
            {!searchTerm && selectedCategory === "all" && selectedStatus === "all" && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};