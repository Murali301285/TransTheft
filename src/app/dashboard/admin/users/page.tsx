'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/DataTable/DataTable';
import { BulkUpload } from '@/components/Admin/BulkUpload';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { Plus, Upload, UserPlus, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { User } from '@/lib/types'; // Assumes User type exists, will extend locally if needed
import { clsx } from 'clsx';
import { ApiService } from '@/services/api';
import { toast } from 'sonner';

// Extended User type for internal state
interface AppUser extends User {
    isActive: boolean;
    mobileNo?: string;
    // ... other fields
}

export default function UserManagementPage() {
    const router = useRouter();
    const [view, setView] = useState<'list' | 'upload'>('list');
    const [subTab, setSubTab] = useState<'active' | 'pending'>('active');

    const [users, setUsers] = useState<AppUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await ApiService.users.getAll();
            if (res.success && res.data) {
                const rawData = res.data as any;
                const list = Array.isArray(rawData) ? rawData : (rawData.response || rawData.result || []);

                const mapped: AppUser[] = Array.isArray(list) ? list.map((u: any) => ({
                    id: u.userId?.toString() || u.id || `USR-${Math.random()}`,
                    name: u.fullName || u.userName || 'Unknown',
                    email: u.email || 'N/A',
                    role: u.roleName?.toLowerCase() || 'viewer',
                    permissions: [],
                    // Check various potential flags for "Active"
                    isActive: u.isActive === true || u.status === 'Active' || u.active === true,
                    mobileNo: u.mobileNo
                })) : [];
                setUsers(mapped);
            } else {
                toast.error("Failed to load users");
            }
        } catch (e) {
            console.error(e);
            toast.error("Network user error");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleApprove = async (id: string) => {
        if (!confirm('Approve this user?')) return;
        try {
            // Numeric ID expected by backend generally
            // Try to parse string ID back to number if possible, or pass as is
            const numericId = parseInt(id);
            const res = await ApiService.users.approve(isNaN(numericId) ? id as any : numericId);
            if (res.success) {
                toast.success("User Approved");
                fetchUsers();
            } else {
                toast.error(res.message || "Approval failed");
            }
        } catch (e) { toast.error("Network Error"); }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Reject and delete this request?')) return;
        try {
            const numericId = parseInt(id);
            const res = await ApiService.users.reject(isNaN(numericId) ? id as any : numericId);
            if (res.success) {
                toast.success("User Rejected");
                fetchUsers();
            } else {
                toast.error(res.message || "Rejection failed");
            }
        } catch (e) { toast.error("Network Error"); }
    };

    const activeData = users.filter(u => u.isActive);
    const pendingData = users.filter(u => !u.isActive);

    const activeColumns: ColumnDef<AppUser>[] = [
        { accessorKey: 'id', header: 'ID' },
        { accessorKey: 'name', header: 'Full Name' },
        { accessorKey: 'email', header: 'Email Address' },
        { accessorKey: 'role', header: 'Role', cell: ({ row }) => <span className="uppercase text-xs font-bold bg-slate-100 px-2 py-1 rounded">{row.original.role}</span> },
        { accessorKey: 'isActive', header: 'Status', cell: () => <span className="text-emerald-600 font-bold text-xs">Active</span> },
        {
            id: 'actions',
            header: 'Actions',
            cell: () => <Button size="sm" variant="ghost">Edit</Button>
        }
    ];

    const pendingColumns: ColumnDef<AppUser>[] = [
        { accessorKey: 'id', header: 'ID' },
        { accessorKey: 'name', header: 'Applicant Name' },
        { accessorKey: 'email', header: 'Email' },
        { accessorKey: 'mobileNo', header: 'Mobile' },
        {
            id: 'actions',
            header: 'Approvals',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(row.original.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <CheckCircle size={14} className="mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(row.original.id)} className="text-red-600 border-red-200 hover:bg-red-50">
                        <XCircle size={14} className="mr-1" /> Reject
                    </Button>
                </div>
            )
        }
    ];

    const handleBulkCommit = (data: any[]) => { console.log(data); };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
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
            <div className="flex-1 overflow-hidden flex flex-col">
                {view === 'list' ? (
                    <div className="bg-white rounded-xl border border-[hsl(var(--border))] h-full overflow-hidden flex flex-col">
                        {/* Tabs */}
                        <div className="border-b px-4 flex gap-6">
                            <button
                                onClick={() => setSubTab('active')}
                                className={clsx(
                                    "py-3 border-b-2 text-sm font-medium transition-colors",
                                    subTab === 'active' ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
                                )}
                            >
                                Active Users ({activeData.length})
                            </button>
                            <button
                                onClick={() => setSubTab('pending')}
                                className={clsx(
                                    "py-3 border-b-2 text-sm font-medium transition-colors relative",
                                    subTab === 'pending' ? "border-amber-500 text-amber-600" : "border-transparent text-slate-500 hover:text-slate-700"
                                )}
                            >
                                Pending Approvals
                                {pendingData.length > 0 && (
                                    <span className="ml-2 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingData.length}</span>
                                )}
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden p-4">
                            {subTab === 'active' ? (
                                <DataTable columns={activeColumns} data={activeData} searchKey="name" isLoading={isLoading} />
                            ) : (
                                <DataTable columns={pendingColumns} data={pendingData} searchKey="name" isLoading={isLoading} />
                            )}
                        </div>
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
