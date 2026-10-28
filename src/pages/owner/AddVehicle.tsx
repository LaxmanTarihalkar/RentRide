import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";

export default function AddVehicle() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Basic vehicle details
    const [formData, setFormData] = useState({
        name: "",
        brand: "",
        category: "",
        plate_number: "",
        price_per_day: "",
        fuel_type: "",
        transmission: "",
        seats: "",
        location: "", // City/Area
        latitude: "",
        longitude: "",
        description: "",
        features: "", // Comma separated for now
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);

        try {
            // 1. Get Owner ID (for now assuming user is owner or linking via user_id)
            // Ideally we check the 'owners' table.
            // 1. Get Owner ID (for now assuming user is owner or linking via user_id)
            // Ideally we check the 'owners' table.
            let { data: ownerData, error: ownerError } = await supabase
                .from('owners')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (ownerError || !ownerData) {
                // Auto-create owner profile
                const { data: newOwner, error: createError } = await supabase
                    .from('owners')
                    .insert({
                        user_id: user.id,
                        owner_name: (user.user_metadata as any)?.full_name || 'RentRide User',
                        email: user.email,
                        phone: 'Not Provided',
                        business_type: 'individual',
                        business_name: 'Individual Fleet',
                        address: 'Not Provided',
                        city: 'Not Provided',
                        state: 'Not Provided',
                        pincode: '000000',
                        verification_status: 'approved', // Auto-approve for direct access
                        approval_date: new Date().toISOString()
                    })
                    .select('id')
                    .single();

                if (createError) {
                    throw new Error(`Failed to create owner profile: ${createError.message}`);
                }

                // Use the new owner ID
                ownerData = newOwner;
            }

            // 2. Upload Image
            let imageUrl = "";
            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);

                const response = await fetch('http://localhost:3001/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    let errorMessage = 'Image upload failed';
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch (e) {
                        errorMessage = `Upload failed with status ${response.status} (${response.statusText})`;
                    }
                    throw new Error(errorMessage);
                }

                const data = await response.json();
                imageUrl = data.url;
            } else {
                throw new Error("Please select an image for the vehicle");
            }

            // 3. Create Vehicle via Backend API (Bypasses RLS)
            // Get token from localStorage as app uses custom auth flow
            const token = localStorage.getItem('auth_token');

            if (!token) throw new Error("No authentication token found");

            const vehiclePayload = {
                name: formData.name, // Model Name
                brand: formData.brand,
                model: formData.name,
                category_name: formData.category, // Backend will resolve ID
                license_plate: formData.plate_number,
                year: 2025,
                price_per_day: formData.price_per_day,
                location: formData.location,
                city: formData.location,
                description: formData.description,
                specifications: {
                    latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                    longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                    fuel_type: formData.fuel_type,
                    transmission: formData.transmission,
                    seats: parseInt(formData.seats)
                },
                primary_image: imageUrl,
                features: formData.features.split(',').map(f => f.trim()).filter(Boolean),
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            };

            const createResponse = await fetch('http://localhost:3001/api/vehicles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(vehiclePayload)
            });

            if (!createResponse.ok) {
                const errorData = await createResponse.json();
                throw new Error(errorData.message || "Failed to create vehicle via server");
            }

            // Success
            const { data: vehicle } = await createResponse.json();

            toast({
                title: "Vehicle Added",
                description: "Your vehicle has been successfully listed.",
            });

            navigate('/owner/vehicles');

        } catch (error: any) {
            console.error('Add vehicle error:', error);
            toast({
                title: "Error",
                description: error.message || "Failed to add vehicle",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">List a New Vehicle</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Vehicle Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="brand">Brand / Make</Label>
                                <Input
                                    id="brand"
                                    placeholder="Toyota, Hyundai, etc."
                                    value={formData.brand}
                                    onChange={(e) => handleChange('brand', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Model Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Fortuner, City, etc."
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select onValueChange={(val) => handleChange('category', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SUV">SUV</SelectItem>
                                        <SelectItem value="Sedan">Sedan</SelectItem>
                                        <SelectItem value="Hatchback">Hatchback</SelectItem>
                                        <SelectItem value="Luxury">Luxury</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="plate">Plate Number</Label>
                                <Input
                                    id="plate"
                                    placeholder="MH 01 AB 1234"
                                    value={formData.plate_number}
                                    onChange={(e) => handleChange('plate_number', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fuel">Fuel Type</Label>
                                <Select onValueChange={(val) => handleChange('fuel_type', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Fuel" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Petrol">Petrol</SelectItem>
                                        <SelectItem value="Diesel">Diesel</SelectItem>
                                        <SelectItem value="Electric">Electric</SelectItem>
                                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="transmission">Transmission</Label>
                                <Select onValueChange={(val) => handleChange('transmission', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Automatic">Automatic</SelectItem>
                                        <SelectItem value="Manual">Manual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="seats">Seats</Label>
                                <Input
                                    id="seats"
                                    type="number"
                                    placeholder="4, 5, 7..."
                                    value={formData.seats}
                                    onChange={(e) => handleChange('seats', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price per Day (₹)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    placeholder="2000"
                                    value={formData.price_per_day}
                                    onChange={(e) => handleChange('price_per_day', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Location (City)</Label>
                                <Input
                                    id="location"
                                    placeholder="Mumbai, Bangalore..."
                                    value={formData.location}
                                    onChange={(e) => handleChange('location', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input
                                    id="latitude"
                                    placeholder="19.0760"
                                    value={formData.latitude}
                                    onChange={(e) => handleChange('latitude', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input
                                    id="longitude"
                                    placeholder="72.8777"
                                    value={formData.longitude}
                                    onChange={(e) => handleChange('longitude', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="features">Features (comma separated)</Label>
                            <Input
                                id="features"
                                placeholder="Bluetooth, Sunroof, 360 Camera, GPS"
                                value={formData.features}
                                onChange={(e) => handleChange('features', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Vehicle Image</Label>
                            <div className="flex items-center gap-4">
                                <Input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setImageFile(file);
                                    }}
                                    required
                                />
                                {imageFile && (
                                    <span className="text-sm text-green-600 flex items-center">
                                        <Upload className="w-4 h-4 mr-1" /> Selected
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Tell us about the car's condition, history, etc."
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows={4}
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/owner/vehicles')}>Cancel</Button>
                            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                                    </>
                                ) : (
                                    "Add Vehicle"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
