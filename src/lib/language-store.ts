'use client';

export interface LanguageItem {
    key: string;
    section: string;
    en: string; // English
    hi: string; // Hindi
    ta: string; // Tamil
    te: string; // Telugu
    kn: string; // Kannada
}

const DEFAULT_ITEMS: LanguageItem[] = [
    { key: 'app.title', section: 'General', en: 'Transformer Guard', hi: 'ट्रांसफार्मर गार्ड', ta: 'மின்மாற்றி காப்பாளர்', te: 'ట్రాన్స్ఫార్మర్ గార్డ్', kn: 'ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್ ಗಾರ್ಡ್' },
    { key: 'menu.dashboard', section: 'Navigation', en: 'Dashboard', hi: 'डैशबोर्ड', ta: 'முகப்பு', te: 'డాష్‌బోర్డ్', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' },
    { key: 'menu.admin', section: 'Navigation', en: 'Administration', hi: 'प्रशासन', ta: 'நிர்வாகம்', te: 'పరిపాలన', kn: 'ಆಡಳಿತ' },
    { key: 'status.active', section: 'Status', en: 'Active', hi: 'सक्रिय', ta: 'செயலில்', te: 'యాక్టివ్', kn: 'ಸಕ್ರಿಯ' },
    { key: 'status.inactive', section: 'Status', en: 'Inactive', hi: 'निष्क्रिय', ta: 'செயலற்ற', te: 'క్రియారహితం', kn: 'ನಿಷ್ಕ್ರಿಯ' },
];

const LANG_STORAGE_KEY = 'app_language_store_v2';

export const LanguageStore = {
    getAll: (): LanguageItem[] => {
        if (typeof window === 'undefined') return DEFAULT_ITEMS;
        const stored = localStorage.getItem(LANG_STORAGE_KEY);
        if (!stored) {
            // Check for v1 data migration
            const oldStored = localStorage.getItem('app_language_store');
            if (oldStored) {
                try {
                    const oldItems = JSON.parse(oldStored);
                    const migrated = oldItems.map((i: any) => ({
                        key: i.key,
                        section: i.section || 'General',
                        en: i.value || '',
                        hi: '', ta: '', te: '', kn: ''
                    }));
                    localStorage.setItem(LANG_STORAGE_KEY, JSON.stringify(migrated));
                    return migrated;
                } catch (e) { }
            }
            localStorage.setItem(LANG_STORAGE_KEY, JSON.stringify(DEFAULT_ITEMS));
            return DEFAULT_ITEMS;
        }
        return JSON.parse(stored);
    },

    save: (items: LanguageItem[]) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(LANG_STORAGE_KEY, JSON.stringify(items));
    },

    resetToDefaults: () => {
        if (typeof window === 'undefined') return DEFAULT_ITEMS;
        localStorage.setItem(LANG_STORAGE_KEY, JSON.stringify(DEFAULT_ITEMS));
        return DEFAULT_ITEMS;
    }
};
