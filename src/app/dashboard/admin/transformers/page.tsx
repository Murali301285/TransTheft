'use client';

import { useState } from 'react';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { Plus, Upload, HardDrive, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BulkUpload } from '@/components/Admin/BulkUpload';
import { formatDate } from '@/lib/date-utils';

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

// Mock Data
const MOCK_TRANSFORMERS: TransformerMaster[] = Array.from({ length: 20 }).map((_, i) => ({
    id: `TR-${2000 + i}`,
    name: `Transformer ${2000 + i}`,
    capacity: '100 KVA',
    circle: 'North Circle',
    division: 'Div-1',
    subDivision: 'SubDiv-Alpha',
    lat: 12.97,
    lng: 77.59,
    installDate: '2024-01-15',
    status: 'active'
}));

const COLUMNS: ColumnDef<TransformerMaster>[] = [
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
    { accessorKey: 'status', header: 'Status' },
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
];

export default function TransformerMasterPage() {
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
                        Transformer Master
                    </h2>
                    <p className="text-[hsl(var(--muted-foreground))]">Manage transformer inventory and details.</p>
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
                        type="transformer"
                        onCommit={async () => setIsBulkMode(false)}
                        onCancel={() => setIsBulkMode(false)}
                    />
                ) : (
                    <DataTable
                        columns={COLUMNS}
                        data={MOCK_TRANSFORMERS}
                        searchKey="name"
                    />
                )}
            </div>
        </div>
    );
}
