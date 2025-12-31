'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { clsx } from 'clsx';
import { LayoutDashboard, Users, FileBarChart, Settings, ShieldAlert, Activity, GitBranch } from 'lucide-react';
import { useText } from '@/lib/i18n';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const MENU_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/home' },
    { icon: Activity, label: 'LC Management', path: '/dashboard/lc-management' },
    { icon: ShieldAlert, label: 'Alerts', path: '/dashboard/alerts' },
    { icon: FileBarChart, label: 'Reports', path: '/dashboard/reports' },
    { icon: GitBranch, label: 'Hierarchy', path: '/dashboard/hierarchy' },
    { icon: Users, label: 'Admin', path: '/dashboard/admin' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { t } = useText();

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={clsx(
                    "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Sidebar Content */}
            <aside className={clsx(
                "fixed top-16 left-0 bottom-0 z-40 w-64 bg-[hsl(var(--surface))] border-r border-[hsl(var(--border))] transition-transform duration-300 lg:translate-x-0 overflow-y-auto",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-4 space-y-1">
                    <div className="px-4 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                        Menu
                    </div>

                    {MENU_ITEMS.map((item) => {
                        const isActive = pathname.startsWith(item.path);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                href={item.path}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                    isActive
                                        ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]"
                                        : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--background))] hover:text-[hsl(var(--foreground))]"
                                )}
                                onClick={() => onClose()} // Close on mobile navigation
                            >
                                <Icon size={20} />
                                {item.label} {/* t(item.label.toLowerCase()) in real implementation */}
                            </Link>
                        );
                    })}
                </div>

                <div className="absolute bottom-4 left-0 w-full px-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(var(--secondary))] to-[hsl(var(--primary))] text-white text-center">
                        <p className="text-sm font-bold opacity-90">System Status</p>
                        <p className="text-2xl font-bold mt-1">Active</p>
                        <p className="text-xs opacity-70 mt-1">Uptime: 99.9%</p>
                    </div>
                </div>
            </aside>
        </>
    );
}
