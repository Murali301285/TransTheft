import { ApiResponse } from '@/lib/types'; // Assuming types should be centralized or redefined here

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://148.66.153.35:9092';

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
            return ApiService.post('/api/Auth/logOut', {});
        },
        refreshToken: async (data: any) => {
            return ApiService.post('/api/Auth/refresh-token', data);
        },
        revokeToken: async (data: any) => {
            return ApiService.post('/api/Auth/revoke-token', data);
        },
        register: async (data: any) => {
            return ApiService.post('/api/User/create-user', data);
        }
    },

    dashboard: {
        getTransactionsByCompany: async () => {
            return ApiService.get<any>('/api/Dashboard/ht-transactions-by-company');
        },
        getTransactionsByUser: async () => {
            return ApiService.get<any>('/api/Dashboard/ht-transactions-by-user');
        },
        searchTransactions: async (params: { regionId?: number; circleId?: number; divisionId?: number; subDivisionId?: number }) => {
            const query = new URLSearchParams(params as any).toString();
            return ApiService.get<any>(`/api/Dashboard/ht-transactions/search?${query}`);
        }
    },

    transformers: { // Switched to Transformer Controller
        getAll: async () => {
            return ApiService.get<any[]>('/api/Transformer/get-transformers');
        },
        getById: async (id: number) => {
            return ApiService.get<any>(`/api/Transformer/get-transformer-by-id?transformerId=${id}`);
        },
        getBySubDivision: async (subDivId: number) => {
            return ApiService.get<any[]>(`/api/Transformer/get-transformers-by-subdivision/${subDivId}`);
        },
        getCombo: async () => {
            // Assuming combo is also on Transformer or keeping specific MasterDevice combo?
            // Safest to try generic combo or keep existing if unsure.
            return ApiService.get<any[]>('/api/Transformer/get-transformers-combo');
        },
        // getComboBySubDivision ... might not exist or diff path
        create: async (data: any) => {
            return ApiService.post('/api/Transformer/add-transformer', data);
        },
        update: async (data: any) => {
            return ApiService.put('/api/Transformer/update-transformer', data);
        },
        delete: async (id: number) => {
            return ApiService.put(`/api/Transformer/delete-transformer?transformerId=${id}`, {});
        },
        getDashboardTransactions: async (fromDate?: string, toDate?: string) => {
            let url = '/api/Dashboard/transformer-transactions-by-company';
            if (fromDate && toDate) {
                url += `?fromDate=${fromDate}&toDate=${toDate}`;
            }
            return ApiService.get<any[]>(url);
        },
        getTransactionsByUser: async (fromDate?: string, toDate?: string) => {
            let url = '/api/Dashboard/transformer-transactions-by-user';
            if (fromDate && toDate) {
                url += `?fromDate=${fromDate}&toDate=${toDate}`;
            }
            return ApiService.get<any[]>(url);
        }
    },

    alerts: {
        getOpen: async (fromDate: string, toDate: string) => {
            try {
                const res = await fetch(`/api/proxy/alerts?type=open&fromDate=${fromDate}&toDate=${toDate}`, {
                    method: 'GET',
                    headers: getHeaders()
                });
                return handleResponse<any[]>(res);
            } catch (error) {
                return { success: false, message: 'Network Error' };
            }
        },
        getClosed: async (fromDate: string, toDate: string) => {
            try {
                const res = await fetch(`/api/proxy/alerts?type=closed&fromDate=${fromDate}&toDate=${toDate}`, {
                    method: 'GET',
                    headers: getHeaders()
                });
                return handleResponse<any[]>(res);
            } catch (error) {
                return { success: false, message: 'Network Error' };
            }
        },
        getAll: async (fromDate: string, toDate: string) => {
            try {
                const res = await fetch(`/api/proxy/alerts?type=closed&fromDate=${fromDate}&toDate=${toDate}`, {
                    method: 'GET',
                    headers: getHeaders()
                });
                return handleResponse<any[]>(res);
            } catch (error) {
                return { success: false, message: 'Network Error' };
            }
        }
    },

    transformerAssets: {
        create: async (data: any) => {
            return ApiService.post('/api/Transformer/create', data);
        },
        import: async (data: any[]) => {
            return ApiService.post('/api/Transformer/import', data);
        }
    },

    sims: {
        getAll: async () => {
            return ApiService.get<any[]>('/api/Sim/get-sims');
        },
        getById: async (id: number) => {
            return ApiService.get<any>(`/api/Sim/${id}`);
        },
        create: async (data: any) => {
            return ApiService.post('/api/Sim/add-sim', data);
        },
        update: async (data: any) => {
            return ApiService.put('/api/Sim/update-sim', data);
        },
        delete: async (id: number) => {
            return ApiService.put(`/api/Sim/delete-sim?simId=${id}`, {});
        }
    },

    masterDevices: {
        getAll: async () => {
            return ApiService.get<any[]>('/api/MasterDevice/get-master-devices');
        },
        getCombo: async () => {
            return ApiService.get<any[]>('/api/MasterDevice/get-masters-combo');
        }
    },

    users: {
        getAll: async () => {
            return ApiService.get<any[]>('/api/User/get-users');
        },
        getById: async (id: number) => {
            return ApiService.get<any>(`/api/User/get-user-byId?id=${id}`);
        },
        getRolesCombo: async () => {
            return ApiService.get<any[]>('/api/User/get-roles-combo');
        },
        create: async (data: any) => {
            return ApiService.post('/api/User/create-user', data);
        },
        update: async (data: any, userId: number) => {
            return ApiService.put(`/api/User/update-user?userId=${userId}`, data);
        },
        delete: async (id: number) => {
            return ApiService.put(`/api/User/delete-user?userId=${id}`, {});
        }
    },

    company: {
        getAll: async () => {
            return ApiService.get<any[]>('/api/Company/get-company');
        },
        getCombo: async () => {
            return ApiService.get<any[]>('/api/Company/get-company-combo');
        },
        getById: async (id: number) => {
            return ApiService.get<any>(`/api/Company/${id}`);
        },
        create: async (data: any) => {
            return ApiService.post('/api/Company/add-company', data);
        },
        update: async (data: any) => {
            return ApiService.put('/api/Company/update-company', data);
        },
        delete: async (id: number) => {
            return ApiService.put(`/api/Company/delete-company?companyId=${id}`, {});
        }
    },

    customer: {
        getAll: () => ApiService.get<any[]>('/api/Customer'),
        getCombo: () => ApiService.get<any[]>('/api/Customer/combo'),
        getById: (id: number) => ApiService.get<any>(`/api/Customer/${id}`),
        create: (data: any) => ApiService.post('/api/Customer/create', data),
        update: (id: number, data: any) => ApiService.put(`/api/Customer/${id}`, data),
        delete: (id: number) => ApiService.delete(`/api/Customer/${id}`)
    },

    locations: {
        region: {
            getAll: () => ApiService.get<any[]>('/api/Region'),
            getCombo: () => ApiService.get<any[]>('/api/Region/combo'),
            getById: (id: number) => ApiService.get<any>(`/api/Region/${id}`),
            create: (data: any) => ApiService.post('/api/Region/create', data),
            update: (id: number, data: any) => ApiService.put(`/api/Region/${id}`, data),
            delete: (id: number) => ApiService.delete(`/api/Region/${id}`)
        },
        circle: {
            getAll: () => ApiService.get<any[]>('/api/Circle'),
            getCombo: () => ApiService.get<any[]>('/api/Circle/combo'),
            getComboByRegion: (regionId: number) => ApiService.get<any[]>(`/api/Circle/combo/${regionId}`),
            getById: (id: number) => ApiService.get<any>(`/api/Circle/${id}`),
            create: (data: any) => ApiService.post('/api/Circle/create', data),
            update: (id: number, data: any) => ApiService.put(`/api/Circle/${id}`, data),
            delete: (id: number) => ApiService.delete(`/api/Circle/${id}`)
        },
        division: {
            getAll: () => ApiService.get<any[]>('/api/Division'),
            getCombo: () => ApiService.get<any[]>('/api/Division/combo'),
            getComboByCircle: (circleId: number) => ApiService.get<any[]>(`/api/Division/combo/${circleId}`),
            getById: (id: number) => ApiService.get<any>(`/api/Division/${id}`),
            create: (data: any) => ApiService.post('/api/Division/create', data),
            update: (id: number, data: any) => ApiService.put(`/api/Division/${id}`, data),
            delete: (id: number) => ApiService.delete(`/api/Division/${id}`)
        },
        subDivision: {
            getAll: () => ApiService.get<any[]>('/api/SubDivision'),
            getCombo: () => ApiService.get<any[]>('/api/SubDivision/combo'),
            getComboByDivision: (divisionId: number) => ApiService.get<any[]>(`/api/SubDivision/combo/${divisionId}`),
            getById: (id: number) => ApiService.get<any>(`/api/SubDivision/${id}`),
            create: (data: any) => ApiService.post('/api/SubDivision/create', data),
            update: (id: number, data: any) => ApiService.put(`/api/SubDivision/${id}`, data),
            delete: (id: number) => ApiService.delete(`/api/SubDivision/${id}`)
        },
        substation: {
            getAll: () => ApiService.get<any[]>('/api/Substation/get-substations'),
            getBySubDivision: (id: number) => ApiService.get<any[]>(`/api/Substation/get-substations-by-subdivision/${id}`),
            getCombo: () => ApiService.get<any[]>('/api/Substation/get-substations-combo'),
            getComboBySubDivision: (id: number) => ApiService.get<any[]>(`/api/Substation/get-substations-combo-by-subdivision/${id}`),
            getById: (id: number) => ApiService.get<any>(`/api/Substation/${id}`),
            create: (data: any) => ApiService.post('/api/Substation/add-substation', data),
            update: (data: any) => ApiService.put('/api/Substation/update-substation', data),
            delete: (id: number) => ApiService.put(`/api/Substation/delete-substation?substationId=${id}`, {})
        },
        feeder: {
            getAll: () => ApiService.get<any[]>('/api/Feeder'),
            getCombo: () => ApiService.get<any[]>('/api/Feeder/combo'),
            getById: (id: number) => ApiService.get<any>(`/api/Feeder/${id}`),
            create: (data: any) => ApiService.post('/api/Feeder/create', data),
            update: (id: number, data: any) => ApiService.put(`/api/Feeder/${id}`, data),
            delete: (id: number) => ApiService.delete(`/api/Feeder/${id}`)
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
    },

    put: async <T>(endpoint: string, body: any): Promise<ApiResponse<T>> => {
        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(body)
            });
            return handleResponse<T>(res);
        } catch (error) {
            return { success: false, message: 'Network Error' };
        }
    },

    delete: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            return handleResponse<T>(res);
        } catch (error) {
            return { success: false, message: 'Network Error' };
        }
    }
};
