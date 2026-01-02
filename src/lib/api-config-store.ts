'use client';

import { ApiEndpoint } from './api-config-types';
import { DEFAULT_APIS } from './default-apis';

export type { ApiEndpoint };

const STORAGE_KEY = 'api_config_store_v2';

export const ApiConfigService = {
    getAll: (): ApiEndpoint[] => {
        if (typeof window === 'undefined') return DEFAULT_APIS;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            // Seed with full swagger list
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_APIS));
            return DEFAULT_APIS;
        }
        return JSON.parse(stored);
    },

    save: (apis: ApiEndpoint[]) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(apis));
    },

    reset: () => {
        if (typeof window === 'undefined') return DEFAULT_APIS;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_APIS));
        return DEFAULT_APIS;
    }
};
