export type Language = 'en' | 'hi' | 'ta' | 'te' | 'kn';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'circle_head' | 'division_head' | 'feeder_manager' | 'viewer';
    permissions: string[];
}

export interface HierarchyNode {
    id: string;
    name: string;
    type: 'circle' | 'division' | 'sub_division' | 'feeder' | 'transformer';
    parentId?: string;
    children?: HierarchyNode[];
    details?: TransformerDetails;
}

export interface TransformerDetails {
    id: string;
    name: string;
    circle?: string;
    division?: string;
    lat: number;
    lng: number;
    capacity: string;
    status: 'active' | 'inactive' | 'alert' | 'maintenance';
    lastPing: string;
    address: string;
    nearestCustomers: Customer[];
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    distance: number; // in km
}

export interface Dictionary {
    [key: string]: {
        en: string;
        hi: string;
        ta: string;
        te: string;
        kn: string;
    };
}

export type MasterType = 'user' | 'transformer' | 'sim' | 'subdivision' | 'feeder';

export interface BulkUploadRow {
    rowId: number;
    data: any;
    status: 'pending' | 'ok' | 'error' | 'duplicate';
    remarks: string[];
}

export interface BulkUploadStats {
    total: number;
    valid: number;
    invalid: number;
    duplicates: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errorCode?: string;
}
