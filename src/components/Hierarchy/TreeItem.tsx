'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Zap, MapPin, Warehouse, ZapOff } from 'lucide-react';
import { HierarchyNode } from '@/lib/types';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface TreeItemProps {
    node: HierarchyNode;
    level: number;
}

export function TreeItem({ node, level }: TreeItemProps) {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = node.children && node.children.length > 0;

    const getIcon = (type: HierarchyNode['type']) => {
        switch (type) {
            case 'circle': return <Warehouse size={18} className="text-purple-600" />;
            case 'division': return <MapPin size={16} className="text-blue-600" />;
            case 'sub_division': return <MapPin size={14} className="text-cyan-600" />;
            case 'feeder': return <ZapOff size={14} className="text-orange-600" />; // Icon for path
            case 'transformer': return <Zap size={14} className="text-[hsl(var(--primary))]" />;
            default: return <Warehouse size={16} />;
        }
    };

    return (
        <div className="select-none">
            <div
                onClick={() => hasChildren && setIsOpen(!isOpen)}
                className={clsx(
                    "flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[hsl(var(--background))] cursor-pointer transition-colors border border-transparent",
                    isOpen && "bg-[hsl(var(--background))]",
                    !hasChildren && "cursor-default opacity-80"
                )}
                style={{ marginLeft: `${level * 1.5}rem` }}
            >
                <div className="w-4 flex-shrink-0">
                    {hasChildren && (
                        <span className="text-[hsl(var(--muted-foreground))]">
                            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </span>
                    )}
                </div>

                <div className="p-1.5 rounded-md bg-[hsl(var(--surface))] border border-[hsl(var(--border))] shadow-sm">
                    {getIcon(node.type)}
                </div>

                <div className="flex flex-col">
                    <span className="font-medium text-sm">{node.name}</span>
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase font-bold tracking-wider">{node.type.replace('_', ' ')}</span>
                </div>

                {node.type === 'transformer' && node.details && (
                    <div className={clsx(
                        "ml-auto text-xs px-2 py-0.5 rounded-full border",
                        node.details.status === 'active' ? "bg-green-100 border-green-200 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                        {node.details.status}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isOpen && hasChildren && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        {node.children!.map((child) => (
                            <TreeItem key={child.id} node={child} level={level + 1} />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
