'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Zap, Smartphone, MapPin, ShieldCheck, FileText, Database, GitBranch, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

const ADMIN_MODULES = [
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
    show: { y: 0, opacity: 1 }
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
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
                {ADMIN_MODULES.map((module) => {
                    const Icon = module.icon;
                    return (
                        <motion.div key={module.title} variants={item}>
                            <Link href={module.href} className="group block h-full">
                                <div className={clsx(
                                    "relative h-full p-6 rounded-2xl bg-[hsl(var(--surface))] border border-[hsl(var(--border))] overflow-hidden transition-all duration-300 hover:-translate-y-1",
                                    "hover:shadow-xl", module.shadow
                                )}>
                                    {/* Gradient Blob Background */}
                                    <div className={clsx(
                                        "absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br opacity-10 group-hover:scale-150 transition-transform duration-500",
                                        module.color
                                    )} />

                                    <div className="relative">
                                        <div className={clsx(
                                            "w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white bg-gradient-to-br shadow-lg",
                                            module.color
                                        )}>
                                            <Icon size={24} />
                                        </div>

                                        <h3 className="text-xl font-bold mb-2 text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
                                            {module.title}
                                        </h3>
                                        <p className="text-[hsl(var(--muted-foreground))] text-sm mb-6">
                                            {module.description}
                                        </p>

                                        <div className="flex items-center text-sm font-semibold text-[hsl(var(--primary))] rounded-full bg-[hsl(var(--primary)/0.05)] w-fit px-4 py-2 group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-all">
                                            Open Module <ArrowRight size={16} className="ml-2" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
}
