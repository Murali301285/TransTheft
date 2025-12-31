'use client';

import { useState } from 'react';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { Plus, MapPin } from 'lucide-react';
import { clsx } from "clsx";

// Type definition for Location (Circle/Division/SubDivision/Feeder)
export interface LocationMaster {
    id: string;
    type: 'Circle' | 'Division' | 'Sub Division' | 'Feeder';
    name: string;
    parent?: string; // e.g. Division belongs to Circle
    code: string;
    activeTransformers: number;
}

// Mock Data
const MOCK_LOCATIONS: LocationMaster[] = [
    { id: 'CIR-01', type: 'Circle', name: 'North Circle', code: 'NC01', activeTransformers: 120 },
    { id: 'CIR-02', type: 'Circle', name: 'South Circle', code: 'SC01', activeTransformers: 90 },
    { id: 'DIV-01', type: 'Division', name: 'Bangalore East', parent: 'North Circle', code: 'BE01', activeTransformers: 45 },
    { id: 'DIV-02', type: 'Division', name: 'Bangalore West', parent: 'North Circle', code: 'BW01', activeTransformers: 75 },
    { id: 'FDR-101', type: 'Feeder', name: 'Indiranagar Feeder', parent: 'Bangalore East', code: 'F101', activeTransformers: 20 },
];

const COLUMNS: ColumnDef<LocationMaster>[] = [
    {
        accessorKey: 'type',
        header: 'Hierarchy Type',
        cell: ({ row }) => (
            <span className={clsx(
                "px-2 py-1 rounded text-xs font-semibold uppercase",
                row.original.type === 'Circle' && "bg-purple-100 text-purple-700",
                row.original.type === 'Division' && "bg-indigo-100 text-indigo-700",
                row.original.type === 'Feeder' && "bg-amber-100 text-amber-700",
            )}>
                {row.original.type}
            </span>
        )
    },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'code', header: 'Code' },
    { accessorKey: 'parent', header: 'Parent Entity' },
    { accessorKey: 'activeTransformers', header: 'Transformers' },
    {
        id: 'actions',
        header: 'Actions',
        cell: () => (
            <Button variant="ghost" size="sm">Edit</Button>
        )
    }
];

export default function LocationMasterPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
                        Location Master
                    </h2>
                    <p className="text-[hsl(var(--muted-foreground))]">Manage Utility Hierarchy (Circles to Feeders).</p>
                </div>

                <Button>
                    <Plus size={16} className="mr-2" /> Add Location
                </Button>
            </div>

            <div className="bg-[hsl(var(--surface))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm animate-fade-in">
                {/* No Bulk Upload needed here typically, but can add if requested */}
                <DataTable
                    columns={COLUMNS}
                    data={MOCK_LOCATIONS}
                    searchKey="name"
                />
            </div>
        </div>
    );
}
