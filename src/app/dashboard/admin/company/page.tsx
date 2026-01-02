'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Pencil, Trash2, Building2, ArrowLeft } from 'lucide-react';
import { ApiService } from '@/services/api';
import { toast } from 'sonner';

interface Company {
    companyId?: number;
    companyName: string;
    address: string;
    city: string;
    contactNumber: string;
    email: string;
    state?: string;
    contactPerson?: string;
}

const INITIAL_FORM: Company = {
    companyName: '',
    address: '',
    city: '',
    contactNumber: '',
    email: '',
    state: '',
    contactPerson: ''
};

export default function CompanyMasterPage() {
    const router = useRouter();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<Company>(INITIAL_FORM);

    const columns: ColumnDef<Company>[] = useMemo(() => [
        { accessorKey: 'companyId', header: 'ID' },
        { accessorKey: 'companyName', header: 'Company Name' },
        { accessorKey: 'address', header: 'Address' },
        { accessorKey: 'city', header: 'City' },
        { accessorKey: 'contactNumber', header: 'Phone' },
        { accessorKey: 'email', header: 'Email' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(row.original)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                        <Pencil size={14} className="mr-1" /> Edit
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(row.original.companyId!)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 size={14} className="mr-1" /> Delete
                    </Button>
                </div>
            )
        }
    ], []);

    const fetchCompanies = async () => {
        setIsLoading(true);
        try {
            const res = await ApiService.company.getAll();
            if (res.success && res.data) {
                const raw = res.data as any;
                const list = Array.isArray(raw) ? raw : (raw.response || raw.result || []);
                setCompanies(list);
            } else {
                toast.error(res.message || 'Failed to fetch companies');
            }
        } catch (e) {
            console.error(e);
            toast.error('Network error fetching companies');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleAdd = () => {
        setFormData(INITIAL_FORM);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleEdit = (company: Company) => {
        setFormData(company);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this company?')) return;

        try {
            const res = await ApiService.company.delete(id);
            if (res.success) {
                toast.success('Company deleted successfully');
                fetchCompanies();
            } else {
                toast.error(res.message || 'Failed to delete company');
            }
        } catch (e) {
            toast.error('Network Error');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = { ...formData };
            let res;
            if (isEditing) {
                // Ensure ID is present for update
                if (!payload.companyId) {
                    toast.error("Invalid Company ID for update");
                    setIsSubmitting(false);
                    return;
                }
                res = await ApiService.company.update(payload);
            } else {
                // Remove ID for create/insert if it causes issues, or keep it 0/undefined
                const { companyId, ...createPayload } = payload;
                res = await ApiService.company.create(createPayload);
            }

            if (res.success) {
                toast.success(isEditing ? 'Company updated successfully' : 'Company created successfully');
                fetchCompanies();
                setIsModalOpen(false);
            } else {
                toast.error(res.message || (isEditing ? 'Update failed' : 'Creation failed'));
            }
        } catch (e) {
            console.error('Save Error', e);
            toast.error('Network Error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: keyof Company, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

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
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-600">Company Master</h1>
                            <p className="text-muted-foreground">Manage authorized utility companies and providers.</p>
                        </div>
                    </div>
                    <Button onClick={handleAdd} className="bg-amber-600 hover:bg-amber-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Add Company
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-4">
                <DataTable
                    columns={columns}
                    data={companies}
                    isLoading={isLoading}
                    searchKey="companyName"
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? "Edit Company" : "Add New Company"}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <Input
                        label="Company Name"
                        placeholder="Enter company name"
                        value={formData.companyName}
                        onChange={(e) => handleChange('companyName', e.target.value)}
                        required
                    />
                    <Input
                        label="Address"
                        placeholder="Street Address"
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="City"
                            placeholder="City"
                            value={formData.city}
                            onChange={(e) => handleChange('city', e.target.value)}
                        />
                        <Input
                            label="State"
                            placeholder="State"
                            value={formData.state || ''}
                            onChange={(e) => handleChange('state', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Contact Person"
                            placeholder="Name"
                            value={formData.contactPerson || ''}
                            onChange={(e) => handleChange('contactPerson', e.target.value)}
                        />
                        <Input
                            label="Phone"
                            placeholder="Contact Number"
                            value={formData.contactNumber}
                            onChange={(e) => handleChange('contactNumber', e.target.value)}
                        />
                    </div>
                    <Input
                        label="Email"
                        type="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="min-w-[100px] bg-amber-600 hover:bg-amber-700 text-white">
                            {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
