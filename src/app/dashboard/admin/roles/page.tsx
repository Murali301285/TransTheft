'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Plus } from 'lucide-react';

interface Role {
    id: string;
    name: string;
    usersCount: number;
    permissions: string[];
    description: string;
}

const MOCK_ROLES: Role[] = [
    { id: 'R-01', name: 'Super Admin', usersCount: 2, permissions: ['ALL_ACCESS'], description: 'Full system control' },
    { id: 'R-02', name: 'Circle Manager', usersCount: 5, permissions: ['VIEW_DASHBOARD', 'MANAGE_TRANSFORMERS', 'VIEW_REPORTS'], description: 'Manage specific circle assets' },
    { id: 'R-03', name: 'Field Engineer', usersCount: 24, permissions: ['VIEW_MAP', 'ACKNOWLEDGE_ALERTS'], description: 'On-ground maintenance staff' },
    { id: 'R-04', name: 'Viewer', usersCount: 10, permissions: ['VIEW_ONLY'], description: 'Read-only access' },
];

const COLUMNS: ColumnDef<Role>[] = [
    { accessorKey: 'name', header: 'Role Name', cell: ({ row }) => <span className="font-semibold">{row.original.name}</span> },
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'usersCount', header: 'Active Users', cell: ({ row }) => <span className="bg-gray-100 px-2 py-1 rounded text-xs">{row.original.usersCount} Users</span> },
    {
        accessorKey: 'permissions',
        header: 'Permissions',
        cell: ({ row }) => (
            <div className="flex flex-wrap gap-1">
                {row.original.permissions.map(p => (
                    <span key={p} className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-1 py-0.5 rounded uppercase">{p.replace(/_/g, ' ')}</span>
                ))}
            </div>
        )
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: () => <Button size="sm" variant="ghost">Edit</Button>
    }
];

export default function RolesPage() {
    const router = useRouter();
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin')} className="mb-2 pl-0 hover:bg-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                        <ArrowLeft size={16} className="mr-2" /> Back to Administration
                    </Button>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
                        Role & Access Control
                    </h2>
                    <p className="text-[hsl(var(--muted-foreground))]">Define permissions and assign roles.</p>
                </div>
                <Button>
                    <Plus size={16} className="mr-2" /> Create Role
                </Button>
            </div>
            <div className="bg-[hsl(var(--surface))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm animate-fade-in">
                <DataTable columns={COLUMNS} data={MOCK_ROLES} searchKey="name" />
            </div>
        </div>
    );
}
