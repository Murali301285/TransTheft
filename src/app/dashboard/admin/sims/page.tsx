'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Upload, HardDrive, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BulkUpload } from '@/components/Admin/BulkUpload';
import { clsx } from "clsx";
import { formatDate } from '@/lib/date-utils';
import { ApiService } from '@/services/api';
import { toast } from 'sonner';

// Type definition for SIM Master
export interface SimMaster {
    id: string;
    imei: string;
    phoneNumber: string;
    provider: 'Airtel' | 'Jio' | 'VI' | 'BSNL';
    planExpiry: string;
    linkedTransformerId?: string; // Optional linkage
    status: 'active' | 'inactive' | 'expired';
}

// Mock Data
const MOCK_SIMS: SimMaster[] = [];

const COLUMNS: ColumnDef<SimMaster>[] = [
    { accessorKey: 'id', header: 'SIM ID' },
    { accessorKey: 'phoneNumber', header: 'Phone Number' },
    { accessorKey: 'imei', header: 'IMEI' },
    {
        accessorKey: 'provider',
        header: 'Provider',
        cell: ({ row }) => (
            <span className={clsx(
                "px-2 py-0.5 rounded text-xs font-medium border",
                row.original.provider === 'Airtel' && "bg-red-50 text-red-700 border-red-200",
                row.original.provider === 'Jio' && "bg-blue-50 text-blue-700 border-blue-200",
                row.original.provider === 'VI' && "bg-orange-50 text-orange-700 border-orange-200"
            )}>
                {row.original.provider}
            </span>
        )
    },
    {
        accessorKey: 'planExpiry',
        header: 'Plan Expiry',
        cell: ({ row }) => formatDate(row.original.planExpiry)
    },
    {
        accessorKey: 'linkedTransformerId',
        header: 'Linked TR',
        cell: ({ getValue }) => getValue() ? (
            <span className="text-blue-600 font-medium cursor-pointer hover:underline">{getValue() as string}</span>
        ) : (
            <span className="text-gray-400 italic">Unassigned</span>
        )
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
            <span className={clsx(
                "w-2 h-2 rounded-full inline-block mr-2",
                row.original.status === 'active' ? "bg-green-500" : "bg-red-500"
            )}>
                {row.original.status}
            </span>
        )
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: () => (
            <div className="flex gap-2">
                <Button variant="ghost" size="sm">Edit</Button>
            </div>
        )
    }
];

export default function SimMasterPage() {
    const router = useRouter();
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [sims, setSims] = useState<SimMaster[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ phoneNumber: '', imei: '', provider: 'Airtel', planExpiry: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchSims = async () => {
        setIsLoading(true);
        try {
            const res = await ApiService.sims.getAll();
            if (res.success && res.data) {
                const list = Array.isArray(res.data) ? res.data : (res.data as any).result || [];
                setSims(list);
            }
        } catch (e) { toast.error("Failed to fetch SIMs"); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchSims(); }, []);

    const handleAdd = () => {
        setFormData({ phoneNumber: '', imei: '', provider: 'Airtel', planExpiry: '' });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await ApiService.sims.create(formData);
            if (res.success) {
                toast.success("SIM added successfully");
                setIsModalOpen(false);
                fetchSims();
            } else {
                toast.error(res.message || "Failed to add SIM");
            }
        } catch (e) { toast.error("Network Error"); }
        finally { setIsSubmitting(false); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[hsl(var(--border))] shadow-sm mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin')}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                            <HardDrive className="text-blue-600" /> SIM Card Master
                        </h1>
                        <p className="text-xs text-muted-foreground">Manage Connectivity and IOT SIMs.</p>
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
                        type="sim"
                        onCommit={async () => setIsBulkMode(false)}
                        onCancel={() => setIsBulkMode(false)}
                    />
                ) : (
                    <DataTable
                        columns={COLUMNS}
                        data={sims}
                        searchKey="phoneNumber"
                        isLoading={isLoading}
                        exportFileName="SIMs"
                        exportTitle="SIMs List"
                    />
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New SIM Card"
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <Input
                        label="Phone Number"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        required
                    />
                    <Input
                        label="IMEI"
                        value={formData.imei}
                        onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                        required
                    />
                    <div>
                        <label className="text-sm font-medium mb-1 block">Provider</label>
                        <select
                            className="w-full border rounded-md p-2 text-sm"
                            value={formData.provider}
                            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                        >
                            <option value="Airtel">Airtel</option>
                            <option value="Jio">Jio</option>
                            <option value="VI">VI</option>
                            <option value="BSNL">BSNL</option>
                        </select>
                    </div>
                    <Input
                        label="Plan Expiry"
                        type="date"
                        value={formData.planExpiry}
                        onChange={(e) => setFormData({ ...formData, planExpiry: e.target.value })}
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white">Save</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
