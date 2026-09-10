'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Mail, Lock, Eye, EyeOff, Zap, ShieldCheck, KeyRound } from 'lucide-react';
import { ApiService, TokenService } from '@/services/api';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';

export default function LoginPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const { login } = useAppStore();

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ identifier: '', password: '' });

    // Forgot Password States
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
    const [resetIdentifier, setResetIdentifier] = useState('');
    const [isResetSending, setIsResetSending] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await ApiService.auth.login({
                userName: formData.identifier,
                password: formData.password
            });

            if (response.success && response.data) {
                console.log('Login API Response:', response.data);

                const apiData = response.data as any;
                const innerResponse = apiData.response || apiData.result || apiData;

                const token = innerResponse.accessToken || innerResponse.token || innerResponse.Token;
                const refreshToken = innerResponse.refreshToken || innerResponse.RefreshToken;

                if (!token) {
                    console.error('Login Failed: No accessToken found in response', apiData);
                    window.alert('Login failed: Server did not return an access token.');
                    setIsLoading(false);
                    return;
                }

                TokenService.setToken(token, refreshToken);

                login({
                    id: innerResponse.userId?.toString() || '1',
                    name: innerResponse.userName || formData.identifier,
                    email: formData.identifier,
                    role: innerResponse.role?.toLowerCase() || 'viewer',
                    permissions: ['all']
                });

                console.log('Login Successful. Token saved.');
                router.push('/dashboard/home');
            } else {
                window.alert(response.message || 'Login Failed. Please check credentials.');
            }
        } catch (error) {
            console.error('Login Error', error);
            window.alert('Network Error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetIdentifier.trim()) {
            toast.error("Please enter your registered Email or Mobile Number");
            return;
        }

        setIsResetSending(true);
        // Simulate reset instructions trigger
        setTimeout(() => {
            setIsResetSending(false);
            setIsForgotPasswordOpen(false);
            toast.success(`Password reset instructions sent to ${resetIdentifier}`);
            setResetIdentifier('');
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Header Icons */}
            <div className="absolute top-6 left-6 text-white flex items-center gap-2">
                <Zap className="h-8 w-8 text-[hsl(var(--warning))]" />
                <span className="font-bold text-xl tracking-tight hidden md:block">Transformer Guard</span>
            </div>

            {/* Header Controls */}
            <div className="absolute top-6 right-6 z-50">
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
                    <p className="text-blue-200 text-sm">{t('secure_portal') || 'Secure Access Portal'}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <Input
                        placeholder={t('username_placeholder') || "Mobile Number or Email"}
                        value={formData.identifier}
                        onChange={e => setFormData({ ...formData, identifier: e.target.value })}
                        leftIcon={<Mail size={18} />}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[hsl(var(--primary))]"
                    />

                    <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('password')}
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        leftIcon={<Lock size={18} />}
                        rightIcon={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-white/50 hover:text-white focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        }
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[hsl(var(--primary))]"
                    />

                    <div className="flex justify-end text-sm">
                        <button
                            type="button"
                            onClick={() => setIsForgotPasswordOpen(true)}
                            className="text-[hsl(var(--accent))] hover:underline text-blue-200"
                        >
                            {t('forgot_password') || 'Forgot Password?'}
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
                            {t('new_user') || 'New User?'} <button type="button" onClick={() => router.push('/signup')} className="text-white font-semibold hover:underline">{t('sign_up') || 'Sign Up'}</button>
                        </p>
                    </div>
                </form>
            </motion.div>

            {/* Forgot Password Modal */}
            <Modal
                isOpen={isForgotPasswordOpen}
                onClose={() => setIsForgotPasswordOpen(false)}
                title="Reset Password"
            >
                <form onSubmit={handleResetSubmit} className="space-y-6 py-2">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto text-blue-600 ring-4 ring-blue-50">
                        <KeyRound size={32} />
                    </div>
                    
                    <div className="text-center space-y-2">
                        <h4 className="text-lg font-bold text-slate-900">Forgot Password</h4>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">
                            Enter your registered Email or Mobile Number below, and we will send you password reset instructions.
                        </p>
                    </div>

                    <Input
                        label="Email Address or Mobile Number"
                        placeholder="e.g. user@example.com or +919876543210"
                        value={resetIdentifier}
                        onChange={e => setResetIdentifier(e.target.value)}
                        required
                    />

                    <div className="flex gap-3 justify-end pt-4 border-t">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsForgotPasswordOpen(false)}
                            className="text-slate-600 bg-slate-100 hover:bg-slate-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            isLoading={isResetSending}
                        >
                            Send Reset Instructions
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Footer */}
            <div className="absolute bottom-4 text-center w-full text-white/20 text-xs">
                © 2026 TTM Security Systems. All rights reserved.
            </div>
        </div>
    );
}
