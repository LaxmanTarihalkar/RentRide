import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Car, Edit, Trash2, MapPin, Fuel, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
    id: string;
    name: string;
    brand: string;
    plate_number: string;
    price_per_day: number;
    status: string;
    image_url: string;
    location: string;
    fuel_type: string;
    seats: number;
}

export default function MyVehicles() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetchVehicles();
    }, [user]);

    const fetchVehicles = async () => {
        try {
            // Get owner ID
            const { data: ownerData } = await supabase
                .from('owners')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (ownerData) {
                const { data, error } = await supabase
                    .from('vehicles')
                    .select('*')
                    .eq('owner_id', ownerData.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setVehicles(data || []);
            }
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this vehicle?")) return;

        try {
            const { error } = await supabase
                .from('vehicles')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setVehicles(prev => prev.filter(v => v.id !== id));
            toast({ title: "Vehicle deleted" });
        } catch (error) {
            toast({ title: "Error deleting vehicle", variant: "destructive" });
        }
    };

    if (loading) return <div className="p-8 text-center">Loading vehicles...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">My Fleet</h1>
                    <p className="text-muted-foreground">Manage your vehicles and their availability</p>
                </div>
                <Button onClick={() => navigate('/owner/add-vehicle')} className="bg-indigo-600 hover:bg-indigo-700">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Vehicle
                </Button>
            </div>

            {vehicles.length === 0 ? (
                <Card className="text-center py-12 border-dashed">
                    <CardContent>
                        <Car className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium">No vehicles found</h3>
                        <p className="text-muted-foreground mb-6">Start building your fleet by adding your first car.</p>
                        <Button onClick={() => navigate('/owner/add-vehicle')}>
                            Add First Vehicle
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles.map((vehicle) => (
                        <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-all group">
                            <div className="aspect-video bg-gray-100 relative">
                                {vehicle.primary_image ? (
                                    <img src={vehicle.primary_image} alt={vehicle.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                        <Car className="h-12 w-12 text-gray-400" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 px-2 py-1 rounded bg-white/90 text-xs font-bold uppercase tracking-wider">
                                    {vehicle.status}
                                </div>
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex justify-between items-start">
                                    <span>{vehicle.brand} {vehicle.name}</span>
                                    <span className="text-lg font-bold text-indigo-600">₹{vehicle.price_per_day}/day</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-gray-600 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="bg-gray-100 p-1 rounded"><Fuel className="h-3 w-3" /></div>
                                    <span>{vehicle.fuel_type}</span>
                                    <span className="text-gray-300">|</span>
                                    <div className="bg-gray-100 p-1 rounded"><Users className="h-3 w-3" /></div>
                                    <span>{vehicle.seats} Seats</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3 text-gray-400" />
                                    <span className="truncate">{vehicle.location}</span>
                                </div>
                                <div className="text-xs text-gray-400 pt-2 border-t mt-2">
                                    Plate: {vehicle.plate_number}
                                </div>
                            </CardContent>
                            <CardFooter className="grid grid-cols-2 gap-2 bg-gray-50/50 p-4">
                                <Button variant="outline" size="sm" className="w-full">
                                    <Edit className="h-4 w-4 mr-2" /> Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDelete(vehicle.id)}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
