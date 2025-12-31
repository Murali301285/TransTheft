'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { clsx } from 'clsx';
import { Zap } from 'lucide-react';

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const pathname = usePathname();
    const isHomePage = pathname === '/dashboard/home';
    const isLCPage = pathname?.startsWith('/dashboard/lc-management');
    const isNeighborsPage = pathname === '/dashboard/neighbors';
    const isFullWidthPage = isHomePage || isLCPage || isNeighborsPage;

    return (
        <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col relative overflow-hidden">
            {/* Background for Main Dashboard */}
            {isHomePage && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-[0.03]">
                    {/* Giant Transformer/Electric Icon Watermark */}
                    <Zap size={800} strokeWidth={0.5} />
                </div>
            )}

            <Header
                onMenuClick={() => setIsSidebarOpen(true)}
                hideMenuTrigger={isFullWidthPage}
                hideSearch={isHomePage}
            />

            {!isFullWidthPage && (
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            )}

            <main className={clsx(
                "pt-16 min-h-screen transition-all flex flex-col pb-12",
                !isFullWidthPage && "lg:ml-64"
            )}>
                <div className={clsx(
                    "container py-8 animate-fade-in flex-1 relative z-10",
                    isFullWidthPage && "max-w-full px-6" // Use wider container for full-width pages
                )}>
                    {children}
                </div>
            </main>

            {/* Footer - Fixed */}
            <footer className={clsx(
                "fixed bottom-0 w-full py-2 text-center text-xs text-[hsl(var(--muted-foreground))] border-t border-[hsl(var(--border))] bg-[hsl(var(--surface-glass))] backdrop-blur-md z-30 transition-all",
                !isFullWidthPage && "lg:pl-64"
            )}>
                © 2026 TTM. All rights reserved. | Transformer Guard System v1.0
            </footer>
        </div>
    );
}
