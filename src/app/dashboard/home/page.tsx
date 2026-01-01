'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, FileBarChart, Users, Settings, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

const SECTIONS = [
    {
        title: 'LC Management',
        description: 'Smart Dashboard, Real-time status, and Nearest Neighbour details.',
        icon: Activity,
        href: '/dashboard/lc-management',
        color: 'from-blue-500 to-cyan-400',
        shadow: 'shadow-blue-500/20'
    },
    {
        title: 'Admin Console',
        description: 'User, Role, and Master Data Management.',
        icon: Users,
        href: '/dashboard/admin',
        color: 'from-violet-500 to-purple-400',
        shadow: 'shadow-purple-500/20'
    },
    {
        title: 'Reports & Analytics',
        description: 'View and export system performance reports.',
        icon: FileBarChart,
        href: '/dashboard/reports',
        color: 'from-emerald-500 to-teal-400',
        shadow: 'shadow-emerald-500/20'
    },
    {
        title: 'Alert Status',
        description: 'View active theft attempts and trigger notifications.',
        icon: ShieldAlert,
        href: '/dashboard/alerts',
        color: 'from-red-500 to-orange-400',
        shadow: 'shadow-red-500/20'
    }
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

export default function DashboardHome() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
                    Welcome to Transformer Guard
                </h1>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
                {SECTIONS.map((section) => {
                    const Icon = section.icon;
                    return (
                        <motion.div key={section.title} variants={item}>
                            <Link href={section.href} className="group block h-full">
                                <div className={clsx(
                                    "relative h-full p-6 rounded-2xl bg-[hsl(var(--surface))] border border-[hsl(var(--border))] overflow-hidden transition-all duration-300 hover:-translate-y-1",
                                    "hover:shadow-xl", section.shadow
                                )}>
                                    {/* Gradient Blob Background */}
                                    <div className={clsx(
                                        "absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br opacity-10 group-hover:scale-150 transition-transform duration-500",
                                        section.color
                                    )} />

                                    <div className="relative">
                                        <div className={clsx(
                                            "w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white bg-gradient-to-br shadow-lg",
                                            section.color
                                        )}>
                                            <Icon size={24} />
                                        </div>

                                        <h3 className="text-xl font-bold mb-2 text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
                                            {section.title}
                                        </h3>
                                        <p className="text-[hsl(var(--muted-foreground))] text-sm mb-6">
                                            {section.description}
                                        </p>

                                        <div className="flex items-center text-sm font-semibold text-[hsl(var(--primary))] rounded-full bg-[hsl(var(--primary)/0.05)] w-fit px-4 py-2 group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-all">
                                            Enter Module <ArrowRight size={16} className="ml-2" />
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
