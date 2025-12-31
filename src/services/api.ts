export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://148.66.153.35:8094';

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errorCode?: string;
}

const HEADERS = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
        const errorBody = await response.text();
        return {
            success: false,
            message: `Error ${response.status}: ${errorBody || response.statusText}`,
        };
    }

    try {
        const data = await response.json();
        // Adjust this based on actual API wrapper
        return { success: true, data };
    } catch (e) {
        return { success: false, message: 'Invalid JSON response' };
    }
}

export const ApiService = {
    get: async <T>(endpoint: string): Promise<ApiResponse<T>> => {
        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    ...HEADERS,
                    // 'Authorization': `Bearer ${token}` // Add logic to get token from storage
                }
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
                headers: {
                    ...HEADERS,
                    // 'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            return handleResponse<T>(res);
        } catch (error) {
            return { success: false, message: 'Network Error' };
        }
    },

    // Method to facilitate bulk uploads via FORM DATA or JSON
    upload: async <T>(endpoint: string, file: File): Promise<ApiResponse<T>> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                // Headers: Do NOT set Content-Type for FormData, browser sets it with boundary
                headers: {
                    // Auth header here
                },
                body: formData
            });
            return handleResponse<T>(res);
        } catch (error) {
            return { success: false, message: 'Upload Failed' };
        }
    }
};
