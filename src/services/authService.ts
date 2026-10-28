const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'owner';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
  needsVerification?: boolean;
}

/**
 * Sign up a new user with email verification
 */
export const signUp = async (data: SignupData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
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
      message: error.message || 'An error occurred during signup',
      error,
    };
  }
};

/**
 * Sign in an existing user
 */
export const signIn = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success && result.data?.token) {
      // Store token in localStorage
      localStorage.setItem('auth_token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }

    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'An error occurred during sign in',
      error,
    };
  }
};

/**
 * Sign out the current user and terminate all active sessions
 */
export const signOut = async (): Promise<AuthResponse> => {
  try {
    const token = localStorage.getItem('auth_token');

    // Call server to terminate all sessions if token exists
    if (token) {
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (serverError) {
        // Continue with local logout even if server call fails
        console.warn('Server logout failed, continuing with local logout:', serverError);
      }
    }

    // Clear all authentication data from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');

    // Clear any other auth-related data
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('session_id');

    // Clear sessionStorage as well
    sessionStorage.clear();

    return {
      success: true,
      message: 'Signed out successfully!',
    };
  } catch (error: any) {
    // Even if there's an error, clear local data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('session_id');
    sessionStorage.clear();

    return {
      success: false,
      message: error.message || 'An error occurred during sign out',
      error,
    };
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'An error occurred while sending reset email',
      error,
    };
  }
};

/**
 * Reset password with token
 */
export const resetPasswordWithToken = async (
  token: string,
  newPassword: string
): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'An error occurred while resetting password',
      error,
    };
  }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/verify-email?token=${token}`, {
      method: 'GET',
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'An error occurred during verification',
      error,
    };
  }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (email: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'An error occurred while resending verification email',
      error,
    };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;

    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    return null;
  }
};

/**
 * Sign in with OAuth provider (placeholder for future implementation)
 */
export const signInWithOAuth = async (provider: 'google' | 'facebook'): Promise<AuthResponse> => {
  return {
    success: false,
    message: 'OAuth authentication coming soon!',
  };
};