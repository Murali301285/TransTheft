'use client';
import { useAppStore } from '@/lib/store';
import { Language } from '@/lib/types';
import { Globe } from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi (हिंदी)' },
    { code: 'ta', label: 'Tamil (தமிழ்)' },
    { code: 'te', label: 'Telugu (తెలుగు)' },
    { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
];

export function LanguageSelector() {
    const { language, setLanguage } = useAppStore();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-[hsl(var(--surface-glass))] border border-[hsl(var(--border))] shadow-sm hover:bg-[hsl(var(--surface))] transition-colors"
            >
                <Globe size={18} className="text-[hsl(var(--primary))]" />
                <span className="text-sm font-medium uppercase">{language}</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-[hsl(var(--surface))] rounded-lg shadow-xl border border-[hsl(var(--border))] overflow-hidden"
                    >
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code);
                                    setIsOpen(false);
                                }}
                                className={clsx(
                                    'w-full text-left px-4 py-2.5 text-sm hover:bg-[hsl(var(--background))] transition-colors',
                                    language === lang.code && 'text-[hsl(var(--primary))] font-medium bg-[hsl(var(--primary)/0.05)]'
                                )}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
