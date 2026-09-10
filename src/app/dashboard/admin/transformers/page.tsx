'use client';

import { useState, useEffect, useMemo } from 'react';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Upload, HardDrive, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BulkUpload } from '@/components/Admin/BulkUpload';
import { formatDate } from '@/lib/date-utils';
import { ApiService } from '@/services/api';
import { toast } from 'sonner';

// Type definition for Transformer Master
export interface TransformerMaster {
    id: string; // e.g., TR-1001
    name: string;
    capacity: string; // e.g., 100 KVA
    circle: string;
    division: string;
    subDivision: string;
    lat: number;
    lng: number;
    simNumber?: string;
    installDate: string;
    status: 'active' | 'inactive' | 'maintenance';
}

export default function TransformerMasterPage() {
    const router = useRouter();
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [transformers, setTransformers] = useState<TransformerMaster[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ masterCode: '', masterName: '', capacity: '', circle: '', division: '', latitude: 0, longitude: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateStatus = async (id: string, newStatus: boolean) => {
        // Optimistic Update
        setTransformers(prev => prev.map(t =>
            t.id === id ? { ...t, status: newStatus ? 'active' : 'inactive' } : t
        ));

        // API Call
        // API Call
        toast.promise(
            // ApiService.transformers.updateStatus(id, newStatus),
            new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000)), // Mock API for now
            {
                loading: 'Updating status...',
                success: (response: any) => {
                    // if (!response.success) {
                    //     // Throw to trigger error handling
                    //     throw new Error(response.message || 'Update failed');
                    // }
                    return 'Status updated successfully';
                },
                error: (err) => {
                    // Revert
                    setTransformers(prev => prev.map(t =>
                        t.id === id ? { ...t, status: !newStatus ? 'active' : 'inactive' } : t
                    ));
                    return err instanceof Error ? err.message : 'Failed to update status';
                }
            }
        );
    };

    const handleAdd = () => {
        setFormData({ masterCode: '', masterName: '', capacity: '', circle: '', division: '', latitude: 0, longitude: 0 });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await ApiService.transformers.create(formData);
            if (res.success) {
                toast.success('Transformer created successfully');
                setIsModalOpen(false);
                // Trigger refresh if possible, currently using useEffect only
                // Ideally extract fetch into function
                window.location.reload();
            } else {
                toast.error(res.message || 'Failed to create');
            }
        } catch (e) { toast.error('Network Error'); }
        finally { setIsSubmitting(false); }
    };

    const columns: ColumnDef<TransformerMaster>[] = useMemo(() => [
        { accessorKey: 'id', header: 'Transformer ID' },
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'capacity', header: 'Capacity' },
        { accessorKey: 'circle', header: 'Circle' },
        { accessorKey: 'division', header: 'Division' },
        {
            accessorKey: 'installDate',
            header: 'Install Date',
            cell: ({ row }) => formatDate(row.original.installDate)
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Switch
                        checked={row.original.status === 'active'}
                        onCheckedChange={(checked) => updateStatus(row.original.id, checked)}
                    />
                    <span className={`text-xs font-medium ${row.original.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                        {row.original.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                </div>
            )
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: () => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">Delete</Button>
                </div>
            )
        }
    ], []);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await ApiService.transformers.getAll();
                if (response.success && response.data) {
                    console.log('Transformers API Response:', response.data);

                    const rawData = response.data as any;
                    const list = Array.isArray(rawData) ? rawData : (rawData.response || rawData.result || []);

                    if (!Array.isArray(list)) {
                        console.error('Transformers API Error: Expected array, got:', rawData);
                        toast.error('Invalid data format received from server');
                        setTransformers([]);
                        return;
                    }

                    const mapped: TransformerMaster[] = list.map((item: any) => ({
                        id: item.masterCode || `TR-${item.masterId}`,
                        name: item.masterName || `Transformer ${item.masterId}`,
                        capacity: item.capacity || item.Capacity || '100 KVA',
                        circle: item.circleName || item.CircleName || item.circle || 'N/A',
                        division: item.divisionName || item.DivisionName || item.division || 'N/A',
                        subDivision: item.subDivision || item.SubDivision || 'N/A',
                        lat: item.latitude || item.Latitude || 0,
                        lng: item.longitude || item.Longitude || 0,
                        simNumber: item.simNumber || item.SimNumber,
                        installDate: item.installedOn || item.InstalledOn || new Date().toISOString(),
                        status: item.isOnline ? 'active' : 'inactive'
                    }));
                    setTransformers(mapped);
                } else {
                    toast.error(response.message || 'Failed to fetch transformers');
                }
            } catch (error) {
                console.error("Failed to fetch transformers", error);
                toast.error('Network Error: Could not fetch data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[hsl(var(--border))] shadow-sm mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin')}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                            <HardDrive className="text-blue-600" /> Transformer Master
                        </h1>
                        <p className="text-xs text-muted-foreground">Manage transformer inventory and details.</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsBulkMode(!isBulkMode)}
                    >
                        {isBulkMode ? <HardDrive size={14} className="mr-2" /> : <Upload size={14} className="mr-2" />}
                        {isBulkMode ? "View List" : "Bulk Upload"}
                    </Button>
                    {!isBulkMode && (
                        <Button size="sm" className="bg-blue-600 text-white" onClick={handleAdd}>
                            <Plus size={16} className="mr-2" /> Add New
                        </Button>
                    )}
                </div>
            </div>

            <div className="bg-[hsl(var(--surface))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm animate-fade-in">
                {isBulkMode ? (
                    <BulkUpload
                        type="transformer"
                        onCommit={async () => setIsBulkMode(false)}
                        onCancel={() => setIsBulkMode(false)}
                    />
                ) : (
                    <DataTable
                        columns={columns}
                        data={transformers}
                        searchKey="name"
                        isLoading={isLoading}
                        exportFileName="Transformers"
                        exportTitle="Transformers List"
                    />
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Transformer"
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <Input
                        label="Master Code / ID"
                        value={formData.masterCode}
                        onChange={(e) => setFormData({ ...formData, masterCode: e.target.value })}
                        required
                    />
                    <Input
                        label="Transformer Name"
                        value={formData.masterName}
                        onChange={(e) => setFormData({ ...formData, masterName: e.target.value })}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Capacity"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        />
                        <Input
                            label="Circle"
                            value={formData.circle}
                            onChange={(e) => setFormData({ ...formData, circle: e.target.value })}
                        />
                    </div>
                    <Input
                        label="Division"
                        value={formData.division}
                        onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Latitude"
                            type="number"
                            value={formData.latitude}
                            onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                        />
                        <Input
                            label="Longitude"
                            type="number"
                            value={formData.longitude}
                            onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white">Save</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
