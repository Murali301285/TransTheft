'use client';

import { TreeItem } from '@/components/Hierarchy/TreeItem';
import { HierarchyNode } from '@/lib/types';
import { Search, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ApiService } from '@/services/api';
import { toast } from 'sonner';

export default function HierarchyPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAndBuildTree = async () => {
            setIsLoading(true);
            try {
                // We build hierarchy from the bottom up using Transformers data
                // This ensures the tree reflects actual deployed devices
                const response = await ApiService.transformers.getAll();

                if (response.success && response.data) {
                    const rawData = response.data as any;
                    const list = Array.isArray(rawData) ? rawData : (rawData.response || rawData.result || []);

                    if (Array.isArray(list)) {
                        const tree = buildTree(list);
                        setHierarchy(tree);
                    } else {
                        toast.error('Invalid data format for hierarchy');
                    }
                }
            } catch (error) {
                console.error('Failed to build hierarchy', error);
                toast.error('Network Error: Could not fetch hierarchy data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndBuildTree();
    }, []);

    const buildTree = (transformers: any[]): HierarchyNode[] => {
        const circleMap: Record<string, HierarchyNode> = {};

        transformers.forEach(t => {
            const circleName = t.circleName || t.CircleName || t.circle || 'Unassigned Circle';
            const divisionName = t.divisionName || t.DivisionName || t.division || 'Unassigned Division';

            // 1. Ensure Circle Exists
            if (!circleMap[circleName]) {
                circleMap[circleName] = {
                    id: `C-${circleName}`,
                    name: circleName,
                    type: 'circle',
                    children: []
                };
            }

            // 2. Ensure Division Exists within Circle
            let divisionNode = circleMap[circleName].children?.find(c => c.name === divisionName);
            if (!divisionNode) {
                divisionNode = {
                    id: `D-${divisionName}-${circleName}`,
                    name: divisionName,
                    type: 'division',
                    children: []
                };
                circleMap[circleName].children?.push(divisionNode);
            }

            // 3. Add Transformer to Division
            // Note: We skip 'SubDivision' and 'Feeder' levels for now as API data might optionally have them
            // If API has them, we can nest further. For now -> Circle -> Division -> Transformer
            divisionNode.children?.push({
                id: t.masterCode || `TR-${t.masterId}`,
                name: t.masterName || `TR-${t.masterId}`,
                type: 'transformer',
                details: {
                    id: t.masterCode,
                    name: t.masterName,
                    lat: t.latitude || 0,
                    lng: t.longitude || 0,
                    capacity: t.capacity || '100 KVA',
                    status: t.isOnline ? 'active' : 'inactive',
                    lastPing: new Date().toISOString(),
                    address: t.address || '',
                    nearestCustomers: []
                }
            });
        });

        return Object.values(circleMap);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-6">
                <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin')} className="mb-2 pl-0 hover:bg-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                    <ArrowLeft size={16} className="mr-2" /> Back to Administration
                </Button>
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
                    Network Hierarchy
                </h2>
                <p className="text-[hsl(var(--muted-foreground))]">Real-time organizational structure based on deployed transformers.</p>
            </div>

            <div className="bg-white rounded-xl border border-[hsl(var(--border))] shadow-sm flex flex-col h-full overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-[hsl(var(--border))] bg-slate-50 flex justify-between items-center">
                    <Input
                        placeholder="Search Circle, Division or Transformer..."
                        leftIcon={<Search size={16} />}
                        className="max-w-md bg-white shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        Showing {hierarchy.length} Circles
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-[hsl(var(--muted-foreground))]">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin"></div>
                                <p>Loading Hierarchy...</p>
                            </div>
                        </div>
                    ) : hierarchy.length > 0 ? (
                        hierarchy.map((node) => (
                            <TreeItem key={node.id} node={node} level={0} />
                        ))
                    ) : (
                        <div className="flex items-center justify-center h-full text-[hsl(var(--muted-foreground))]">
                            No hierarchy data found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
