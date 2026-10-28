import { useState, useEffect } from "react";
import { getAdminCars } from "@/services/adminService";
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
  Car,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from "lucide-react";

interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  description: string;
  specifications: {
    fuel_type: string;
    transmission: string;
    seats: string;
    mileage: string;
    engine: string;
  };
  price_per_day: number;
  price_per_hour?: number;
  price_per_week?: number;
  price_per_month?: number;
  primary_image: string;
  is_available: boolean;
  is_verified: boolean;
  location: string;
  features: string[];
  owner_name: string;
  created_at: string;
}

export const CarManagement = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const { toast } = useToast();
  // Form state for adding/editing cars
  const [formData, setFormData] = useState({
    name: "",
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
    loadCars();
  }, []);

  // ... (inside component)
  const loadCars = async () => {
    setIsLoading(true);
    try {
      const response = await getAdminCars();
      if (response.success && response.data) {
        setCars(response.data.cars);
      } else {
        toast({
          title: "Error",
          description: "Failed to load cars",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to load cars",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      if (!formData.name || !formData.brand || !formData.model || !formData.price_per_day) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Here you would make the API call to save the car
      console.log("Saving car:", formData);

      toast({
        title: "Success",
        description: editingCar ? "Car updated successfully" : "Car added successfully",
      });

      // Reset form and close dialog
      resetForm();
      setIsAddDialogOpen(false);
      setEditingCar(null);

      // Reload data
      await loadCars();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save car",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
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
  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setFormData({
      name: car.name,
      brand: car.brand,
      model: car.model,
      year: car.year,
      description: car.description,
      price_per_day: car.price_per_day.toString(),
      price_per_hour: car.price_per_hour?.toString() || "",
      price_per_week: car.price_per_week?.toString() || "",
      price_per_month: car.price_per_month?.toString() || "",
      primary_image: car.primary_image,
      location: car.location,
      specifications: car.specifications,
      features: car.features,
      owner_name: car.owner_name
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (carId: string) => {
    if (confirm("Are you sure you want to delete this car?")) {
      try {
        // API call to delete car
        console.log("Deleting car:", carId);

        setCars(prev => prev.filter(car => car.id !== carId));

        toast({
          title: "Success",
          description: "Car deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete car",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleStatus = async (carId: string, currentStatus: boolean) => {
    try {
      // API call to toggle car status
      console.log("Toggling car status:", carId, !currentStatus);

      setCars(prev => prev.map(car =>
        car.id === carId
          ? { ...car, is_available: !currentStatus }
          : car
      ));

      toast({
        title: "Success",
        description: `Car ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update car status",
        variant: "destructive",
      });
    }
  };

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" ||
      (statusFilter === "available" && car.is_available) ||
      (statusFilter === "unavailable" && !car.is_available);
    const matchesBrand = brandFilter === "all" || car.brand === brandFilter;

    return matchesSearch && matchesStatus && matchesBrand;
  });

  const uniqueBrands = Array.from(new Set(cars.map(car => car.brand)));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cars...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Car Management</h2>
          <p className="text-gray-600">Manage your car rental fleet</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Car
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cars</p>
                <p className="text-2xl font-bold">{cars.length}</p>
              </div>
              <Car className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-2xl font-bold">{cars.filter(c => c.is_available).length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rented</p>
                <p className="text-2xl font-bold">{cars.filter(c => !c.is_available).length}</p>
              </div>
              <XCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Brands</p>
                <p className="text-2xl font-bold">{uniqueBrands.length}</p>
              </div>
              <Filter className="h-8 w-8 text-purple-600" />
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
                  placeholder="Search cars..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Rented</SelectItem>
              </SelectContent>
            </Select>
            <Select value={brandFilter} onValueChange={setBrandFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {uniqueBrands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.map((car) => (
          <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={car.primary_image}
                alt={car.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Badge variant={car.is_available ? "default" : "secondary"}>
                  {car.is_available ? "Available" : "Rented"}
                </Badge>
                <Badge variant={car.is_verified ? "default" : "destructive"}>
                  {car.is_verified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Car className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">{car.brand}</span>
              </div>

              <h3 className="font-semibold text-lg mb-1">{car.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{car.model} ({car.year})</p>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{car.description}</p>

              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="flex items-center gap-1">
                  <span className="font-medium">Fuel:</span>
                  <span>{car.specifications.fuel_type}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Seats:</span>
                  <span>{car.specifications.seats}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Transmission:</span>
                  <span>{car.specifications.transmission}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Mileage:</span>
                  <span>{car.specifications.mileage}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-3">
                <div>
                  <span className="text-lg font-bold text-green-600">₹{car.price_per_day}</span>
                  <span className="text-sm text-gray-500">/day</span>
                </div>
                <span className="text-sm text-gray-500">{car.location}</span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(car)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant={car.is_available ? "secondary" : "default"}
                  onClick={() => handleToggleStatus(car.id, car.is_available)}
                >
                  {car.is_available ? <XCircle className="h-4 w-4 mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                  {car.is_available ? "Rent" : "Return"}
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(car.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCars.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cars found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== "all" || brandFilter !== "all"
                ? "Try adjusting your filters"
                : "Get started by adding your first car"}
            </p>
            {!searchTerm && statusFilter === "all" && brandFilter === "all" && (
              <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Car
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Car Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCar ? "Edit Car" : "Add New Car"}</DialogTitle>
            <DialogDescription>
              {editingCar ? "Update car information" : "Add a new car to your fleet"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Car Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Honda City Premium"
                  required
                />
              </div>
              <div>
                <Label htmlFor="brand">Brand *</Label>
                <Select value={formData.brand} onValueChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Honda">Honda</SelectItem>
                    <SelectItem value="Maruti Suzuki">Maruti Suzuki</SelectItem>
                    <SelectItem value="Hyundai">Hyundai</SelectItem>
                    <SelectItem value="Toyota">Toyota</SelectItem>
                    <SelectItem value="Tata">Tata</SelectItem>
                    <SelectItem value="Mahindra">Mahindra</SelectItem>
                    <SelectItem value="Ford">Ford</SelectItem>
                    <SelectItem value="BMW">BMW</SelectItem>
                    <SelectItem value="Mercedes-Benz">Mercedes-Benz</SelectItem>
                    <SelectItem value="Audi">Audi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  min="2000"
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
                placeholder="Describe the car..."
                rows={3}
              />
            </div>

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
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Mumbai, Maharashtra"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="primary_image">Image URL</Label>
              <Input
                id="primary_image"
                value={formData.primary_image}
                onChange={(e) => setFormData(prev => ({ ...prev, primary_image: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCar ? "Update Car" : "Add Car"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};