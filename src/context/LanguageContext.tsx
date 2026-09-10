'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageStore, LanguageItem } from '@/lib/language-store';

type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'kn';

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
    t: (key: string) => string;
    translations: LanguageItem[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<LanguageCode>('en');
    const [translations, setTranslations] = useState<LanguageItem[]>([]);

    useEffect(() => {
        // Load translations and saved preference
        setTranslations(LanguageStore.getAll());
        const savedLang = localStorage.getItem('app_lang_pref') as LanguageCode;
        if (savedLang) setLanguage(savedLang);
    }, []);

    const handleSetLanguage = (lang: LanguageCode) => {
        setLanguage(lang);
        localStorage.setItem('app_lang_pref', lang);
    };

    const t = (key: string): string => {
        const item = translations.find(i => i.key === key);
        if (!item) return key; // Fallback to key or English default if structure differs
        return item[language] || item.en || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, translations }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
    return context;
};
