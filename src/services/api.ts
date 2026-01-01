import { ApiResponse } from '@/lib/types'; // Assuming types should be centralized or redefined here

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://148.66.153.35:8094';

// --- DTOs based on Swagger ---
export interface LoginDTO {
    userName?: string;
    password?: string;
}

export interface LoginResponse {
    token: string;
    refreshToken: string;
    expiration: string;
    // Add other fields if returned
}

export interface MasterDTO {
    masterId: number;
    masterName: string;
    masterCode: string;
    isOnline: boolean;
    // Add other DTO fields
}

// --- Token Management ---
const TOKEN_KEY = 'auth_token';
const REFRESH_KEY = 'refresh_token';

export const TokenService = {
    setToken: (token: string, refreshToken?: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, token);
            if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
        }
    },
    getToken: () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(TOKEN_KEY);
        }
        return null;
    },
    removeToken: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(REFRESH_KEY);
        }
    }
};

// --- HTTP Client ---
const getHeaders = () => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
    const token = TokenService.getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`; // Assuming Bearer token
    }
    return headers;
};

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (response.status === 401) {
        TokenService.removeToken();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return { success: false, message: 'Unauthorized' };
    }

    if (!response.ok) {
        try {
            const errorBody = await response.text();
            return {
                success: false,
                message: errorBody || `Error ${response.status}`,
            };
        } catch {
            return { success: false, message: `Error ${response.status}` };
        }
    }

    try {
        const data = await response.json();
        // Swagger usually returns data directly or wrapped. Adjust if needed.
        return { success: true, data };
    } catch (e) {
        return { success: false, message: 'Invalid JSON response' };
    }
}

export const ApiService = {
    auth: {
        login: async (creds: LoginDTO): Promise<ApiResponse<LoginResponse>> => {
            return ApiService.post<LoginResponse>('/api/Auth/login', creds);
        },
        logout: async () => {
            TokenService.removeToken();
            // Call API logout if needed: /api/Auth/logOut
        }
    },

    transformers: {
        getAll: async () => {
            return ApiService.get<MasterDTO[]>('/api/MasterDevice/get-master-devices');
        },
        getById: async (id: number) => {
            return ApiService.get<MasterDTO>(`/api/MasterDevice/${id}`);
        }
    },

    users: {
        getAll: async () => {
            return ApiService.get<any[]>('/api/User/get-users');
        }
    },

    hierarchy: {
        circles: async () => ApiService.get<any[]>('/api/Circle'),
        divisions: async () => ApiService.get<any[]>('/api/Division'),
    },

    // --- Core Methods ---
    get: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: getHeaders()
            });
            return handleResponse<T>(res);
        } catch (error) {
            return { success: false, message: 'Network Error' };
        }
    },

    post: async <T>(endpoint: string, body: any): Promise<ApiResponse<T>> => {
        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(body)
            });
            return handleResponse<T>(res);
        } catch (error) {
            return { success: false, message: 'Network Error' };
        }
    }
};
