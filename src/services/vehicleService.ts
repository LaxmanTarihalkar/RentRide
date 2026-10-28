const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

export interface VehicleCategory {
    id: string;
    name: string;
    description: string;
    icon: string;
}

export interface Vehicle {
    id: string;
    name: string;
    category_id: string;
    category_name: string;
    brand: string;
    model: string;
    year: number;
    description: string;
    specifications: Record<string, any>;
    price_per_day: number;
    price_per_hour?: number;
    price_per_week?: number;
    price_per_month?: number;
    primary_image: string;
    additional_images: string[];
    is_available: boolean;
    is_verified: boolean;
    location: string;
    features: string[];
    owner_name: string;
    created_at: string;
}

export interface VehicleFilters {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
}

export interface CreateVehicleData {
    name: string;
    category_id: string;
    brand: string;
    model: string;
    year: number;
    description?: string;
    specifications?: Record<string, any>;
    price_per_day: number;
    price_per_hour?: number;
    price_per_week?: number;
    price_per_month?: number;
    primary_image: string;
    additional_images?: string[];
    location: string;
    features?: string[];
    owner_name?: string;
}

// Get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('auth_token');
};

// Create headers with auth token
const createHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
};

// Get all vehicle categories
export const getVehicleCategories = async (): Promise<{ success: boolean; data: VehicleCategory[] }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/vehicles/categories`, {
            method: 'GET',
            headers: createHeaders(),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching vehicle categories:', error);
        return { success: false, data: [] };
    }
};

// Get all vehicles (admin)
export const getVehicles = async (filters: VehicleFilters = {}): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
        const queryParams = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value.toString());
            }
        });

        const response = await fetch(`${API_BASE_URL}/vehicles?${queryParams.toString()}`, {
            method: 'GET',
            headers: createHeaders(),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        return { success: false, message: 'Failed to fetch vehicles' };
    }
};

// Get public vehicles (for customers)
export const getPublicVehicles = async (filters: VehicleFilters = {}): Promise<{ success: boolean; data: Vehicle[] }> => {
    try {
        const queryParams = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value.toString());
            }
        });

        const response = await fetch(`${API_BASE_URL}/vehicles/public?${queryParams.toString()}`, {
            method: 'GET',
            headers: createHeaders(),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching public vehicles:', error);
        return { success: false, data: [] };
    }
};

// Get single vehicle
export const getVehicle = async (id: string): Promise<{ success: boolean; data?: Vehicle; message?: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
            method: 'GET',
            headers: createHeaders(),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        return { success: false, message: 'Failed to fetch vehicle' };
    }
};

// Create new vehicle
export const createVehicle = async (vehicleData: CreateVehicleData): Promise<{ success: boolean; data?: Vehicle; message?: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/vehicles`, {
            method: 'POST',
            headers: createHeaders(),
            body: JSON.stringify(vehicleData),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error creating vehicle:', error);
        return { success: false, message: 'Failed to create vehicle' };
    }
};

// Update vehicle
export const updateVehicle = async (id: string, vehicleData: Partial<CreateVehicleData>): Promise<{ success: boolean; data?: Vehicle; message?: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
            method: 'PUT',
            headers: createHeaders(),
            body: JSON.stringify(vehicleData),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error updating vehicle:', error);
        return { success: false, message: 'Failed to update vehicle' };
    }
};

// Toggle vehicle availability
export const toggleVehicleAvailability = async (id: string): Promise<{ success: boolean; data?: Vehicle; message?: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/vehicles/${id}/toggle-availability`, {
            method: 'PATCH',
            headers: createHeaders(),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error toggling vehicle availability:', error);
        return { success: false, message: 'Failed to update vehicle availability' };
    }
};

// Delete vehicle
export const deleteVehicle = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
            method: 'DELETE',
            headers: createHeaders(),
        });

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        return { success: false, message: 'Failed to delete vehicle' };
    }
};