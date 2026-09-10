'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Plus, Pencil, Trash2, Building2, ArrowLeft, ClipboardPaste } from 'lucide-react';
import { ApiService } from '@/services/api';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

interface Company {
    id?: number;
    companyId?: number; // Backend might use either, keeping for safety but 'id' is primary according to Swagger
    companyName: string;
    address: string;
    city: string;
    contactNumber: string;
    email: string;
    state?: string;
    contactPerson?: string;
}

const INITIAL_FORM: Company = {
    id: 0,
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
    const { t } = useLanguage();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<Company>(INITIAL_FORM);

    const columns: ColumnDef<Company>[] = useMemo(() => [
        { accessorKey: 'id', header: 'ID' },
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
                        onClick={() => handleDelete(row.original.id || row.original.companyId!)}
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
            // Construct payload strictly according to Swagger DTO
            const payload = {
                id: isEditing ? (formData.id || formData.companyId) : 0,
                companyCode: formData.companyName.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000),
                companyName: formData.companyName,
                shortName: formData.companyName.substring(0, 10),
                address: formData.address || 'N/A',
                pincode: '500001' // Default dummy pincode
            };

            let res;
            if (isEditing) {
                // For update, ensuring the ID is set
                const updatePayload = { ...payload, id: (formData.id || formData.companyId)! };
                res = await ApiService.company.update(updatePayload);
            } else {
                res = await ApiService.company.create(payload);
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
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[hsl(var(--border))] shadow-sm mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin')}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                            <Building2 className="text-amber-600" /> {t('admin.company')}
                        </h1>
                        <p className="text-xs text-muted-foreground">{t('desc.company')}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm"><ClipboardPaste size={14} className="mr-2" /> Import</Button>
                    <Button size="sm" onClick={handleAdd} className="bg-amber-600 hover:bg-amber-700 text-white">
                        <Plus size={16} className="mr-2" /> Add Company
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-4">
                <DataTable
                    columns={columns}
                    data={companies}
                    isLoading={isLoading}
                    searchKey="companyName"
                    exportFileName="Companies"
                    exportTitle="Companies List"
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
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) {
                                    handleChange('contactNumber', val);
                                }
                            }}
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
