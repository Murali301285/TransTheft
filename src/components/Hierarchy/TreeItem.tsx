'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, Zap, MapPin, Warehouse, ZapOff } from 'lucide-react';
import { HierarchyNode } from '@/lib/types';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

import { Tooltip } from '@/components/ui/Tooltip';

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
            case 'feeder': return <ZapOff size={14} className="text-orange-600" />;
            case 'transformer': return <Zap size={14} className="text-[hsl(var(--primary))]" />;
            default: return <Warehouse size={16} />;
        }
    };

    const getNodeDetails = (n: HierarchyNode) => {
        const d = n.data || {};

        // Helper specifically for Transformer
        if (n.type === 'transformer') {
            return (
                <div className="space-y-2">
                    <div className="font-bold border-b pb-1 mb-1 text-slate-800">{n.name}</div>
                    <div className="grid grid-cols-[80px_1fr] gap-x-2 gap-y-1">
                        <span className="text-slate-500">Device ID:</span>
                        <span className="font-mono">{d.transformerCode || d.masterCode || '-'}</span>

                        <span className="text-slate-500">Capacity:</span>
                        <span>{d.capacityKVA || d.capacity || '-'} KVA</span>

                        <span className="text-slate-500">Status:</span>
                        <span className={clsx(d.isOnline ? "text-green-600 font-bold" : "text-yellow-600")}>
                            {d.isOnline ? 'Online' : 'Active'}
                        </span>

                        {(d.ownerName || d.ownerPhoneNo) && (
                            <>
                                <div className="col-span-2 text-[10px] font-bold text-slate-400 mt-1 uppercase">Owner Details</div>
                                <span className="text-slate-500">Name:</span>
                                <span>{d.ownerName || '-'}</span>
                                <span className="text-slate-500">Phone:</span>
                                <span>{d.ownerPhoneNo || '-'}</span>
                            </>
                        )}

                        {(d.neighborName || d.neighborPhoneNo) && (
                            <>
                                <div className="col-span-2 text-[10px] font-bold text-slate-400 mt-1 uppercase">Neighbor Details</div>
                                <span className="text-slate-500">Name:</span>
                                <span>{d.neighborName || '-'}</span>
                                <span className="text-slate-500">Phone:</span>
                                <span>{d.neighborPhoneNo || '-'}</span>
                            </>
                        )}

                        {(d.latitude && d.longitude) && (
                            <div className="col-span-2 text-[10px] text-blue-500 mt-1 flex items-center gap-1">
                                <MapPin size={10} /> Location Available
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Generic fallback for other nodes is intentionally removed to satisfy user request
        return null;
    };

    const RowContent = (
        <div
            onClick={() => hasChildren && setIsOpen(!isOpen)}
            className={clsx(
                "flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[hsl(var(--surface))] cursor-pointer transition-colors border border-transparent group",
                isOpen && "bg-[hsl(var(--surface))]",
                !hasChildren && "cursor-default opacity-90"
            )}
            style={{ marginLeft: `${level * 1.5}rem` }}
        >
            <div className="w-4 flex-shrink-0">
                {hasChildren && (
                    <span className="text-[hsl(var(--muted-foreground))] transition-transform">
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                )}
            </div>

            <div className="p-1.5 rounded-md bg-white border border-[hsl(var(--border))] shadow-sm text-[hsl(var(--primary))] group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-colors">
                {getIcon(node.type)}
            </div>

            <div className="flex flex-col">
                <span className="font-medium text-sm text-[hsl(var(--foreground))]">{node.name}</span>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))] uppercase font-bold tracking-wider">{node.type.replace('_', ' ')}</span>
                    {/* Small ID Badge */}
                    {node.type === 'transformer' && node.data?.transformerCode && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1 rounded border border-slate-200">{node.data.transformerCode}</span>
                    )}
                </div>
            </div>

            {node.type === 'transformer' && node.details && (
                <div className={clsx(
                    "ml-auto text-xs px-2 py-0.5 rounded-full border hidden sm:block",
                    node.details.status === 'active' ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 text-red-700"
                )}>
                    {node.details.status}
                </div>
            )}
        </div>
    );

    return (
        <div className="select-none">
            {node.type === 'transformer' ? (
                <Tooltip content={getNodeDetails(node)}>
                    {RowContent}
                </Tooltip>
            ) : (
                RowContent
            )}

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
