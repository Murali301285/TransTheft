'use client';

import { TreeItem } from '@/components/Hierarchy/TreeItem';
import { HierarchyNode } from '@/lib/types';
import { Search, ArrowLeft, RefreshCw } from 'lucide-react';
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
        fetchFullHierarchy();
    }, []);

    const fetchFullHierarchy = async () => {
        setIsLoading(true);
        try {
            // Fetch ALL hierarchy levels parallelly
            const [
                companiesRes,
                regionsRes,
                circlesRes,
                divisionsRes,
                subDivisionsRes,
                substationsRes,
                transformersRes
            ] = await Promise.all([
                ApiService.company.getAll(),
                ApiService.locations.region.getAll(),
                ApiService.locations.circle.getAll(),
                ApiService.locations.division.getAll(),
                ApiService.locations.subDivision.getAll(),
                ApiService.locations.substation.getAll(),
                ApiService.transformers.getAll()
            ]);

            // Helper to extract data array safely from various API response formats
            const clean = (res: any) => {
                if (!res?.success) return [];
                const d = res.data;
                return Array.isArray(d) ? d : (d?.result || d?.response || []);
            };

            const companies = clean(companiesRes);
            const regions = clean(regionsRes);
            const circles = clean(circlesRes);
            const divisions = clean(divisionsRes);
            const subDivisions = clean(subDivisionsRes);
            const substations = clean(substationsRes);
            const transformers = clean(transformersRes);

            const tree = buildStrictTree(
                companies, regions, circles, divisions, subDivisions, substations, transformers
            );

            setHierarchy(tree);

        } catch (error) {
            console.error('Failed to fetch hierarchy', error);
            toast.error('Failed to load full network hierarchy.');
        } finally {
            setIsLoading(false);
        }
    };

    const buildStrictTree = (
        cos: any[], regs: any[], cirs: any[], divs: any[], subDivs: any[], substations: any[], transformers: any[]
    ): HierarchyNode[] => {

        // Helper to format node
        const toNode = (item: any, type: string, idField: string, nameField: string): HierarchyNode => ({
            id: `${type}-${item[idField] || Math.random()}`, // Fallback ID if missing
            name: item[nameField] || `Unknown ${type}`,
            type: type as any,
            children: [],
            data: item
        });

        // 1. Companies
        const companyNodes = cos.map(c => toNode(c, 'company', 'id', 'companyName'));

        // 2. Regions
        // Assuming Regions link to Company. If not, map all regions to the first Company for visualization.
        const regionNodes = regs.map(r => toNode(r, 'region', 'regionId', 'regionName'));

        // 3. Circles -> Region
        const circleNodes = cirs.map(c => toNode(c, 'circle', 'circleId', 'circleName'));
        regionNodes.forEach(r => {
            r.children = circleNodes.filter(c => c.data.regionId === r.data.regionId);
        });

        // 4. Divisions -> Circle
        const divisionNodes = divs.map(d => toNode(d, 'division', 'divisionId', 'divisionName'));
        circleNodes.forEach(c => {
            c.children = divisionNodes.filter(d => d.data.circleId === c.data.circleId);
        });

        // 5. SubDivisions -> Division
        const subDivNodes = subDivs.map(s => toNode(s, 'subDivision', 'subDivisionId', 'subDivisionName'));
        divisionNodes.forEach(d => {
            d.children = subDivNodes.filter(s => s.data.divisionId === d.data.divisionId);
        });

        // 6. Substations -> SubDivision
        const ssNodes = substations.map(s => toNode(s, 'substation', 'ssId', 'ssName')); // Updated ID keys to match API

        // Link SS to SubDiv
        // Note: API for Substation listing might return flattened list, ensuring we match correctly.
        // Assuming 'subDivisionId' is present in substation object from API.
        subDivNodes.forEach(sd => {
            sd.children = ssNodes.filter(ss => ss.data.subDivisionId === sd.data.subDivisionId);
        });

        // 7. Feeders -> Substation
        ssNodes.forEach(ssNode => {
            const rawFeeders = Array.isArray(ssNode.data.feeders) ? ssNode.data.feeders : [];

            const feederNodes = rawFeeders.map((f: any) => {
                // Create Feeder Node
                const fNode: HierarchyNode = {
                    id: `feeder-${f.fId || f.feederId}`,
                    name: f.fName || f.feederName || 'Unknown Feeder',
                    type: 'feeder' as any,
                    children: [],
                    data: f
                };

                // 8. Transformers -> Feeder
                // Link Transformers that belong to this Feeder
                // Transformer API response keys: 'feederId', 'transformerCode', 'capacityKVA'
                const childTransformers = transformers.filter(t =>
                    t.feederId === (f.fId || f.feederId)
                );

                fNode.children = childTransformers.map(t => ({
                    id: `transformer-${t.transformerCode || t.masterId}`,
                    name: t.transformerCode || t.masterName || 'Unknown Transformer', // Use Code as Name fallback
                    type: 'transformer' as any,
                    children: [],
                    data: t,
                    details: {
                        id: t.transformerCode,
                        name: t.transformerCode, // Fallback
                        status: 'active', // Default for now
                        capacity: t.capacityKVA || t.capacity,
                        lat: t.latitude,
                        lng: t.longitude,
                        address: t.address || '',
                        lastPing: new Date().toISOString(),
                        nearestCustomers: []
                    }
                }));

                return fNode;
            });

            ssNode.children = feederNodes;
        });

        // Nesting Regions under Company
        if (companyNodes.length > 0) {
            // Check if Regions have companyId. If not, add all to first company.
            // Most likely data is siloed to one company in this view.
            companyNodes[0].children = regionNodes;
            return companyNodes;
        }

        // Fallback if no companies exists but regions do
        return regionNodes.length > 0 ? regionNodes : [];
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin')} className="mb-2 pl-0 hover:bg-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                        <ArrowLeft size={16} className="mr-2" /> Back to Administration
                    </Button>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
                        Network Hierarchy
                    </h2>
                    <p className="text-[hsl(var(--muted-foreground))]">
                        Strict View: Company &rarr; Region &rarr; Circle &rarr; Division &rarr; SubDiv &rarr; SubStation &rarr; Feeder &rarr; Transformer
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchFullHierarchy} disabled={isLoading}>
                    <RefreshCw size={14} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-[hsl(var(--border))] shadow-sm flex flex-col h-full overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-[hsl(var(--border))] bg-slate-50 flex justify-between items-center">
                    <Input
                        placeholder="Search any node..."
                        leftIcon={<Search size={16} />}
                        className="max-w-md bg-white shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="text-xs text-[hsl(var(--muted-foreground))]">
                        {hierarchy.length > 0 ? `${hierarchy.length} Root Nodes` : 'No Data'}
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full text-[hsl(var(--muted-foreground))]">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin"></div>
                                <p>Building Network Hierarchy...</p>
                            </div>
                        </div>
                    ) : hierarchy.length > 0 ? (
                        hierarchy.map((node) => (
                            <TreeItem key={node.id} node={node} level={0} />
                        ))
                    ) : (
                        <div className="flex items-center justify-center h-full text-[hsl(var(--muted-foreground))]">
                            No hierarchy data found (Check API Connections).
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
