'use client';

import { TreeItem } from '@/components/Hierarchy/TreeItem';
import { HierarchyNode } from '@/lib/types';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';

// Deep Mock Data
const MOCK_HIERARCHY: HierarchyNode[] = [
    {
        id: 'C-01',
        name: 'Bangalore South Circle',
        type: 'circle',
        children: [
            {
                id: 'D-01',
                name: 'Jayanagar Division',
                type: 'division',
                children: [
                    {
                        id: 'SD-01',
                        name: 'Jayanagar 4th Block',
                        type: 'sub_division',
                        children: [
                            {
                                id: 'F-01',
                                name: 'Feeder F1',
                                type: 'feeder',
                                children: [
                                    { id: 'TR-101', name: 'Transformer 101', type: 'transformer', details: { id: 'TR-101', name: 'Transformer 101', lat: 0, lng: 0, capacity: '100', status: 'active', lastPing: '', address: '', nearestCustomers: [] } },
                                    { id: 'TR-102', name: 'Transformer 102', type: 'transformer', details: { id: 'TR-102', name: 'Transformer 102', lat: 0, lng: 0, capacity: '100', status: 'alert', lastPing: '', address: '', nearestCustomers: [] } },
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 'D-02',
                name: 'Koramangala Division',
                type: 'division',
                children: [
                    {
                        id: 'SD-02',
                        name: 'Koramangala 1st Block',
                        type: 'sub_division',
                        children: [
                            {
                                id: 'F-02',
                                name: 'Feeder F2',
                                type: 'feeder',
                                children: [
                                    { id: 'TR-201', name: 'Transformer 201', type: 'transformer', details: { id: 'TR-201', name: 'Transformer 201', lat: 0, lng: 0, capacity: '250', status: 'active', lastPing: '', address: '', nearestCustomers: [] } },
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
];

export default function HierarchyPage() {
    const [searchTerm, setSearchTerm] = useState('');

    // In a real app, search would filter the tree structure.
    // For now, we will just display the tree.

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-6">
                <h2 className="text-2xl font-bold">Network Hierarchy</h2>
                <p className="text-[hsl(var(--muted-foreground))]">Visual representation of the transformer network</p>
            </div>

            <div className="bg-white rounded-xl border border-[hsl(var(--border))] shadow-sm flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-[hsl(var(--border))] bg-slate-50">
                    <Input
                        placeholder="Search Transformer or Division..."
                        leftIcon={<Search size={16} />}
                        className="max-w-md bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-auto p-4">
                    {MOCK_HIERARCHY.map((node) => (
                        <TreeItem key={node.id} node={node} level={0} />
                    ))}
                </div>
            </div>
        </div>
    );
}
