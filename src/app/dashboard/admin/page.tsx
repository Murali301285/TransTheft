'use client';

import Link from 'next/link';
import { Users, Zap, Smartphone, MapPin, Building2, ShieldCheck, Database, FileText } from 'lucide-react';
import { clsx } from 'clsx';

const ADMIN_MODULES = [
    { title: 'User Management', icon: Users, href: '/dashboard/admin/users', desc: 'Manage users, roles, and permissions' },
    { title: 'Transformer Master', icon: Zap, href: '/dashboard/admin/transformers', desc: 'Add/Update transformers and bulk upload' },
    { title: 'SIM Card Master', icon: Smartphone, href: '/dashboard/admin/sims', desc: 'Manage IOT SIM cards and mappings' },
    { title: 'Location Master', icon: MapPin, href: '/dashboard/admin/locations', desc: 'Circles, Divisions, and Feeders' },
    { title: 'Role & Access', icon: ShieldCheck, href: '/dashboard/admin/roles', desc: 'Page allocation and menu security' },
    { title: 'Audit Logs', icon: FileText, href: '/dashboard/admin/logs', desc: 'View system usage and security logs' },
    { title: 'System Settings', icon: Database, href: '/dashboard/admin/settings', desc: 'API paths, Configurations, Language' },
];

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Administration</h1>
                <p className="text-[hsl(var(--muted-foreground))]">System configuration and Master Data Management</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {ADMIN_MODULES.map((mod) => {
                    const Icon = mod.icon;
                    return (
                        <Link href={mod.href} key={mod.title} className="group">
                            <div className="h-full p-5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="mb-4 w-10 h-10 rounded-lg bg-[hsl(var(--primary)/0.1)] flex items-center justify-center text-[hsl(var(--primary))] group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-colors">
                                    <Icon size={20} />
                                </div>
                                <h3 className="font-semibold text-lg mb-1">{mod.title}</h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">{mod.desc}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
