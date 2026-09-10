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
    // General
    { key: 'app.title', section: 'General', en: 'Transformer Guard', hi: 'ट्रांसफार्मर गार्ड', ta: 'மின்மாற்றி காப்பாளர்', te: 'ట్రాన్స్ఫార్మర్ గార్డ్', kn: 'ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್ ಗಾರ್ಡ್' },
    { key: 'search_modules', section: 'General', en: 'Search modules...', hi: 'मॉड्यूल खोजें...', ta: 'தொகுதிகளைத் தேடு...', te: 'మాడ్యూళ్లను శోధించండి...', kn: 'ಮಾಡ್ಯೂಲ್‌ಗಳನ್ನು ಹುಡುಕಿ...' },
    { key: 'back_to_admin', section: 'Navigation', en: 'Back to Administration', hi: 'प्रशासन पर वापस', ta: 'நிர்வாகத்திற்குத் திரும்பு', te: 'తిరిగి పరిపాలనకు', kn: 'ಆಡಳಿತಕ್ಕೆ ಹಿಂತಿರುಗಿ' },

    // Menu
    { key: 'menu.dashboard', section: 'Navigation', en: 'Dashboard', hi: 'डैशबोर्ड', ta: 'முகப்பு', te: 'డాష్‌బోర్డ్', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' },
    { key: 'menu.admin', section: 'Navigation', en: 'Administration', hi: 'प्रशासन', ta: 'நிர்வாகம்', te: 'పరిపాలన', kn: 'ಆಡಳಿತ' },
    { key: 'menu.lc_management', section: 'Navigation', en: 'LC Management', hi: 'एलसी प्रबंधन', ta: 'LC மேலாண்மை', te: 'LC నిర్వహణ', kn: 'LC ನಿರ್ವಹಣೆ' },
    { key: 'menu.alerts', section: 'Navigation', en: 'Alerts', hi: 'अलर्ट', ta: 'எச்சரிக்கைகள்', te: 'హెచ్చరికలు', kn: 'ಎಚ್ಚರಿಕೆಗಳು' },
    { key: 'menu.reports', section: 'Navigation', en: 'Reports', hi: 'रिपोर्ट्स', ta: 'அறிக்கைகள்', te: 'నివేదికలు', kn: 'ವರದಿಗಳು' },
    { key: 'menu.hierarchy', section: 'Navigation', en: 'Network Hierarchy', hi: 'नेटवर्क पदानुक्रम', ta: 'நெட்வொர்க் படிநிலை', te: 'నెట్‌వర్క్ సోపానక్రమం', kn: 'ನೆಟ್‌ವರ್ಕ್ ಶ್ರೇಣಿ' },
    { key: 'menu.settings', section: 'Navigation', en: 'Settings', hi: 'सेटिंग्स', ta: 'அமைப்புகள்', te: 'అమరికలు', kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು' },

    // Admin Titles & Descriptions
    { key: 'admin.users', section: 'Admin', en: 'User Management', hi: 'उपयोगकर्ता प्रबंधन', ta: 'பயனர் மேலாண்மை', te: 'వినియోగదారు నిర్వహణ', kn: 'ಬಳಕೆದಾರ ನಿರ್ವಹಣೆ' },
    { key: 'desc.users', section: 'Admin', en: 'Manage users, roles, and permissions.', hi: 'उपयोगकर्ताओं, भूमिकाओं और अनुमतियों का प्रबंधन करें।', ta: '', te: '', kn: '' },

    { key: 'admin.company', section: 'Admin', en: 'Company Master', hi: 'कंपनी मास्टर', ta: 'நிறுவன முதன்மை', te: 'కంపెనీ మాస్టర్', kn: 'ಕಂಪನಿ ಮಾಸ್ಟರ್' },
    { key: 'desc.company', section: 'Admin', en: 'Manage authorized utility companies.', hi: 'अधिकृत उपयोगिता कंपनियों का प्रबंधन करें।', ta: '', te: '', kn: '' },

    { key: 'admin.transformers', section: 'Admin', en: 'Transformer Master', hi: 'ट्रांसफार्मर मास्टर', ta: 'மின்மாற்றி முதன்மை', te: 'ట్రాన్స్ఫార్మర్ మాస్టర్', kn: 'ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್ ಮಾಸ್ಟರ್' },
    { key: 'desc.transformers', section: 'Admin', en: 'Add/Update transformers and bulk upload.', hi: 'ट्रांसफार्मर जोड़ें/अपडेट करें और थोक अपलोड करें।', ta: '', te: '', kn: '' },

    { key: 'admin.locations', section: 'Admin', en: 'Location Master', hi: 'स्थान मास्टर', ta: 'இருப்பிட முதன்மை', te: 'స్థాన మాస్టర్', kn: 'ಸ್ಥಳ ಮಾಸ್ಟರ್' },
    { key: 'desc.locations', section: 'Admin', en: 'Circles, Divisions, and Feeders.', hi: 'सर्कल, डिवीजन और फीडर।', ta: '', te: '', kn: '' },

    { key: 'admin.api_config', section: 'Admin', en: 'API Configuration', hi: 'एपीआई कॉन्फ़िगरेशन', ta: 'API கட்டமைப்பு', te: 'API ఆకృతీకరణ', kn: 'API ಸಂರಚನೆ' },
    { key: 'desc.api_config', section: 'Admin', en: 'Manage and test backend endpoints.', hi: 'बैकएंड एंडपॉइंट्स का प्रबंधन और परीक्षण करें।', ta: '', te: '', kn: '' },

    { key: 'admin.language', section: 'Admin', en: 'Language Settings', hi: 'भाषा सेटिंग्स', ta: 'மொழி அமைப்புகள்', te: 'భాషా సెట్టింగ్‌లు', kn: 'ಭಾಷಾ ಸೆಟ್ಟಿಂಗ್‌ಗಳು' },
    { key: 'desc.language', section: 'Admin', en: 'Manage translations and text.', hi: 'अनुवाद और पाठ का प्रबंधन करें।', ta: '', te: '', kn: '' },

    // Status
    { key: 'status.active', section: 'Status', en: 'Active', hi: 'सक्रिय', ta: 'செயலில்', te: 'యాక్టివ్', kn: 'ಸಕ್ರಿಯ' },
    { key: 'status.inactive', section: 'Status', en: 'Inactive', hi: 'निष्क्रिय', ta: 'செயலற்ற', te: 'క్రియారహితం', kn: 'ನಿಷ್ಕ್ರಿಯ' },

    // Buttons
    { key: 'btn.save', section: 'Buttons', en: 'Save', hi: 'सहेजें', ta: 'சேமி', te: 'సేవ్ చేయండి', kn: 'ಉಳಿಸಿ' },
    { key: 'btn.cancel', section: 'Buttons', en: 'Cancel', hi: 'रद्द करें', ta: 'ரத்துசெய்', te: 'రద్దు చేయండి', kn: 'ರದ್ದುಮಾಡಿ' },
    { key: 'btn.delete', section: 'Buttons', en: 'Delete', hi: 'हटाएं', ta: 'அழி', te: 'తొలగించు', kn: 'ಅಳಿಸಿ' },
    { key: 'btn.add_endpoint', section: 'Buttons', en: 'Add Endpoint', hi: 'एंडपॉइंट जोड़ें', ta: '', te: '', kn: '' },

    // Login (Auth)
    { key: 'login', section: 'Auth', en: 'Login', hi: 'लॉग इन', ta: 'உள்நுழை', te: 'లాగిన్', kn: 'ಲಾಗಿನ್' },
    { key: 'password', section: 'Auth', en: 'Password', hi: 'पासवर्ड', ta: 'கடவுச்சொல்', te: 'పాస్వర్డ్', kn: 'ಪಾಸ್ವರ್ಡ್' },
    { key: 'secure_portal', section: 'Auth', en: 'Secure Access Portal', hi: 'सुरक्षित एक्सेस पोर्टल', ta: '', te: '', kn: '' },
    { key: 'remember_me', section: 'Auth', en: 'Remember me', hi: 'मुझे याद रखें', ta: '', te: '', kn: '' },
    { key: 'forgot_password', section: 'Auth', en: 'Forgot Password?', hi: 'पासवर्ड भूल गए?', ta: '', te: '', kn: '' },
    { key: 'new_user', section: 'Auth', en: 'New User?', hi: 'नया उपयोगकर्ता?', ta: '', te: '', kn: '' },
    { key: 'sign_up', section: 'Auth', en: 'Sign Up', hi: 'साइन अप', ta: '', te: '', kn: '' },
    { key: 'username_placeholder', section: 'Auth', en: 'Mobile Number or Email', hi: 'मोबाइल नंबर या ईमेल', ta: '', te: '', kn: '' },
];

const LANG_STORAGE_KEY = 'app_language_store_v5';

export const LanguageStore = {
    getAll: (): LanguageItem[] => {
        if (typeof window === 'undefined') return DEFAULT_ITEMS;
        const stored = localStorage.getItem(LANG_STORAGE_KEY);
        if (!stored) {
            // Check for v1 data migration
            const oldStored = null; // localStorage.getItem('app_language_store');
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
