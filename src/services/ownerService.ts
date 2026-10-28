const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface OwnerRegistrationData {
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
}

export interface OwnerRequest {
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

export interface ApiResponse<T> {
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
 * Register new owner
 */
export const registerOwner = async (data: OwnerRegistrationData): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_URL}/api/owners/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to register owner',
      error,
    };
  }
};

/**
 * Get owner requests (Admin only)
 */
export const getOwnerRequests = async (
  page: number = 1, 
  limit: number = 10, 
  status: string = 'all'
): Promise<ApiResponse<{
  requests: OwnerRequest[];
  pagination: { page: number; limit: number; total: number; pages: number };
}>> => {
  try {
    const response = await fetch(
      `${API_URL}/api/owners/requests?page=${page}&limit=${limit}&status=${status}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch owner requests',
      error,
    };
  }
};

/**
 * Approve owner request (Admin only)
 */
export const approveOwnerRequest = async (id: number): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_URL}/api/owners/${id}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to approve owner request',
      error,
    };
  }
};

/**
 * Reject owner request (Admin only)
 */
export const rejectOwnerRequest = async (id: number, reason: string): Promise<ApiResponse<any>> => {
  try {
    const response = await fetch(`${API_URL}/api/owners/${id}/reject`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to reject owner request',
      error,
    };
  }
};

/**
 * Get owner details (Admin only)
 */
export const getOwnerDetails = async (id: number): Promise<ApiResponse<OwnerRequest>> => {
  try {
    const response = await fetch(`${API_URL}/api/owners/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to fetch owner details',
      error,
    };
  }
};