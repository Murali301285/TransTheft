'use client';

import { Bell, Menu, Search, User, LogOut } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function Header({ onMenuClick, hideMenuTrigger = false, hideSearch = false }: { onMenuClick: () => void, hideMenuTrigger?: boolean, hideSearch?: boolean }) {
    const { user, logout } = useAppStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <header className="h-16 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-glass))] backdrop-blur-lg fixed top-0 w-full z-40 flex items-center justify-between px-4 lg:px-6 shadow-sm">
            {/* Left Corner: Menu & Brand Icon */}
            <div className="flex items-center gap-4">
                {!hideMenuTrigger && (
                    <button
                        onClick={onMenuClick}
                        className="p-2 hover:bg-[hsl(var(--muted-foreground)/0.1)] rounded-full lg:hidden"
                    >
                        <Menu size={24} />
                    </button>
                )}
                <Link href="/dashboard/home" className="flex items-center gap-2 text-[hsl(var(--primary))] cursor-pointer hover:opacity-80 transition-opacity">
                    {/* Requirement: "icon to both and right corner" - Left Icon */}
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center text-white font-bold">
                        TG
                    </div>
                    <span className="font-bold text-lg hidden sm:block">Transformer Guard</span>
                </Link>
            </div>

            {/* Right Corner: Utilities */}
            <div className="flex items-center gap-4">
                {!hideSearch && (
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" size={16} />
                        <input
                            type="text"
                            placeholder="Search Transformer/Customer..."
                            className="pl-9 pr-4 py-2 rounded-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] w-64 transition-all"
                        />
                    </div>
                )}

                <LanguageSelector />

                <button className="relative p-2 hover:bg-[hsl(var(--muted-foreground)/0.1)] rounded-full text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[hsl(var(--danger))] rounded-full border-2 border-[hsl(var(--surface))]" />
                </button>

                <div className="h-8 w-[1px] bg-[hsl(var(--border))]" />

                <div className="flex items-center gap-3">
                    <div className="hidden md:block text-right">
                        <p className="text-sm font-medium">{user?.name || 'Guest'}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] uppercase">{user?.role || 'Viewer'}</p>
                    </div>
                    <button
                        className="w-10 h-10 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-[hsl(var(--primary))]"
                    >
                        <User size={20} />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger)/0.1)] rounded-full"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
}
