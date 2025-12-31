'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, MapPin, AlertTriangle, Calendar, Info, Activity } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { clsx } from 'clsx';

// Types
interface AlertRecord {
    id: string;
    sNo: number;
    circle: string;
    division: string;
    transformerId: string;
    transformerName: string;
    status: 'High' | 'Medium' | 'Low' | 'Critical';
    severity: string;
    dateTime: string;
    remarks: string;
}

// Mock Data for Transformer Details
const DEMO_DETAILS = {
    id: 'TR-1001',
    name: 'Transformer 1001',
    address: '12th Main, Indiranagar, Bangalore',
    lat: 12.9716,
    lng: 77.5946,
    capacity: '250 KVA',
    make: 'ABB',
    installDate: '2023-01-15',
    lastMaintenance: '2024-11-20',
    circle: 'North Circle',
    division: 'Div-1',
    subdivision: 'SubDiv-A'
};

// Mock Data for Alerts
const MOCK_ALERTS: AlertRecord[] = Array.from({ length: 20 }).map((_, i) => ({
    id: `ALT-${1000 + i}`,
    sNo: i + 1,
    circle: 'North Circle',
    division: 'Div-1',
    transformerId: 'TR-1001',
    transformerName: 'Transformer 1001',
    status: i % 4 === 0 ? 'Critical' : i % 3 === 0 ? 'High' : 'Medium',
    severity: i % 4 === 0 ? 'L1' : 'L2',
    dateTime: new Date(Date.now() - i * 86400000).toISOString(), // Generate past dates
    remarks: 'Voltage fluctuation detected exceeding threshold.'
}));

export default function TransformerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    // Date Filters
    const today = new Date().toISOString().split('T')[0];
    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);

    // Columns
    const COLUMNS: ColumnDef<AlertRecord>[] = [
        { accessorKey: 'sNo', header: 'S.No', size: 60 },
        { accessorKey: 'circle', header: 'Circle' },
        { accessorKey: 'division', header: 'Division' },
        { accessorKey: 'transformerId', header: 'Transformer ID' },
        { accessorKey: 'transformerName', header: 'Transformer Name' },
        {
            accessorKey: 'status',
            header: 'Alert Status',
            cell: ({ row }) => {
                const status = row.original.status;
                const colorClass =
                    status === 'Critical' ? 'text-red-600 bg-red-100 border-red-200' :
                        status === 'High' ? 'text-orange-600 bg-orange-100 border-orange-200' :
                            status === 'Medium' ? 'text-yellow-600 bg-yellow-100 border-yellow-200' : 'text-blue-600 bg-blue-100 border-blue-200';

                return <span className={`px-2 py-1 rounded-full text-xs font-bold border ${colorClass}`}>{status}</span>
            }
        },
        { accessorKey: 'severity', header: 'Alert Severity' },
        {
            accessorKey: 'dateTime',
            header: 'Date Time',
            cell: ({ row }) => formatDate(row.original.dateTime)
        },
        { accessorKey: 'remarks', header: 'Remarks' },
    ];

    // Filter Logic
    const filteredAlerts = MOCK_ALERTS.filter(alert => {
        const alertDate = alert.dateTime.split('T')[0];
        return alertDate >= fromDate && alertDate <= toDate;
    });

    return (
        <div className="space-y-6 animate-fade-in relative pb-10">
            {/* Header / Nav */}
            <div className="flex items-center gap-4 border-b border-[hsl(var(--border))] pb-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                    <ArrowLeft size={20} className="mr-2" /> Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {id.replace('TR-', 'Transformer ')} Details
                        <span className="text-sm font-normal text-[hsl(var(--muted-foreground))] bg-slate-100 px-2 py-0.5 rounded-md border">
                            {DEMO_DETAILS.circle} / {DEMO_DETAILS.division}
                        </span>
                    </h1>
                </div>
            </div>

            {/* Top Section: Details & Map */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Info Cards */}
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-xl border border-[hsl(var(--border))] shadow-sm">
                        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4 text-[hsl(var(--primary))]">
                            <Info size={20} /> Other Information
                        </h3>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                            <div>
                                <span className="block text-[hsl(var(--muted-foreground))] text-xs uppercase font-medium mb-1">Location / Address</span>
                                <div className="flex items-start gap-2">
                                    <MapPin size={16} className="mt-0.5 text-red-500 shrink-0" />
                                    <span className="font-medium">{DEMO_DETAILS.address}</span>
                                </div>
                            </div>

                            <div>
                                <span className="block text-[hsl(var(--muted-foreground))] text-xs uppercase font-medium mb-1">Coordinates</span>
                                <span className="font-mono bg-slate-50 px-2 py-1 rounded text-xs border">{DEMO_DETAILS.lat}, {DEMO_DETAILS.lng}</span>
                            </div>

                            <div>
                                <span className="block text-[hsl(var(--muted-foreground))] text-xs uppercase font-medium mb-1">Capacity</span>
                                <span className="font-medium">{DEMO_DETAILS.capacity}</span>
                            </div>

                            <div>
                                <span className="block text-[hsl(var(--muted-foreground))] text-xs uppercase font-medium mb-1">Make / Model</span>
                                <span className="font-medium">{DEMO_DETAILS.make}</span>
                            </div>

                            <div>
                                <span className="block text-[hsl(var(--muted-foreground))] text-xs uppercase font-medium mb-1">Install Date</span>
                                <span className="font-medium">{formatDate(DEMO_DETAILS.installDate)}</span>
                            </div>

                            <div>
                                <span className="block text-[hsl(var(--muted-foreground))] text-xs uppercase font-medium mb-1">Last Maintenance</span>
                                <span className="font-medium">{formatDate(DEMO_DETAILS.lastMaintenance)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Current Status Widget */}
                    <div className="bg-white p-6 rounded-xl border border-[hsl(var(--border))] shadow-sm flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-sm text-[hsl(var(--muted-foreground))] uppercase">Current Live Status</h3>
                            <p className="text-2xl font-bold text-green-600 mt-1 flex items-center gap-2">
                                <Activity size={24} /> Active / Healthy
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-[hsl(var(--muted-foreground))]">Last Ping</span>
                            <p className="font-mono text-sm">Just now</p>
                        </div>
                    </div>
                </div>

                {/* Right: Map View */}
                <div className="h-[400px] lg:h-auto min-h-[300px] bg-slate-100 rounded-xl border border-[hsl(var(--border))] relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-[url('/map-pattern.png')] opacity-10 pointer-events-none"></div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <MapPin size={32} />
                        </div>
                        <p className="text-[hsl(var(--muted-foreground))] font-medium">Transformer Map View</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] opacity-70">Interactive GIS Layer</p>
                    </div>
                    {/* Simulated Pin */}
                    <div className="absolute top-1/2 left-1/2 -ml-2 -mt-2 w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-lg"></div>
                </div>
            </div>

            {/* Bottom Section: Alerts Table */}
            <div className="bg-white rounded-xl border border-[hsl(var(--border))] shadow-sm overflow-hidden mt-8">
                <div className="p-4 border-b border-[hsl(var(--border))] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle size={20} />
                        <h3 className="font-bold text-lg">Alert Status</h3>
                    </div>

                    {/* Date Filters */}
                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase flex items-center gap-1">
                            <Calendar size={14} /> Filter Range:
                        </span>
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                                <label className="text-[10px] text-gray-500 font-semibold ml-1">From</label>
                                <input
                                    type="date"
                                    className="h-8 rounded border border-gray-300 px-2 text-xs bg-white"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </div>
                            <span className="text-gray-400 mt-3">-</span>
                            <div className="flex flex-col">
                                <label className="text-[10px] text-gray-500 font-semibold ml-1">To</label>
                                <input
                                    type="date"
                                    className="h-8 rounded border border-gray-300 px-2 text-xs bg-white"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-0">
                    <DataTable
                        columns={COLUMNS}
                        data={filteredAlerts}
                        searchKey="remarks"
                    />
                </div>
            </div>
        </div>
    );
}
