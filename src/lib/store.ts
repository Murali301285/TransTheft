import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Language } from './types';

interface AppState {
    language: Language;
    user: User | null;
    isAuthenticated: boolean;

    setLanguage: (lang: Language) => void;
    login: (user: User) => void;
    logout: () => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            language: 'en',
            user: null,
            isAuthenticated: false,

            setLanguage: (lang) => set({ language: lang }),
            login: (user) => set({ user, isAuthenticated: true }),
            logout: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: 'ttm-storage', // name of the item in the storage (must be unique)
        }
    )
);
