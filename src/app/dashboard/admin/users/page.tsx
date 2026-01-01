'use client';

import { useState } from 'react';
import { DataTable } from '@/components/DataTable/DataTable';
import { BulkUpload } from '@/components/Admin/BulkUpload';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { Plus, Upload, UserPlus, ArrowLeft } from 'lucide-react';
import { User } from '@/lib/types';
import { clsx } from 'clsx';
import { useRouter } from 'next/navigation';

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

import { ApiService } from '@/services/api';
import { useEffect } from 'react';

// ... (keep MOCK_USERS for fallback or remove)

export default function UserManagementPage() {
    const router = useRouter();
    const [view, setView] = useState<'list' | 'upload'>('list');
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const res = await ApiService.users.getAll();
                if (res.success && res.data) {
                    const mapped: User[] = res.data.map((u: any) => ({
                        id: u.userId?.toString() || u.id || `USR-${Math.random()}`,
                        name: u.fullName || u.userName || 'Unknown',
                        email: u.email || 'N/A',
                        role: u.roleName?.toLowerCase() || 'viewer', // Adjust mapping as needed
                        permissions: []
                    }));
                    setUsers(mapped);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleBulkCommit = async (data: any[]) => {
        // ... bulk upload logic
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin')} className="mb-2 pl-0 hover:bg-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                        <ArrowLeft size={16} className="mr-2" /> Back to Administration
                    </Button>
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
                        <DataTable columns={COLUMNS} data={users} searchKey="name" isLoading={isLoading} />
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
