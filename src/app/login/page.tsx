'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useText } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Mail, Lock, Eye, EyeOff, Zap, ShieldCheck } from 'lucide-react';
import { ApiService, TokenService } from '@/services/api';

const BACKGROUNDS = [
    'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900', // Deep Tech
    'bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900', // Modern
    'bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900', // Eco
];

export default function LoginPage() {
    const router = useRouter();
    const { t } = useText();
    const { login } = useAppStore();

    const [bgIndex, setBgIndex] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({ identifier: '', password: '' });



    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await ApiService.auth.login({
                userName: formData.identifier,
                password: formData.password
            });

            if (response.success && response.data) {
                TokenService.setToken(response.data.token, response.data.refreshToken);

                // In a real app, update this to decode JWT or fetch user details
                login({
                    id: '1',
                    name: formData.identifier,
                    email: formData.identifier,
                    role: 'admin',
                    permissions: ['all']
                });

                router.push('/dashboard/home');
            } else {
                // Show error (using window.alert for simplicity, usually Toast)
                window.alert(response.message || 'Login Failed. Please check credentials.');
            }
        } catch (error) {
            console.error('Login Error', error);
            window.alert('Network Error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`min-h-screen w-full relative flex items-center justify-center transition-colors duration-1000 ${BACKGROUNDS[bgIndex]}`}>
            {/* Background Toggle - User Requirement "option to change" */}
            <button
                onClick={() => setBgIndex((prev) => (prev + 1) % BACKGROUNDS.length)}
                className="absolute top-6 right-20 text-white/50 hover:text-white transition-colors"
                title="Change Theme"
            >
                <div className="w-6 h-6 rounded-full border border-current" />
            </button>

            {/* Header Icons Requirement */}
            <div className="absolute top-6 left-6 text-white flex items-center gap-2">
                <Zap className="h-8 w-8 text-[hsl(var(--warning))]" />
                <span className="font-bold text-xl tracking-tight hidden md:block">Transformer Guard</span>
            </div>

            <div className="absolute top-6 right-6">
                <LanguageSelector />
            </div>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[hsl(var(--primary)/0.2)] mb-4 ring-2 ring-[hsl(var(--primary)/0.5)]">
                        <ShieldCheck className="w-8 h-8 text-[hsl(var(--primary-foreground))]" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">{t('login')}</h2>
                    <p className="text-blue-200 text-sm">Secure Access Portal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <Input
                        placeholder="Mobile Number or Email"
                        value={formData.identifier}
                        onChange={e => setFormData({ ...formData, identifier: e.target.value })}
                        leftIcon={<Mail size={18} />}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[hsl(var(--primary))]"
                    />

                    <div className="relative">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t('password')}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            leftIcon={<Lock size={18} />}
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[hsl(var(--primary))]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 text-blue-200 cursor-pointer">
                            <input type="checkbox" className="rounded border-white/20 bg-transparent" />
                            Remember me
                        </label>
                        <button type="button" className="text-[hsl(var(--accent))] hover:underline">
                            Forgot Password?
                        </button>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]"
                        isLoading={isLoading}
                    >
                        {t('login')}
                    </Button>

                    <div className="text-center mt-6">
                        <p className="text-blue-200 text-sm">
                            New User? <button type="button" className="text-white font-semibold hover:underline">Sign Up</button>
                        </p>
                    </div>
                </form>
            </motion.div>

            {/* Footer */}
            <div className="absolute bottom-4 text-center w-full text-white/20 text-xs">
                © 2026 TTM Security Systems. All rights reserved.
            </div>
        </div>
    );
}
