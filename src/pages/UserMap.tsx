import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, MapPin, Navigation } from "lucide-react";

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Vehicle {
    id: string;
    name: string;
    brand: string;
    model: string;
    latitude: number;
    longitude: number;
    primary_image: string;
    price_per_day: number;
    location: string;
    is_available: boolean;
    specifications: any;
}

const UserMap = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vehicles/public`);
            const data = await response.json();

            if (data.success) {
                // Filter out vehicles without valid coordinates
                const mapVehicles = data.data.filter((v: any) => v.latitude && v.longitude);
                setVehicles(mapVehicles);
            }
        } catch (error) {
            console.error("Error fetching vehicles for map:", error);
        } finally {
            setLoading(false);
        }
    };

    const defaultCenter = { lat: 19.0760, lng: 72.8777 }; // Mumbai default

    return (
        <div className="h-[calc(100vh-8rem)] w-full rounded-xl overflow-hidden border shadow-sm relative">
            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <MapContainer
                    center={[defaultCenter.lat, defaultCenter.lng]}
                    zoom={11}
                    style={{ height: "100%", width: "100%" }}
                    className="z-10"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {vehicles.map((vehicle) => (
                        <Marker key={vehicle.id} position={[vehicle.latitude, vehicle.longitude]}>
                            <Popup className="min-w-[250px]">
                                <div className="p-2">
                                    <div className="relative mb-3">
                                        <img
                                            src={vehicle.primary_image}
                                            alt={vehicle.name}
                                            className="w-full h-32 object-cover rounded-md"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=300&h=200';
                                            }}
                                        />
                                        <Badge className="absolute top-2 left-2 bg-white/90 text-black hover:bg-white">{vehicle.is_available ? 'Available' : 'Booked'}</Badge>
                                    </div>

                                    <h3 className="font-bold text-lg mb-1">{vehicle.brand} {vehicle.model}</h3>
                                    <div className="flex items-center text-gray-500 text-xs mb-2">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        <span className="truncate max-w-[200px]">{vehicle.location}</span>
                                    </div>

                                    <div className="flex justify-between items-center mt-3">
                                        <span className="font-bold text-primary">₹{vehicle.price_per_day}/day</span>
                                        <Button size="sm" onClick={() => navigate('/cars')}>
                                            Book Now
                                        </Button>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            )}

            <div className="absolute top-4 right-4 z-[500] bg-white p-3 rounded-lg shadow-lg max-w-xs hidden md:block">
                <h4 className="font-bold text-sm mb-1">Vehicle Map</h4>
                <p className="text-xs text-muted-foreground mb-2">
                    Viewing {vehicles.length} available vehicles in your area.
                </p>
                <div className="flex items-center gap-2 text-xs">
                    <span className="w-3 h-3 rounded-full bg-blue-500 block"></span>
                    <span>Available Vehicles</span>
                </div>
            </div>
        </div>
    );
};

export default UserMap;
