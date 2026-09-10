'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Role {
    id: string;
    name: string;
    usersCount: number;
    permissions: string[];
    description: string;
}

const INITIAL_ROLES: Role[] = [
    { id: 'R-01', name: 'Super Admin', usersCount: 2, permissions: ['ALL_ACCESS'], description: 'Full system control' },
    { id: 'R-02', name: 'Circle Manager', usersCount: 5, permissions: ['VIEW_DASHBOARD', 'MANAGE_TRANSFORMERS', 'VIEW_REPORTS'], description: 'Manage specific circle assets' },
    { id: 'R-03', name: 'Field Engineer', usersCount: 24, permissions: ['VIEW_MAP', 'ACKNOWLEDGE_ALERTS'], description: 'On-ground maintenance staff' },
    { id: 'R-04', name: 'Viewer', usersCount: 10, permissions: ['VIEW_ONLY'], description: 'Read-only access' },
];

const AVAILABLE_PERMISSIONS = [
    { value: 'VIEW_DASHBOARD', label: 'View Dashboard' },
    { value: 'MANAGE_TRANSFORMERS', label: 'Manage Transformers' },
    { value: 'VIEW_REPORTS', label: 'View Reports' },
    { value: 'VIEW_MAP', label: 'View Map' },
    { value: 'ACKNOWLEDGE_ALERTS', label: 'Acknowledge Alerts' },
    { value: 'VIEW_ONLY', label: 'View Only' },
    { value: 'ALL_ACCESS', label: 'All Access' }
];

export default function RolesPage() {
    const router = useRouter();
    const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '', permissions: [] as string[] });

    const handleAdd = () => {
        setFormData({ name: '', description: '', permissions: [] });
        setIsEditing(false);
        setSelectedRoleId(null);
        setIsModalOpen(true);
    };

    const handleEdit = (role: Role) => {
        setFormData({
            name: role.name,
            description: role.description,
            permissions: [...role.permissions]
        });
        setIsEditing(true);
        setSelectedRoleId(role.id);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.description.trim()) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (isEditing && selectedRoleId) {
            setRoles(prev => prev.map(r => 
                r.id === selectedRoleId 
                    ? { ...r, name: formData.name, description: formData.description, permissions: formData.permissions } 
                    : r
            ));
            toast.success("Role updated successfully");
        } else {
            const newRole: Role = {
                id: `R-0${roles.length + 1}`,
                name: formData.name,
                description: formData.description,
                usersCount: 0,
                permissions: formData.permissions
            };
            setRoles(prev => [...prev, newRole]);
            toast.success("Role created successfully");
        }
        setIsModalOpen(false);
    };

    const columns: ColumnDef<Role>[] = useMemo(() => [
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
            cell: ({ row }) => <Button size="sm" variant="ghost" onClick={() => handleEdit(row.original)}>Edit</Button>
        }
    ], []);

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
                <Button onClick={handleAdd}>
                    <Plus size={16} className="mr-2" /> Create Role
                </Button>
            </div>
            <div className="bg-[hsl(var(--surface))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm animate-fade-in">
                <DataTable 
                    columns={columns} 
                    data={roles} 
                    searchKey="name" 
                    exportFileName="Roles"
                    exportTitle="Roles List"
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? "Edit Role" : "Create Role"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Role Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                    <div>
                        <label className="text-sm font-medium mb-2 block">Permissions</label>
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                            {AVAILABLE_PERMISSIONS.map(p => {
                                const checked = formData.permissions.includes(p.value);
                                return (
                                    <label key={p.value} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => {
                                                const newPerms = checked
                                                    ? formData.permissions.filter(perm => perm !== p.value)
                                                    : [...formData.permissions, p.value];
                                                setFormData({ ...formData, permissions: newPerms });
                                            }}
                                            className="rounded border-slate-350 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        />
                                        {p.label}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                            {isEditing ? 'Update Role' : 'Save Role'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
