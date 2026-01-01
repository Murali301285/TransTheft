'use client';

import { useState } from 'react';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { Plus, Upload, HardDrive, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BulkUpload } from '@/components/Admin/BulkUpload';
import { clsx } from "clsx";
import { formatDate } from '@/lib/date-utils';

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
const MOCK_SIMS: SimMaster[] = Array.from({ length: 20 }).map((_, i) => ({
    id: `SIM-${5000 + i}`,
    imei: `86492004${100000 + i}`,
    phoneNumber: `98765${10000 + i}`,
    provider: i % 3 === 0 ? 'Airtel' : i % 3 === 1 ? 'Jio' : 'VI',
    planExpiry: '2025-12-31',
    linkedTransformerId: i % 2 === 0 ? `TR-${1000 + i}` : undefined,
    status: i % 10 === 0 ? 'expired' : 'active'
}));

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin')} className="mb-2 pl-0 hover:bg-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                        <ArrowLeft size={16} className="mr-2" /> Back to Administration
                    </Button>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
                        SIM Card Master
                    </h2>
                    <p className="text-[hsl(var(--muted-foreground))]">Manage Connectivity and IOT SIMs.</p>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant={isBulkMode ? "secondary" : "outline"}
                        onClick={() => setIsBulkMode(!isBulkMode)}
                    >
                        {isBulkMode ? <HardDrive size={16} className="mr-2" /> : <Upload size={16} className="mr-2" />}
                        {isBulkMode ? "View List" : "Bulk Upload"}
                    </Button>
                    {!isBulkMode && (
                        <Button>
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
                        data={MOCK_SIMS}
                        searchKey="phoneNumber"
                    />
                )}
            </div>
        </div>
    );
}
