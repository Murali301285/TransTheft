'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/Button';
import { UploadCloud, FileSpreadsheet, AlertCircle, CheckCircle, XCircle, Trash2, Save, Download } from 'lucide-react';
import { BulkUploadRow, BulkUploadStats, MasterType } from '@/lib/types';
import { clsx } from 'clsx';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';

interface BulkUploadProps {
    type: MasterType;
    onCommit: (data: any[]) => Promise<void>;
    onCancel: () => void;
}

export function BulkUpload({ type, onCommit, onCancel }: BulkUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [parsedData, setParsedData] = useState<BulkUploadRow[]>([]);
    const [stats, setStats] = useState<BulkUploadStats | null>(null);
    const [step, setStep] = useState<'upload' | 'verify' | 'summary'>('upload');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;
        setFile(selectedFile);
        processFile(selectedFile);
    };

    const processFile = async (f: File) => {
        setIsProcessing(true);
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            // Mock Validation Logic
            const validatedData: BulkUploadRow[] = data.map((row: any, index) => {
                const remarks: string[] = [];
                let status: BulkUploadRow['status'] = 'ok';

                // Fake rules for demonstration
                if (!row.id && !row.ID) {
                    status = 'error';
                    remarks.push('Missing ID');
                }
                if (Math.random() > 0.8) {
                    status = 'duplicate';
                    remarks.push('Already exists in DB');
                }

                return {
                    rowId: index + 1,
                    data: row,
                    status,
                    remarks
                };
            });

            setParsedData(validatedData);

            // Calculate Stats
            const newStats = validatedData.reduce((acc, curr) => {
                acc.total++;
                if (curr.status === 'ok') acc.valid++;
                if (curr.status === 'error') acc.invalid++;
                if (curr.status === 'duplicate') acc.duplicates++;
                return acc;
            }, { total: 0, valid: 0, invalid: 0, duplicates: 0 });

            setStats(newStats);
            setStep('verify');
            setIsProcessing(false);
        };
        reader.readAsBinaryString(f);
    };

    const handleCommit = async () => {
        setIsProcessing(true);
        // Filter only valid records
        const validRecords = parsedData.filter(d => d.status === 'ok').map(d => d.data);
        await onCommit(validRecords);
        setIsProcessing(false);
        setStep('summary'); // Or close
    };

    const downloadTemplate = () => {
        // Generate simple template based on type
        const headers = type === 'user' ? [['ID', 'Name', 'Email', 'Role', 'Mobile']] : [['ID', 'Name', 'Lat', 'Lng', 'Circle']];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(headers);
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        XLSX.writeFile(wb, `${type}_master_template.xlsx`);
    };

    // Dynamic Columns for the Verification Table
    const columns: ColumnDef<BulkUploadRow>[] = [
        { accessorKey: 'rowId', header: 'Row #' },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <span className={clsx(
                        "flex items-center gap-2 font-medium px-2 py-1 rounded-full text-xs w-fit",
                        status === 'ok' && "bg-green-100 text-green-700",
                        status === 'error' && "bg-red-100 text-red-700",
                        status === 'duplicate' && "bg-yellow-100 text-yellow-700",
                    )}>
                        {status === 'ok' && <CheckCircle size={14} />}
                        {status === 'error' && <XCircle size={14} />}
                        {status === 'duplicate' && <AlertCircle size={14} />}
                        {status.toUpperCase()}
                    </span>
                );
            }
        },
        {
            accessorKey: 'data',
            header: 'Data Preview',
            cell: ({ row }) => <span className="text-xs text-[hsl(var(--muted-foreground))] truncate max-w-[200px] block">{JSON.stringify(row.original.data)}</span>
        },
        {
            accessorKey: 'remarks',
            header: 'Remarks',
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    {row.original.remarks.map((r, i) => (
                        <span key={i} className="text-xs text-red-600 font-medium">• {r}</span>
                    ))}
                    {row.original.remarks.length === 0 && <span className="text-xs text-green-600">Ready to Upload</span>}
                </div>
            )
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: () => (
                <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-red-100 text-red-500"><Trash2 size={14} /></Button>
                </div>
            )
        }
    ];

    return (
        <div className="bg-[hsl(var(--surface))] rounded-xl border border-[hsl(var(--border))] shadow-lg flex flex-col h-full animate-fade-in">
            {/* Header */}
            <div className="p-6 border-b border-[hsl(var(--border))] flex justify-between items-center bg-[hsl(var(--background)/0.5)]">
                <div>
                    <h2 className="text-lg font-bold">Bulk Upload: {type.toUpperCase()} Master</h2>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Import data from Excel spreadsheet</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={downloadTemplate}>
                        <Download size={16} className="mr-2" /> Template
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onCancel}><XCircle size={16} /></Button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-hidden flex flex-col">
                {step === 'upload' && (
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[hsl(var(--border))] rounded-xl bg-[hsl(var(--background)/0.5)] hover:bg-[hsl(var(--background))] transition-colors p-12">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                        <div className="w-20 h-20 bg-[hsl(var(--primary)/0.1)] rounded-full flex items-center justify-center text-[hsl(var(--primary))] mb-6">
                            <UploadCloud size={40} />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Click or Drag file here</h3>
                        <p className="text-[hsl(var(--muted-foreground))] text-center max-w-sm mb-6">
                            Upload an Excel file (.xlsx) containing {type} records. Ensure columns match the template.
                        </p>
                        <Button onClick={() => fileInputRef.current?.click()} size="lg">
                            Select Excel File
                        </Button>
                    </div>
                )}

                {step === 'verify' && (
                    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                                <p className="text-sm text-blue-600 mb-1">Total Records</p>
                                <p className="text-2xl font-bold text-blue-700">{stats?.total}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                                <p className="text-sm text-green-600 mb-1">Valid Records</p>
                                <p className="text-2xl font-bold text-green-700">{stats?.valid}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                                <p className="text-sm text-red-600 mb-1">Errors</p>
                                <p className="text-2xl font-bold text-red-700">{stats?.invalid}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100">
                                <p className="text-sm text-yellow-600 mb-1">Duplicates</p>
                                <p className="text-2xl font-bold text-yellow-700">{stats?.duplicates}</p>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-hidden border border-[hsl(var(--border))] rounded-lg">
                            <DataTable
                                columns={columns}
                                data={parsedData}
                                onExport={() => { }} // Internal export not needed here
                            />
                        </div>
                    </div>
                )}

                {step === 'summary' && (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce">
                            <CheckCircle size={48} />
                        </div>
                        <h2 className="text-3xl font-bold text-green-700 mb-2">Upload Complete!</h2>
                        <p className="text-[hsl(var(--muted-foreground))] mb-8">Successfully processed records.</p>
                        <Button onClick={onCancel}>Return to List</Button>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            {step === 'verify' && (
                <div className="p-6 border-t border-[hsl(var(--border))] flex justify-between bg-[hsl(var(--background)/0.5)]">
                    <Button variant="outline" onClick={() => { setStep('upload'); setFile(null); }}>
                        Re-upload File
                    </Button>
                    <div className="flex gap-4">
                        {stats?.invalid && stats.invalid > 0 && (
                            <span className="flex items-center text-red-600 text-sm font-medium">
                                <AlertCircle size={16} className="mr-2" /> Please fix errors or remove rows
                            </span>
                        )}
                        <Button
                            onClick={handleCommit}
                            disabled={isProcessing} // Allow commit even with errors? "get confirmation and upload one by one" -> usually we just upload Valid ones.
                            isLoading={isProcessing}
                        >
                            <Save size={16} className="mr-2" /> Commit Valid Records ({stats?.valid})
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
