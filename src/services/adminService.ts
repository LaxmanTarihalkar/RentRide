const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`;

export interface AdminStats {
  totalRevenue: number;
  activeBookings: number;
  totalCars: number;
  growthRate: number;
  totalUsers: number;
  totalBookings: number;
}

export interface RecentBooking {
  id: string;
  customer: string;
  email: string;
  car: string;
  status: string;
  amount: string;
  date: string;
}

export interface RecentUser {
  id: string;
  name: string;
  email: string;
  joinDate: string;
}

export interface DashboardData {
  stats: AdminStats;
  recentBookings: RecentBooking[];
  recentUsers: RecentUser[];
}

export interface AdminResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}

/**
 * Get authentication headers with token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Get admin dashboard data
 */
export const getAdminDashboard = async (): Promise<AdminResponse<DashboardData>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch dashboard data',
      error,
    };
  }
};

/**
 * Get all users with pagination
 */
export const getAdminUsers = async (page: number = 1, limit: number = 10): Promise<AdminResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch users',
      error,
    };
  }
};

/**
 * Get all bookings with pagination
 */
export const getAdminBookings = async (page: number = 1, limit: number = 10): Promise<AdminResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/bookings?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch bookings',
      error,
    };
  }
};

/**
 * Get all cars with pagination
 */
export const getAdminCars = async (page: number = 1, limit: number = 10): Promise<AdminResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/cars?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch cars',
      error,
    };
  }
};

/**
 * Get all car owners with pagination
 */
export const getAdminOwners = async (page: number = 1, limit: number = 10): Promise<AdminResponse<any>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/owners?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch owners',
      error,
    };
  }
};