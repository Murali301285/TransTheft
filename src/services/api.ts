import { ApiResponse } from '@/lib/types'; // Assuming types should be centralized or redefined here

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://148.66.153.35:8094';

// --- DTOs based on Swagger ---
export interface LoginDTO {
    userName?: string;
    password?: string;
}

export interface LoginResponse {
    token?: string;
    Token?: string;
    accessToken?: string;
    refreshToken?: string;
    RefreshToken?: string;
    expiration?: string;
    [key: string]: any;
}

export interface MasterDTO {
    masterId: number;
    masterName: string;
    masterCode: string;
    isOnline: boolean;
    installedOn?: string;
    // Extended Details
    latitude?: number;
    longitude?: number;
    address?: string;
    circleName?: string;
    divisionName?: string;
    simNumber?: string;
    capacity?: string;
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
    if (token && token !== 'undefined' && token !== 'null') {
        headers['Authorization'] = `Bearer ${token}`;
    } else {
        console.warn('API Request: No valid token found in storage.');
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
        },
        register: async (data: any) => {
            return ApiService.post('/api/User/create-user', data);
        }
    },

    transformers: {
        getAll: async () => {
            return ApiService.get<MasterDTO[]>('/api/MasterDevice/get-master-devices');
        },
        getById: async (id: number) => {
            return ApiService.get<MasterDTO>(`/api/MasterDevice/${id}`);
        },
        updateStatus: async (masterCode: string, isOnline: boolean) => {
            // Placeholder: Adjust endpoint according to Swagger
            return ApiService.post(`/api/MasterDevice/update-status`, { masterCode, isOnline });
        }
    },

    users: {
        getAll: async () => {
            return ApiService.get<any[]>('/api/User/get-users');
        },
        // Mocking Pending vs Active if API doesn't support filter directly, or assume new endpoint
        getPending: async () => {
            // If get-users returns all, filtering will happen on frontend, 
            // but let's assume specific endpoint for efficiency or use get-users
            return ApiService.get<any[]>('/api/User/get-pending-users');
        },
        approve: async (id: number) => {
            return ApiService.post(`/api/User/approve-user/${id}`, {});
        },
        reject: async (id: number) => {
            return ApiService.post(`/api/User/reject-user/${id}`, {});
        }
    },

    hierarchy: {
        circles: async () => ApiService.get<any[]>('/api/Circle'),
        divisions: async () => ApiService.get<any[]>('/api/Division'),
    },

    company: {
        getAll: async () => {
            console.log('Fetching companies from /api/Company/get-company');
            // Trying singular form based on pattern variations
            return ApiService.get<any[]>('/api/Company/get-company');
        },
        create: async (data: any) => {
            return ApiService.post('/api/Company/create-company', data);
        },
        update: async (data: any) => {
            return ApiService.post('/api/Company/update-company', data);
        },
        delete: async (id: number) => {
            // Try standard pattern delete-company or similar if generic fails
            return ApiService.post(`/api/Company/delete-company/${id}`, {});
        }
    },

    locations: {
        circle: {
            getAll: () => ApiService.get<any[]>('/api/Circle/get-circles'),
            create: (data: any) => ApiService.post('/api/Circle/create-circle', data),
            update: (data: any) => ApiService.post('/api/Circle/update-circle', data),
            delete: (id: number) => ApiService.post(`/api/Circle/delete-circle/${id}`, {})
        },
        division: {
            getAll: () => ApiService.get<any[]>('/api/Division/get-divisions'),
            create: (data: any) => ApiService.post('/api/Division/create-division', data),
            update: (data: any) => ApiService.post('/api/Division/update-division', data),
            delete: (id: number) => ApiService.post(`/api/Division/delete-division/${id}`, {})
        },
        subDivision: {
            getAll: () => ApiService.get<any[]>('/api/SubDivision/get-subdivisions'),
            create: (data: any) => ApiService.post('/api/SubDivision/create-subdivision', data),
            update: (data: any) => ApiService.post('/api/SubDivision/update-subdivision', data),
            delete: (id: number) => ApiService.post(`/api/SubDivision/delete-subdivision/${id}`, {})
        },
        section: {
            getAll: () => ApiService.get<any[]>('/api/Section/get-sections'),
            create: (data: any) => ApiService.post('/api/Section/create-section', data),
            update: (data: any) => ApiService.post('/api/Section/update-section', data),
            delete: (id: number) => ApiService.post(`/api/Section/delete-section/${id}`, {})
        },
        substation: { // Assuming SubStation or Substation
            getAll: () => ApiService.get<any[]>('/api/SubStation/get-substations'),
            create: (data: any) => ApiService.post('/api/SubStation/create-substation', data),
            update: (data: any) => ApiService.post('/api/SubStation/update-substation', data),
            delete: (id: number) => ApiService.post(`/api/SubStation/delete-substation/${id}`, {})
        }
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
