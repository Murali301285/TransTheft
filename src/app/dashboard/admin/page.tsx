'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Zap, Smartphone, MapPin, ShieldCheck, FileText, Database, GitBranch, ArrowRight, Building2, ServerCog, Languages } from 'lucide-react';
import { clsx } from 'clsx';

const ADMIN_MODULES = [
    {
        title: 'API Configuration',
        description: 'Test & Configure API Endpoints.',
        icon: ServerCog,
        href: '/dashboard/admin/api-config',
        color: 'from-indigo-600 to-blue-500',
        shadow: 'shadow-indigo-500/20'
    },
    {
        title: 'Language Settings',
        description: 'Manage translations and text.',
        icon: Languages,
        href: '/dashboard/admin/language',
        color: 'from-pink-600 to-rose-500',
        shadow: 'shadow-pink-500/20'
    },
    {
        title: 'Company Master',
        description: 'Manage authorized utility companies.',
        icon: Building2,
        href: '/dashboard/admin/company',
        color: 'from-amber-500 to-yellow-400',
        shadow: 'shadow-amber-500/20'
    },
    {
        title: 'User Management',
        description: 'Manage users, roles, and permissions.',
        icon: Users,
        href: '/dashboard/admin/users',
        color: 'from-violet-500 to-purple-400',
        shadow: 'shadow-purple-500/20'
    },
    {
        title: 'Transformer Master',
        description: 'Add/Update transformers and bulk upload.',
        icon: Zap,
        href: '/dashboard/admin/transformers',
        color: 'from-blue-500 to-cyan-400',
        shadow: 'shadow-blue-500/20'
    },
    {
        title: 'SIM Card Master',
        description: 'Manage IOT SIM cards and mappings.',
        icon: Smartphone,
        href: '/dashboard/admin/sims',
        color: 'from-emerald-500 to-teal-400',
        shadow: 'shadow-emerald-500/20'
    },
    {
        title: 'Location Master',
        description: 'Circles, Divisions, and Feeders.',
        icon: MapPin,
        href: '/dashboard/admin/locations',
        color: 'from-orange-500 to-amber-400',
        shadow: 'shadow-orange-500/20'
    },
    {
        title: 'Network Hierarchy',
        description: 'Visualize the organization structure tree.',
        icon: GitBranch,
        href: '/dashboard/admin/hierarchy',
        color: 'from-sky-500 to-indigo-400',
        shadow: 'shadow-sky-500/20'
    },
    {
        title: 'Role & Access',
        description: 'Page allocation and menu security.',
        icon: ShieldCheck,
        href: '/dashboard/admin/roles',
        color: 'from-pink-500 to-rose-400',
        shadow: 'shadow-pink-500/20'
    },
    {
        title: 'Audit Logs',
        description: 'View system usage and security logs.',
        icon: FileText,
        href: '/dashboard/admin/logs',
        color: 'from-slate-500 to-gray-400',
        shadow: 'shadow-slate-500/20'
    },
    {
        title: 'System Settings',
        description: 'API paths, Configurations, Language.',
        icon: Database,
        href: '/dashboard/admin/settings',
        color: 'from-cyan-500 to-blue-400',
        shadow: 'shadow-cyan-500/20'
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring" as const,
            stiffness: 100
        }
    }
};

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
                    Administration
                </h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-2">
                    System configuration and Master Data Management
                </p>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                {ADMIN_MODULES.map((module) => {
                    const Icon = module.icon;
                    return (
                        <motion.div
                            key={module.title}
                            variants={item}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        >
                            <Link href={module.href} className="group block h-full">
                                <div className="relative h-full p-4 rounded-xl bg-white border border-[hsl(var(--border))] hover:shadow-md transition-all duration-200">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                                        <Icon size={20} />
                                    </div>

                                    <h3 className="font-bold text-[hsl(var(--foreground))] mb-1">
                                        {module.title}
                                    </h3>
                                    <p className="text-[hsl(var(--muted-foreground))] text-xs">
                                        {module.description}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}
