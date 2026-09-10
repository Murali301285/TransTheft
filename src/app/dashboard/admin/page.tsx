'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Zap, Smartphone, MapPin, ShieldCheck, FileText, Database, GitBranch, ArrowRight, Building2, ServerCog, Languages, Search, BookOpen, CircleDot } from 'lucide-react';
import { clsx } from 'clsx';
import { useLanguage } from '@/context/LanguageContext';
import { Input } from '@/components/ui/Input';

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
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');

    const modules = [
        {
            title: 'Language Settings',
            description: 'Manage translations and text.',
            icon: Languages,
            href: '/dashboard/admin/language',
            color: 'from-pink-600 to-rose-500',
            shadow: 'shadow-pink-500/20'
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
            title: 'SIM Card Master',
            description: 'Manage IOT SIM cards and mappings.',
            icon: Smartphone,
            href: '/dashboard/admin/sims',
            color: 'from-emerald-500 to-teal-400',
            shadow: 'shadow-emerald-500/20'
        },
        {
            title: 'Master Configuration',
            description: 'Manage Regions, Circles, Divisions, etc.',
            icon: MapPin,
            href: '/dashboard/admin/master-config',
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
            title: 'Device Mapping',
            description: 'Map Feeders to Masters and Transformers to Nodes.',
            icon: ServerCog,
            href: '/dashboard/admin/device-mapping',
            color: 'from-blue-600 to-indigo-500',
            shadow: 'shadow-blue-500/20'
        },
    ];

    const filteredModules = modules.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
                        {t('menu.admin')}
                    </h1>
                    <p className="text-[hsl(var(--muted-foreground))] mt-2 text-sm">
                        System configuration and Master Data Management
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                        className="pl-9 h-10 bg-white"
                        placeholder={t('search_modules') || "Search modules..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" // Increased gap to 6
            >
                {filteredModules.map((module) => {
                    const Icon = module.icon;
                    return (
                        <motion.div key={module.href + module.title} variants={item}>
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

                                        <h3 className="text-lg font-bold mb-2 text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
                                            {module.title}
                                        </h3>
                                        <p className="text-[hsl(var(--muted-foreground))] text-sm">
                                            {module.description}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
                {filteredModules.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-400">
                        <p>No modules found matching "{searchQuery}"</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
