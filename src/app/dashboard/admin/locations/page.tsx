'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { ApiService } from '@/services/api';
import {
    MapPin, Plus, Pencil, Trash2, ArrowLeft, Layers,
    CircleDot, GitCommit, Map, Box, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';

type LocationType = 'circle' | 'division' | 'subDivision' | 'section' | 'substation';

const TABS: { id: LocationType; label: string; icon: any }[] = [
    { id: 'circle', label: 'Circles', icon: CircleDot },
    { id: 'division', label: 'Divisions', icon: Layers },
    { id: 'subDivision', label: 'Sub-Divisions', icon: GitCommit },
    { id: 'section', label: 'Sections', icon: Box },
    { id: 'substation', label: 'Substations', icon: Zap },
];

export default function LocationMasterPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<LocationType>('circle');
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // TypeScript trick to access dynamic property safely
            // @ts-ignore
            const apiGroup = ApiService.locations[activeTab];
            const res = await apiGroup.getAll();
            if (res.success && res.data) {
                const raw = res.data as any;
                const list = Array.isArray(raw) ? raw : (raw.response || raw.result || []);
                setData(list);
            } else {
                toast.error(res.message || 'Failed to fetch data');
            }
        } catch (e) {
            toast.error('Network Error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setData([]);
        fetchData();
    }, [activeTab]);

    // Dynamic Columns based on Tab
    const columns: ColumnDef<any>[] = useMemo(() => {
        const cols: ColumnDef<any>[] = [
            { accessorKey: `${activeTab}Id`, header: 'ID' }, // e.g. circleId
            { accessorKey: `${activeTab}Code`, header: 'Code' },
            { accessorKey: `${activeTab}Name`, header: 'Name' },
        ];

        // Add parent ID columns if applicable
        if (activeTab === 'division') cols.push({ accessorKey: 'circleId', header: 'Circle ID' });
        if (activeTab === 'subDivision') cols.push({ accessorKey: 'divisionId', header: 'Division ID' });
        if (activeTab === 'section') cols.push({ accessorKey: 'subDivisionId', header: 'SubDiv ID' });
        if (activeTab === 'substation') cols.push({ accessorKey: 'sectionId', header: 'Section ID' });

        cols.push({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)}>
                        <Pencil size={14} className="text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(row.original[`${activeTab}Id`])}>
                        <Trash2 size={14} className="text-red-600" />
                    </Button>
                </div>
            )
        });

        return cols;
    }, [activeTab]);

    const handleEdit = (item: any) => {
        setFormData(item);
        setIsEditing(true);
        setIsModalOpen(true);
    }

    const handleAdd = () => {
        setFormData({});
        setIsEditing(false);
        setIsModalOpen(true);
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try {
            // @ts-ignore
            const apiGroup = ApiService.locations[activeTab];
            const res = await apiGroup.delete(id);
            if (res.success) {
                toast.success('Deleted');
                fetchData();
            } else {
                toast.error(res.message || 'Failed');
            }
        } catch (e) { toast.error('Network Error'); }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // @ts-ignore
            const apiGroup = ApiService.locations[activeTab];
            const res = isEditing
                ? await apiGroup.update(formData)
                : await apiGroup.create(formData);

            if (res.success) {
                toast.success('Saved successfully');
                setIsModalOpen(false);
                fetchData();
            } else {
                toast.error(res.message || 'Operation failed');
            }
        } catch (e) { toast.error('Network Error'); }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/dashboard/admin')}
                    className="mb-2 pl-0 hover:bg-transparent text-slate-500 hover:text-slate-900"
                >
                    <ArrowLeft size={16} className="mr-2" /> Back to Administration
                </Button>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Location Master</h1>
                            <p className="text-muted-foreground">Manage network hierarchy levels.</p>
                        </div>
                    </div>
                    <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Add {TABS.find(t => t.id === activeTab)?.label.slice(0, -1)}
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b flex gap-6">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "flex items-center gap-2 pb-3 pt-2 text-sm font-medium border-b-2 transition-colors",
                                isActive
                                    ? "border-indigo-600 text-indigo-600"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                            )}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-4">
                <DataTable
                    columns={columns}
                    data={data}
                    isLoading={isLoading}
                    searchKey={`${activeTab}Name`}
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`${isEditing ? 'Edit' : 'Add'} ${TABS.find(t => t.id === activeTab)?.label.slice(0, -1)}`}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Basic Details</p>

                    {/* Standard Fields for all */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Name"
                            value={formData[`${activeTab}Name`] || ''}
                            onChange={(e) => setFormData({ ...formData, [`${activeTab}Name`]: e.target.value })}
                            required
                        />
                        <Input
                            label="Code"
                            value={formData[`${activeTab}Code`] || ''}
                            onChange={(e) => setFormData({ ...formData, [`${activeTab}Code`]: e.target.value })}
                            required
                        />
                    </div>

                    {/* Parent ID Fields */}
                    {activeTab === 'circle' && (
                        <Input
                            label="Company ID"
                            type="number"
                            value={formData.companyId || ''}
                            onChange={(e) => setFormData({ ...formData, companyId: parseInt(e.target.value) })}
                            required
                        />
                    )}
                    {activeTab === 'division' && (
                        <Input
                            label="Circle ID"
                            type="number"
                            value={formData.circleId || ''}
                            onChange={(e) => setFormData({ ...formData, circleId: parseInt(e.target.value) })}
                            required
                        />
                    )}
                    {activeTab === 'subDivision' && (
                        <Input
                            label="Division ID"
                            type="number"
                            value={formData.divisionId || ''}
                            onChange={(e) => setFormData({ ...formData, divisionId: parseInt(e.target.value) })}
                            required
                        />
                    )}
                    {activeTab === 'section' && (
                        <Input
                            label="Sub-Division ID"
                            type="number"
                            value={formData.subDivisionId || ''}
                            onChange={(e) => setFormData({ ...formData, subDivisionId: parseInt(e.target.value) })}
                            required
                        />
                    )}
                    {activeTab === 'substation' && (
                        <Input
                            label="Section ID"
                            type="number"
                            value={formData.sectionId || ''}
                            onChange={(e) => setFormData({ ...formData, sectionId: parseInt(e.target.value) })}
                            required
                        />
                    )}
                    {/* For ID hidden field in update */}
                    {isEditing && (
                        <p className="text-[10px] text-slate-400">ID: {formData[`${activeTab}Id`]}</p>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-indigo-600 text-white">Save</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
