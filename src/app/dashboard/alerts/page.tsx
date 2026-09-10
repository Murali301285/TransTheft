'use client';

import { useState, useMemo, useEffect } from 'react';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, Search, ShieldAlert, Bell, ChevronDown, Calendar, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate } from '@/lib/date-utils';
import { clsx } from 'clsx';
import { ApiService } from '@/services/api';
import { Tooltip } from '@/components/ui/Tooltip';
import { useRouter } from 'next/navigation';

export default function AlertsPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    // Default dates to current local date (today)
    const getTodayDateString = () => {
        const d = new Date();
        const offset = d.getTimezoneOffset();
        const localDate = new Date(d.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    };

    const today = getTodayDateString();
    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);

    // Filter states
    const [alertFilter, setAlertFilter] = useState<'all' | 'active' | 'resolved'>('all');
    const [siteSearch, setSiteSearch] = useState('');

    // Stored data from APIs
    const [allAlerts, setAllAlerts] = useState<any[]>([]);
    const [transformers, setTransformers] = useState<any[]>([]);

    // Fetch transformers master list once on mount
    useEffect(() => {
        const fetchTransformers = async () => {
            try {
                const res = await ApiService.transformers.getAll();
                if (res.success && res.data) {
                    const list = Array.isArray(res.data) ? res.data : (res.data as any).response || (res.data as any).result || [];
                    setTransformers(list);
                }
            } catch (e) {
                console.error('Error fetching transformers master:', e);
            }
        };
        fetchTransformers();
    }, []);

    // Load data
    const loadData = async () => {
        setIsLoading(true);
        try {
            const res = await ApiService.alerts.getAll(fromDate, toDate);
            if (res.success && res.data) {
                const list = Array.isArray(res.data) ? res.data : (res.data as any).response || (res.data as any).result || [];
                setAllAlerts(list);
            } else {
                setAllAlerts([]);
            }
        } catch (e) {
            console.error('Error fetching dashboard alerts data:', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Format helper for voltages
    const formatVoltage = (val: any) => {
        if (val === undefined || val === null || val === '-') return '-';
        const num = parseFloat(val);
        return isNaN(num) ? '-' : `${num.toFixed(2)} V`;
    };

    // Calculate Alert stats dynamically from the fetched alerts
    const alertStats = useMemo(() => {
        const total = allAlerts.length;
        
        // Active/Open alerts
        const active = allAlerts.filter(a => {
            const status = (a.alerStatus || a.status || '').toLowerCase();
            return status === 'open' || status === 'active';
        }).length;

        // Critical Active alerts
        const critical = allAlerts.filter(a => {
            const status = (a.alerStatus || a.status || '').toLowerCase();
            const isActive = status === 'open' || status === 'active';
            const isCritical = (a.severity || '').toUpperCase() === 'CRITICAL' || (a.alert || '').toUpperCase() === 'THEFT';
            return isActive && isCritical;
        }).length;

        return { total, active, critical };
    }, [allAlerts]);

    // Data table columns defined identically to lc-management
    const bottomTableColumns = useMemo<ColumnDef<any>[]>(() => [
        {
            id: 'slno',
            header: 'SI No',
            cell: ({ row }) => <span className="text-xs font-semibold text-slate-600">{row.index + 1}</span>,
            size: 60,
            meta: {
                style: { 
                    position: 'sticky', 
                    left: 0, 
                    backgroundColor: '#f8fafc', 
                    zIndex: 10, 
                    borderRight: '1px solid #e2e8f0',
                    width: '60px',
                    minWidth: '60px',
                    maxWidth: '60px',
                    paddingLeft: '12px',
                    paddingRight: '12px'
                }
            }
        },
        {
            accessorKey: 'transformerCode',
            header: 'Transformer Code',
            size: 140,
            meta: {
                style: { 
                    position: 'sticky', 
                    left: 60, 
                    backgroundColor: '#f8fafc', 
                    zIndex: 10, 
                    borderRight: '1px solid #e2e8f0',
                    width: '140px',
                    minWidth: '140px',
                    maxWidth: '140px',
                    paddingLeft: '12px',
                    paddingRight: '12px'
                }
            },
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <Tooltip
                        unstyled
                        content={
                            <div className="min-w-[320px] text-xs bg-slate-950/95 backdrop-blur-md text-slate-100 rounded-xl shadow-2xl border border-slate-800 p-4 font-sans leading-relaxed pointer-events-none">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                        <span className="font-bold text-sm tracking-tight text-white">Transformer Details</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-wider font-mono">
                                        {item.transformerCode || item.id}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-2 text-slate-300">
                                    <span className="text-slate-400 font-medium">Sub Division:</span>
                                    <span className="font-semibold text-slate-100 truncate" title={item.subDivision}>{item.subDivision || '-'}</span>

                                    <span className="text-slate-400 font-medium">Substation:</span>
                                    <span className="font-semibold text-slate-100 truncate" title={item.substation}>{item.substation || '-'}</span>

                                    <span className="text-slate-400 font-medium">Feeder:</span>
                                    <span className="font-semibold text-slate-100 truncate" title={item.feeder}>{item.feeder || '-'}</span>

                                    <span className="text-slate-400 font-medium">Latitude:</span>
                                    <span className="font-mono font-semibold text-slate-100">{item.latitude !== undefined ? item.latitude : '-'}</span>

                                    <span className="text-slate-400 font-medium">Longitude:</span>
                                    <span className="font-mono font-semibold text-slate-100">{item.longitude !== undefined ? item.longitude : '-'}</span>
                                </div>
                            </div>
                        }
                    >
                        <span 
                            className="font-mono font-bold text-blue-600 hover:text-blue-800 cursor-pointer underline decoration-dotted"
                            onClick={() => router.push(`/dashboard/lc-management/${item.transformerCode || item.id}`)}
                        >
                            {item.transformerCode || item.id || '-'}
                        </span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: 'alert',
            header: 'Alert',
            size: 120,
            meta: {
                style: { 
                    position: 'sticky', 
                    left: 200, 
                    backgroundColor: '#f8fafc', 
                    zIndex: 10, 
                    borderRight: '1px solid #e2e8f0', 
                    boxShadow: '4px 0 4px -2px rgba(0,0,0,0.1)',
                    width: '120px',
                    minWidth: '120px',
                    maxWidth: '120px',
                    paddingLeft: '12px',
                    paddingRight: '12px'
                }
            },
            cell: ({ row }) => {
                const alert = row.original.alert as string;
                if (!alert || alert === '-') return <span className="text-slate-400">-</span>;
                const isTheft = alert.toLowerCase() === 'theft';
                return (
                    <span className={clsx(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                        isTheft 
                            ? "bg-red-100 text-red-700 border-red-200 animate-pulse" 
                            : "bg-slate-100 text-slate-700 border-slate-200"
                    )}>
                        {alert}
                    </span>
                );
            }
        },
        {
            accessorKey: 'ownerName',
            header: 'Owner Name',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <Tooltip
                        unstyled
                        content={
                            <div className="min-w-[320px] text-xs bg-slate-950/95 backdrop-blur-md text-slate-100 rounded-xl shadow-2xl border border-slate-800 p-4 font-sans leading-relaxed pointer-events-none">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="font-bold text-sm tracking-tight text-white">Contact Directory</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider font-sans">
                                        Contacts
                                    </span>
                                </div>
                                
                                <div className="space-y-3.5">
                                    {/* Owner Section */}
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1.5 font-sans">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Owner Information
                                        </div>
                                        <div className="grid grid-cols-[85px_1fr] gap-x-2 gap-y-1.5 pl-3 border-l border-emerald-500/20 text-slate-300 font-sans">
                                            <span className="text-slate-400">Name:</span>
                                            <span className="font-semibold text-slate-200 truncate" title={item.ownerName}>{item.ownerName || '-'}</span>
                                            
                                            <span className="text-slate-400">Email:</span>
                                            <span className="font-semibold text-slate-200 truncate" title={item.ownerEmail}>{item.ownerEmail || '-'}</span>
                                            
                                            <span className="text-slate-400">Phone No:</span>
                                            <span className="font-mono font-semibold text-slate-200">{item.ownerPhoneNo || '-'}</span>
                                        </div>
                                    </div>

                                    {/* Neighbor Section */}
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1.5 font-sans">
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Neighbor Information
                                        </div>
                                        <div className="grid grid-cols-[85px_1fr] gap-x-2 gap-y-1.5 pl-3 border-l border-cyan-500/20 text-slate-300 font-sans">
                                            <span className="text-slate-400">Name:</span>
                                            <span className="font-semibold text-slate-200 truncate" title={item.neighborName}>{item.neighborName || '-'}</span>
                                            
                                            <span className="text-slate-400">Email:</span>
                                            <span className="font-semibold text-slate-200 truncate" title={item.neighborEmail}>{item.neighborEmail || '-'}</span>
                                            
                                            <span className="text-slate-400">Phone No:</span>
                                            <span className="font-mono font-semibold text-slate-200">{item.neighborPhoneNo || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    >
                        <span className="font-medium text-slate-800 hover:text-slate-950 cursor-pointer underline decoration-dotted">
                            {item.ownerName || '-'}
                        </span>
                    </Tooltip>
                );
            }
        },
        {
            accessorKey: 'severity',
            header: 'Severity',
            cell: ({ row }) => {
                const sev = row.original.severity as string;
                if (!sev || sev === '-') return <span className="text-slate-400">-</span>;
                return (
                    <span className={clsx(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                        sev === 'CRITICAL' && "bg-red-100 text-red-700 border-red-200 animate-pulse",
                        sev === 'HIGH' && "bg-orange-100 text-orange-700 border-orange-200",
                        sev === 'MEDIUM' && "bg-amber-100 text-amber-700 border-amber-200",
                        sev === 'LOW' && "bg-blue-100 text-blue-700 border-blue-200"
                    )}>
                        {sev}
                    </span>
                );
            }
        },
        {
            accessorKey: 'receivedOn',
            header: 'Received On',
            cell: ({ row }) => <span className="font-mono text-xs">{formatDate(row.original.receivedOn)}</span>
        },
        {
            accessorKey: 'notifiedOn',
            header: 'Notified On',
            cell: ({ row }) => <span className="font-mono text-xs">{formatDate(row.original.notifiedOn)}</span>
        },
        {
            accessorKey: 'status',
            header: 'Current Status',
            cell: ({ row }) => {
                const status = row.original.status as string;
                if (!status || status === '-') return <span className="text-slate-400">-</span>;
                const statusLower = status.toLowerCase();
                const isOpen = statusLower === 'open' || statusLower === 'active';
                return (
                    <span className={clsx(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                        isOpen ? "bg-red-50 text-red-600 border border-red-100 animate-pulse" : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    )}>
                        {isOpen ? 'OPEN' : 'CLOSED'}
                    </span>
                );
            }
        },
        {
            accessorKey: 'updatedBy',
            header: 'Updated By',
            cell: ({ row }) => <span className="text-xs">{row.original.updatedBy || '-'}</span>
        }
    ], [transformers, router]);

    // Mapped Alerts display data
    const displayedAlerts = useMemo(() => {
        return allAlerts.map(d => {
            const code = d.transformerCode || d.transformerId || d.id;
            const match = transformers.find(t => t.transformerCode === code || t.id === code || (code && code.includes(t.transformerCode || '---')));
            return {
                ...d,
                id: code,
                transformerCode: code || '-',
                name: d.transformerName || d.name || match?.name || 'Unknown',
                alert: d.alert || '-',
                ownerName: d.ownerName || match?.ownerName || '-',
                ownerEmail: d.ownerEmail || match?.ownerEmail || '-',
                ownerPhoneNo: d.ownerPhoneNo || match?.ownerPhoneNo || '-',
                neighborName: d.neighborName || match?.neighborName || '-',
                neighborEmail: d.neighborEmail || match?.neighborEmail || '-',
                neighborPhoneNo: d.neighborPhoneNo || match?.neighborPhoneNo || '-',
                severity: d.severity || '-',
                receivedOn: d.receivedOn || '-',
                notifiedOn: d.notifiedOn || '-',
                status: d.alerStatus || d.status || 'Open',
                updatedBy: d.updatedBy || '-',
                closedOn: d.closedOn || '-',
                subDivision: d.subDivision || match?.subDivision || '-',
                substation: d.substation || match?.substation || '-',
                feeder: d.feeder || match?.feeder || '-',
                latitude: d.latitude !== undefined ? d.latitude : (match?.lat || '-'),
                longitude: d.longitude !== undefined ? d.longitude : (match?.lng || '-')
            };
        }).filter(item => {
            // Apply site name search
            if (siteSearch && !item.name.toLowerCase().includes(siteSearch.toLowerCase())) {
                return false;
            }

            // Apply Status Filter: Active (Open) vs Resolved (Closed)
            const isItemActive = item.status.toLowerCase() === 'open' || item.status.toLowerCase() === 'active';
            if (alertFilter === 'active' && !isItemActive) return false;
            if (alertFilter === 'resolved' && isItemActive) return false;

            return true;
        });
    }, [allAlerts, transformers, siteSearch, alertFilter]);



    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Title & Top Cards Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                        <ShieldAlert className="text-[hsl(var(--primary))]" /> Alert Management
                    </h1>
                    <p className="text-[hsl(var(--muted-foreground))] text-sm">Monitor critical system alerts, telemetry deviations, and coordinate notifications.</p>
                </div>

                {/* Neatly Designed Active Critical & Total Active Cards */}
                <div className="flex gap-4">
                    {/* Active Critical Card */}
                    <div className="px-4 py-2 border border-red-200 bg-red-50/50 rounded-xl flex items-center gap-4 shadow-sm min-w-[160px] transition-all hover:shadow-md">
                        <div className="p-2.5 bg-red-100 rounded-lg text-red-600">
                            <Bell size={20} className="animate-pulse" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Active Critical</p>
                            <p className="text-2xl font-black text-red-700 leading-tight">{alertStats.critical}</p>
                        </div>
                    </div>

                    {/* Total Active Card */}
                    <div className="px-4 py-2 border border-slate-200 bg-slate-50/50 rounded-xl flex items-center gap-4 shadow-sm min-w-[160px] transition-all hover:shadow-md">
                        <div className="p-2.5 bg-slate-200/60 rounded-lg text-slate-600">
                            <Activity size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Active</p>
                            <p className="text-2xl font-black text-slate-700 leading-tight">{alertStats.active}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar Panel */}
            <div className="bg-white rounded-xl border border-[hsl(var(--border))] p-4 shadow-sm flex flex-col gap-4">
                
                {/* Tabs & Dynamic Filters Row */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {/* Status Toggle (All, Active, Resolved) */}
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        {(['all', 'active', 'resolved'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setAlertFilter(status)}
                                className={clsx(
                                    "px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all",
                                    alertFilter === status ? "text-white bg-gradient-to-r from-blue-600 to-cyan-500 shadow-md" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Filters Row */}
                    <div className="flex flex-wrap items-center gap-4">
                        {/* From Date */}
                        <div className="flex items-center gap-2 h-9">
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><Calendar size={12} /> From:</span>
                            <input
                                type="date"
                                className="h-8.5 w-36 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </div>

                        {/* To Date */}
                        <div className="flex items-center gap-2 h-9">
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1"><Calendar size={12} /> To:</span>
                            <input
                                type="date"
                                className="h-8.5 w-36 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>

                        {/* Show button */}
                        <Button
                            size="sm"
                            className="h-8.5 text-xs bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold px-4 shadow-sm rounded-lg"
                            onClick={loadData}
                        >
                            Show
                        </Button>

                        {/* Search Site Name */}
                        <div className="w-48">
                            <Input
                                placeholder="Search Site Name..."
                                className="h-8.5 px-2 text-xs py-1 rounded-lg"
                                value={siteSearch}
                                onChange={(e) => setSiteSearch(e.target.value)}
                                leftIcon={<Search size={12} />}
                            />
                        </div>
                    </div>
                </div>

                {/* Custom styling for critical row blinking */}
                <style>{`
                    @keyframes critical-row-blink {
                        0%, 100% { background-color: rgba(254, 226, 226, 0.45); }
                        50% { background-color: rgba(254, 242, 242, 0.85); }
                    }
                    .critical-row td {
                        animation: critical-row-blink 1.8s infinite ease-in-out !important;
                    }
                    .critical-row td:first-child {
                        border-left: 4px solid #ef4444 !important;
                    }
                `}</style>

                {/* Table Section */}
                <div className="border border-[hsl(var(--border))] rounded-lg overflow-hidden min-h-[300px]">
                    <DataTable
                        columns={bottomTableColumns}
                        minWidth="1200px"
                        data={displayedAlerts}
                        searchKey="transformerCode"
                        isLoading={isLoading}
                        getRowClassName={(row) => {
                            const sev = row.original.severity as string;
                            const alert = row.original.alert as string;
                            if (sev === 'CRITICAL' || alert === 'THEFT') {
                                return 'critical-row';
                            }
                            return '';
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
