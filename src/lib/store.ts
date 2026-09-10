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
    updateUser: (user: Partial<User>) => void;
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
            updateUser: (updatedUser) => set((state) => ({
                user: state.user ? { ...state.user, ...updatedUser } : null
            })),
        }),
        {
            name: 'ttm-storage', // name of the item in the storage (must be unique)
        }
    )
);
