export interface ApiEndpoint {
    id: string;
    name: string;
    group: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    description: string;
    isActive: boolean;
    defaultBody?: string;
}
