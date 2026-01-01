'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Download } from 'lucide-react';

interface Log {
    id: string;
    action: string;
    user: string;
    target: string;
    ip: string;
    time: string;
}

const MOCK_LOGS: Log[] = Array.from({ length: 20 }).map((_, i) => ({
    id: `LOG-${i}`,
    action: ['LOGIN', 'UPDATE_TRANSFORMER', 'DELETE_USER', 'EXPORT_REPORT'][i % 4],
    user: `user${i % 5}@ttm.com`,
    target: i % 2 === 0 ? 'System' : `TR-${2000 + i}`,
    ip: `192.168.1.${10 + i}`,
    time: new Date(Date.now() - i * 1000 * 60).toLocaleString()
}));

const COLUMNS: ColumnDef<Log>[] = [
    { accessorKey: 'time', header: 'Timestamp' },
    { accessorKey: 'user', header: 'User' },
    { accessorKey: 'action', header: 'Action', cell: ({ row }) => <span className="font-mono text-xs font-bold">{row.original.action}</span> },
    { accessorKey: 'target', header: 'Target' },
    { accessorKey: 'ip', header: 'IP Address' },
];

export default function LogsPage() {
    const router = useRouter();
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin')} className="mb-2 pl-0 hover:bg-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                        <ArrowLeft size={16} className="mr-2" /> Back to Administration
                    </Button>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--secondary))]">
                        Audit Logs
                    </h2>
                    <p className="text-[hsl(var(--muted-foreground))]">Track system activity and security events.</p>
                </div>
                <Button variant="outline">
                    <Download size={16} className="mr-2" /> Export Logs
                </Button>
            </div>
            <div className="bg-[hsl(var(--surface))] rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm animate-fade-in">
                <DataTable columns={COLUMNS} data={MOCK_LOGS} searchKey="user" />
            </div>
        </div>
    );
}
