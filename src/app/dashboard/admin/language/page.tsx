'use client';

import { useState, useEffect, useMemo } from 'react';
import { LanguageStore, LanguageItem } from '@/lib/language-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import {
    Languages, Plus, Save, Trash2, Pencil, RotateCcw,
    Copy, ClipboardPaste, ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LanguageSettingsPage() {
    const router = useRouter();
    const [items, setItems] = useState<LanguageItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<LanguageItem | null>(null);
    const [bulkJson, setBulkJson] = useState('');

    // Form State
    const [formData, setFormData] = useState<LanguageItem>({
        key: '', section: 'General',
        en: '', hi: '', ta: '', te: '', kn: ''
    });

    useEffect(() => {
        setItems(LanguageStore.getAll());
    }, []);

    const columns: ColumnDef<LanguageItem>[] = useMemo(() => [
        {
            accessorKey: 'key',
            header: 'Key / ID',
            meta: { className: 'sticky left-0 bg-white z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[150px]' }
        },
        { accessorKey: 'section', header: 'Section', meta: { className: 'min-w-[150px]' } },
        { accessorKey: 'en', header: 'English', meta: { className: 'min-w-[250px]' } },
        { accessorKey: 'hi', header: 'Hindi', meta: { className: 'min-w-[200px]' } },
        { accessorKey: 'ta', header: 'Tamil', meta: { className: 'min-w-[200px]' } },
        { accessorKey: 'te', header: 'Telugu', meta: { className: 'min-w-[200px]' } },
        { accessorKey: 'kn', header: 'Kannada', meta: { className: 'min-w-[200px]' } },
        {
            id: 'actions',
            header: 'Actions',
            meta: { className: 'sticky right-0 bg-white z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] w-[100px]' },
            cell: ({ row }) => (
                <div className="flex gap-2 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)}>
                        <Pencil size={14} className="text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(row.original.key)}>
                        <Trash2 size={14} className="text-red-600" />
                    </Button>
                </div>
            )
        }
    ], []);

    const handleSave = (newList: LanguageItem[]) => {
        setItems(newList);
        LanguageStore.save(newList);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isDuplicate = items.some(i => i.key === formData.key && i !== editingItem);
        if (isDuplicate) {
            toast.error(`Key "${formData.key}" already exists!`);
            return;
        }

        let newList;
        if (editingItem) {
            newList = items.map(i => i.key === editingItem.key ? formData : i);
            toast.success('Updated');
        } else {
            newList = [...items, formData];
            toast.success('Added');
        }

        handleSave(newList);
        setIsModalOpen(false);
    };

    const handleDelete = (key: string) => {
        if (!confirm(`Delete translation for "${key}"?`)) return;
        const newList = items.filter(i => i.key !== key);
        handleSave(newList);
        toast.success('Deleted');
    };

    const handleEdit = (item: LanguageItem) => {
        setEditingItem(item);
        setFormData(item);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingItem(null);
        setFormData({
            key: '', section: 'General',
            en: '', hi: '', ta: '', te: '', kn: ''
        });
        setIsModalOpen(true);
    };

    const handleReset = () => {
        if (!confirm('Reset all translations?')) return;
        const defaults = LanguageStore.resetToDefaults();
        setItems(defaults);
        toast.success('Reset');
    };

    const handleBulkImport = () => {
        try {
            const parsed = JSON.parse(bulkJson);
            // Support: Array of full objects OR Simple Key-Val for English
            let newItems: LanguageItem[] = [];

            if (Array.isArray(parsed)) {
                newItems = parsed.map(p => ({
                    key: p.key || p.id,
                    section: p.section || 'Imported',
                    en: p.en || p.value || p.text || '',
                    hi: p.hi || '',
                    ta: p.ta || '',
                    te: p.te || '',
                    kn: p.kn || ''
                })).filter(i => i.key);
            } else {
                newItems = Object.entries(parsed).map(([k, v]) => ({
                    key: k,
                    section: 'Imported',
                    en: String(v),
                    hi: '', ta: '', te: '', kn: ''
                }));
            }

            if (newItems.length === 0) throw new Error("No valid data");

            const activeMap = new Map(items.map(i => [i.key, i]));
            newItems.forEach(i => {
                // Merge if exists, else add
                const exist = activeMap.get(i.key);
                if (exist) {
                    activeMap.set(i.key, { ...exist, ...i }); // Update provided fields
                } else {
                    activeMap.set(i.key, i);
                }
            });

            const mergedList = Array.from(activeMap.values());
            handleSave(mergedList);
            toast.success('Imported');
            setIsBulkOpen(false);
        } catch (e) {
            toast.error('Invalid JSON');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(items, null, 2));
        toast.success('Copied JSON');
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin')}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                            <Languages className="text-indigo-600" /> Language Settings
                        </h1>
                        <p className="text-xs text-muted-foreground">Manage multi-language translations</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleReset}><RotateCcw size={14} className="mr-2" /> Reset</Button>
                    <Button variant="outline" size="sm" onClick={copyToClipboard}><Copy size={14} className="mr-2" /> JSON</Button>
                    <Button variant="outline" size="sm" onClick={() => setIsBulkOpen(true)}><ClipboardPaste size={14} className="mr-2" /> Import</Button>
                    <Button size="sm" onClick={handleAdd} className="bg-indigo-600 text-white"><Plus size={16} className="mr-2" /> Add</Button>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm p-4">
                <DataTable
                    columns={columns}
                    data={items}
                    searchKey="en"
                />
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? "Edit Translations" : "Add New Translation"}
            >
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Key (ID)"
                            value={formData.key}
                            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                            disabled={!!editingItem}
                            required
                        />
                        <Input
                            label="Section"
                            value={formData.section}
                            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        />
                    </div>

                    <div className="space-y-3 p-3 bg-slate-50 rounded-lg border">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase">Translations</h4>
                        <Input
                            label="English"
                            value={formData.en}
                            onChange={(e) => setFormData({ ...formData, en: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="Hindi"
                                value={formData.hi}
                                onChange={(e) => setFormData({ ...formData, hi: e.target.value })}
                            />
                            <Input
                                label="Tamil"
                                value={formData.ta}
                                onChange={(e) => setFormData({ ...formData, ta: e.target.value })}
                            />
                            <Input
                                label="Telugu"
                                value={formData.te}
                                onChange={(e) => setFormData({ ...formData, te: e.target.value })}
                            />
                            <Input
                                label="Kannada"
                                value={formData.kn}
                                onChange={(e) => setFormData({ ...formData, kn: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-indigo-600 text-white">Save</Button>
                    </div>
                </form>
            </Modal>

            <Modal
                isOpen={isBulkOpen}
                onClose={() => setIsBulkOpen(false)}
                title="Bulk Import"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-500">Paste JSON array of objects.</p>
                    <textarea
                        className="w-full h-48 bg-slate-50 border rounded-lg p-3 font-mono text-xs focus:ring-2 focus:ring-indigo-100 outline-none"
                        value={bulkJson}
                        onChange={(e) => setBulkJson(e.target.value)}
                        placeholder={`[\n  { "key": "x", "en": "Hello", "hi": "नमस्ते" }\n]`}
                    />
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => setIsBulkOpen(false)}>Cancel</Button>
                        <Button type="button" onClick={handleBulkImport} className="bg-indigo-600 text-white">Import</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
