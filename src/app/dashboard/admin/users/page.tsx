'use client';

import { useState } from 'react';
import { DataTable } from '@/components/DataTable/DataTable';
import { BulkUpload } from '@/components/Admin/BulkUpload';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { Plus, Upload, UserPlus } from 'lucide-react';
import { User } from '@/lib/types';
import { clsx } from 'clsx';

// Mock Data
const MOCK_USERS: User[] = Array.from({ length: 25 }).map((_, i) => ({
    id: `USR-${100 + i}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@ttm.com`,
    role: i % 5 === 0 ? 'admin' : 'viewer',
    permissions: []
}));

const COLUMNS: ColumnDef<User>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Full Name' },
    { accessorKey: 'email', header: 'Email Address' },
    {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
            <span className={clsx(
                "px-2 py-0.5 rounded text-xs font-semibold uppercase",
                row.original.role === 'admin' ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
            )}>
                {row.original.role}
            </span>
        )
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: () => <Button size="sm" variant="ghost">Edit</Button>
    }
];

export default function UserManagementPage() {
    const [view, setView] = useState<'list' | 'upload'>('list');
    const [users, setUsers] = useState<User[]>(MOCK_USERS);

    const handleBulkCommit = async (data: any[]) => {
        // Simulate API Call
        await new Promise(r => setTimeout(r, 1000));

        const newUsers = data.map((d: any, i) => ({
            id: d.ID || `NEW-${Date.now()}-${i}`,
            name: d.Name,
            email: d.Email,
            role: d.Role || 'viewer',
            permissions: []
        }));

        setUsers(prev => [...newUsers, ...prev]);
        setView('list');
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <p className="text-[hsl(var(--muted-foreground))]">Manage system access and roles</p>
                </div>

                {view === 'list' && (
                    <div className="flex gap-3">
                        <Button onClick={() => window.alert('Manual Add User Modal')}>
                            <UserPlus size={16} className="mr-2" /> Add User
                        </Button>
                        <Button variant="secondary" onClick={() => setView('upload')}>
                            <Upload size={16} className="mr-2" /> Bulk Upload
                        </Button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {view === 'list' ? (
                    <div className="bg-white rounded-xl border border-[hsl(var(--border))] p-4 h-full overflow-hidden flex flex-col">
                        <DataTable columns={COLUMNS} data={users} searchKey="name" />
                    </div>
                ) : (
                    <BulkUpload
                        type="user"
                        onCommit={handleBulkCommit}
                        onCancel={() => setView('list')}
                    />
                )}
            </div>
        </div>
    );
}
