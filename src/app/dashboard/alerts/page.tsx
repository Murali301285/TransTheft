'use client';

import { useState } from 'react';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, CheckCircle, Clock, Filter, Search, ShieldAlert, Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/date-utils';
import { clsx } from 'clsx';

// Types
interface Alert {
    id: string;
    transformerId: string;
    transformerName: string;
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    status: 'active' | 'acknowledged' | 'resolved';
    timestamp: string;
    message: string;
}

// Mock Data
const MOCK_ALERTS: Alert[] = Array.from({ length: 30 }).map((_, i) => ({
    id: `ALT-${1000 + i}`,
    transformerId: `TR-${1000 + (i % 10)}`,
    transformerName: `Transformer ${1000 + (i % 10)}`,
    type: ['Voltage Surge', 'Oil Level Low', 'Temperature High', 'Power Outage'][i % 4],
    severity: (['critical', 'high', 'medium', 'low'] as const)[i % 4],
    status: (['active', 'acknowledged', 'resolved'] as const)[i % 3],
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    message: 'Threshold exceeded duration > 5 mins.'
}));

export default function AlertsPage() {
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const columns: ColumnDef<Alert>[] = [
        {
            accessorKey: 'severity',
            header: 'Severity',
            cell: ({ row }) => {
                const sev = row.original.severity;
                return (
                    <span className={clsx(
                        "px-2 py-1 rounded-full text-xs font-bold uppercase border flex items-center w-fit gap-1",
                        sev === 'critical' && "bg-red-100 text-red-700 border-red-200",
                        sev === 'high' && "bg-orange-100 text-orange-700 border-orange-200",
                        sev === 'medium' && "bg-yellow-100 text-yellow-700 border-yellow-200",
                        sev === 'low' && "bg-blue-100 text-blue-700 border-blue-200",
                    )}>
                        {sev === 'critical' && <AlertTriangle size={10} />}
                        {sev}
                    </span>
                );
            }
        },
        { accessorKey: 'transformerName', header: 'Transformer' },
        {
            accessorKey: 'type',
            header: 'Alert Type',
            cell: ({ row }) => <span className="font-medium">{row.original.type}</span>
        },
        { accessorKey: 'message', header: 'Message' },
        {
            accessorKey: 'timestamp',
            header: 'Time',
            cell: ({ row }) => <span className="text-xs text-gray-500 font-mono">{formatDate(row.original.timestamp)}</span>
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <span className={clsx(
                        "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                        status === 'active' && "bg-red-50 text-red-600",
                        status === 'acknowledged' && "bg-yellow-50 text-yellow-600",
                        status === 'resolved' && "bg-green-50 text-green-600"
                    )}>
                        {status}
                    </span>
                );
            }
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => (
                row.original.status !== 'resolved' && (
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                        Acknowledge
                    </Button>
                )
            )
        }
    ];

    const filteredData = MOCK_ALERTS.filter(alert => {
        if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
        return true;
    });

    const activeCount = MOCK_ALERTS.filter(a => a.status === 'active').length;
    const criticalCount = MOCK_ALERTS.filter(a => a.severity === 'critical' && a.status === 'active').length;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldAlert className="text-[hsl(var(--primary))]" /> System Alerts
                    </h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Monitor and manage critical system events.</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-red-50 border border-red-100 rounded-lg flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full text-red-600">
                            <Bell size={18} className="animate-pulse" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-red-600 uppercase">Active Critical</p>
                            <p className="text-2xl font-bold text-red-700 leading-none">{criticalCount}</p>
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-white border border-[hsl(var(--border))] rounded-lg flex items-center gap-3">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Total Active</p>
                            <p className="text-2xl font-bold text-gray-700 leading-none">{activeCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-[hsl(var(--border))] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[hsl(var(--border))] flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-500" />
                        <div className="flex bg-white border rounded-md overflow-hidden">
                            {(['all', 'active', 'acknowledged', 'resolved'] as const).map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={clsx(
                                        "px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                                        statusFilter === status
                                            ? "bg-[hsl(var(--primary))] text-white"
                                            : "hover:bg-gray-100 text-gray-600"
                                    )}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <DataTable
                    columns={columns}
                    data={filteredData}
                    searchKey="transformerName"
                />
            </div>
        </div>
    );
}
