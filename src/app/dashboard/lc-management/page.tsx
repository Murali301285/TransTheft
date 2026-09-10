'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { TransformerDetails } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Map as MapIcon, AlertTriangle, CheckCircle, XCircle, Search, Filter, MapPin, Play, Pause, RotateCcw, Zap, Database, Activity, Server, PowerOff, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';
import { formatDate } from '@/lib/date-utils';
import MapView from '@/components/Map';
import { useRouter } from 'next/navigation';
import { ApiService } from '@/services/api';
import { Tooltip } from '@/components/ui/Tooltip';
import { TransformerLoader } from '@/components/ui/TransformerLoader';

// Extended type for Grid Display including hierarchy info
type TransformerGridItem = TransformerDetails & {
    customerName?: string;
    transformerCode?: string;
    circle: string;
    division: string;
    subDivision?: string;
    substation?: string;
    subGrid?: string;
    feeder?: string;
    masterDevice?: string;
    masterCommunicationId?: any;
    nodeDevice?: string;
    nodeStatus?: string;
    nodeCommunicationId?: any;
    solarVoltage?: any;
    batteryVoltage?: any;
    deviceVoltage?: any;
    lastRececivedOn?: string;
    masterStatus?: string;
    displayStatus?: string;
    alertType?: string;
    ownerName?: string;
    ownerEmail?: string;
    ownerPhoneNo?: string;
    neighborName?: string;
    neighborEmail?: string;
    neighborPhoneNo?: string;
};

// Helper to format/clean customer name (e.g. deduplicating "Name - Name")
const formatCustomerName = (raw: any): string => {
    if (!raw || typeof raw !== 'string' || raw.trim() === '' || raw.trim() === '-') return '-';
    const trimmed = raw.trim();
    const parts = trimmed.split(' - ');
    if (parts.length === 2 && parts[0].trim().toLowerCase() === parts[1].trim().toLowerCase()) {
        return parts[0].trim();
    }
    return trimmed;
};

// Helper to extract clean transformer code (e.g. "TUP-NB001-250" -> "TUP-NB001", "TR-TUP-NB001" -> "TUP-NB001")
const getCleanTransformerCode = (item: any): string => {
    if (!item) return '';
    if (typeof item === 'string') {
        return item.replace(/^TR-/, '').replace(/-\d+$/, '').trim();
    }
    const raw = item.transformer || item.Transformer || item.transformerCode || item.TransformerCode || item.masterCode || item.MasterCode || item.code || item.Code || item.transformerId || item.TransformerId || item.masterId || item.MasterId || item.id || item.Id || '';
    return String(raw).replace(/^TR-/, '').replace(/-\d+$/, '').trim();
};

// Helper to parse date strings for reliable chronological comparisons
const parseTimestamp = (val: any): number => {
    if (!val || val === '-') return 0;
    if (typeof val === 'number') return val;
    const str = String(val).trim();
    const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (dmyMatch) {
        const [_, day, month, year, hours, minutes, seconds] = dmyMatch;
        return new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            hours ? parseInt(hours) : 0,
            minutes ? parseInt(minutes) : 0,
            seconds ? parseInt(seconds) : 0
        ).getTime();
    }
    const t = new Date(str).getTime();
    return isNaN(t) ? 0 : t;
};

// Helper to format date and time as DD/MM/YYYY HH:mm:ss
const formatDateTime = (date: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

export default function LCManagementPage() {
    const router = useRouter();
    const [transformers, setTransformers] = useState<TransformerGridItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [isPaused, setIsPaused] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [maximizedPanel, setMaximizedPanel] = useState<'none' | 'grid' | 'map'>('none');

    // Utility to format voltage readings safely
    const formatVoltage = (val: any) => {
        if (val === undefined || val === null || val === '-') return '-';
        const num = parseFloat(val);
        return isNaN(num) ? '-' : `${num.toFixed(2)} V`;
    };

    // Helper to get past date string (current date - N days)
    const getPastDateString = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        return d.toISOString().split('T')[0];
    };

    // New State for Bottom Panel Tabs
    const [activeTab, setActiveTab] = useState<'alerts' | 'periodic'>('alerts');
    const [alertFilter, setAlertFilter] = useState<'all' | 'active' | 'inactive'>('all');

    // Periodic Filter State (default to last 30 days)
    const [periodicFilters, setPeriodicFilters] = useState({
        fromDate: getPastDateString(30),
        toDate: new Date().toISOString().split('T')[0],
        siteSearch: ''
    });

    // Alert Tab State
    const [alertTab, setAlertTab] = useState<'open' | 'closed'>('open');
    const [allAlerts, setAllAlerts] = useState<any[]>([]);
    const [alertStatusFilter, setAlertStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
    const [periodicAlertFilter, setPeriodicAlertFilter] = useState<'all' | 'open' | 'closed'>('all');
    const [alertFilters, setAlertFilters] = useState({
        fromDate: getPastDateString(30),
        toDate: new Date().toISOString().split('T')[0]
    });

    // Function to fetch all Alerts (both open and closed)
    const fetchAlerts = async () => {
        setIsLoading(true);
        try {
            const res = await ApiService.alerts.getAll(alertFilters.fromDate, alertFilters.toDate);

            console.group('--- Alert Data Fetch ---');
            console.log('Response:', res);

            if (res.success && res.data) {
                const list = Array.isArray(res.data) ? res.data : (res.data as any).response || (res.data as any).result || [];
                console.log('Extracted List:', list);
                console.groupEnd();
                setAllAlerts(list);
            } else {
                console.warn('Failed to fetch alerts', res);
                console.groupEnd();
                setAllAlerts([]);
            }
        } catch (e) {
            console.error('Error fetching alerts', e);
            setAllAlerts([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch alerts when activeTab is 'alerts'
    useEffect(() => {
        if (activeTab === 'alerts') {
            fetchAlerts();
        }
    }, [activeTab]);

    const [periodicData, setPeriodicData] = useState<any[]>([]);

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            // Fetch both transactions and alerts for the selected range in parallel
            const [res, alertsRes] = await Promise.all([
                ApiService.transformers.getTransactionsByUser(
                    periodicFilters.fromDate,
                    periodicFilters.toDate
                ),
                ApiService.alerts.getAll(
                    periodicFilters.fromDate,
                    periodicFilters.toDate
                )
            ]);

            if (alertsRes.success && alertsRes.data) {
                const alertsList = Array.isArray(alertsRes.data) ? alertsRes.data : (alertsRes.data as any).response || (alertsRes.data as any).result || [];
                setAllAlerts(alertsList);
            }

            if (res.success && res.data) {
                const list = Array.isArray(res.data) ? res.data : (res.data as any).response || (res.data as any).result || [];
                console.group('--- Dashboard Transactions (Periodic) ---');
                console.log('Endpoint: /api/Dashboard/transformer-transactions-by-user');
                console.log('Response JSON:', list);
                console.groupEnd();

                const mappedPeriodic = list.map((item: any) => ({
                    ...item,
                    siteName: item.siteName || item.transformerName || item.masterName,
                    transName: item.transName || item.transformerName,
                    fromDate: item.fromDate || periodicFilters.fromDate,
                    toDate: item.toDate || periodicFilters.toDate,
                    sv: item.sv || item.secondaryVoltage || '-',
                    bv: item.bv || item.batteryVoltage || '-',
                    dv: item.dv || item.deviation || '-'
                })).sort((a: any, b: any) => 
                    parseTimestamp(b.lastRececivedOn || b.lastPing || b.receivedOn || b.dateTime) - 
                    parseTimestamp(a.lastRececivedOn || a.lastPing || a.receivedOn || a.dateTime)
                );
                setPeriodicData(mappedPeriodic);
            } else {
                console.warn('Failed to fetch periodic data', res);
            }
        } catch (e) {
            console.error('Error fetching transactions', e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'periodic') {
            fetchTransactions();
        }
    }, [activeTab]);

    const columns = useMemo<ColumnDef<TransformerGridItem>[]>(() => [
        {
            id: 'slno',
            header: 'SI No',
            cell: ({ row }) => <span className="text-xs font-medium text-slate-500">{row.index + 1}</span>,
            size: 60,
        },
        { accessorKey: 'id', header: 'Transformer ID' },
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'circle', header: 'Circle' },
        { accessorKey: 'division', header: 'Division' },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status as string;
                const isAlert = status === 'alert' || (status !== 'active' && status !== 'inactive' && status !== 'disabled');
                return (
                    <span className={clsx(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        status === 'active' && "bg-emerald-100 text-emerald-700 border border-emerald-200",
                        status === 'inactive' && "bg-red-100 text-red-700 border border-red-200",
                        status === 'disabled' && "bg-gray-100 text-gray-700 border border-gray-200",
                        isAlert && "bg-red-100 text-red-700 border border-red-200 animate-pulse",
                    )}>
                        {status}
                    </span>
                );
            }
        },
        {
            accessorKey: 'lastPing',
            header: 'Date Time',
            cell: ({ row }) => <span className="font-mono text-xs">{formatDate(row.original.lastPing)}</span>
        },
        {
            id: 'actions',
            header: 'Action',
            cell: ({ row }) => (
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => router.push(`/dashboard/lc-management/${row.original.id}`)}
                >
                    View
                </Button>
            )
        }
    ], [router]);

    // Columns for Bottom Tables (Alert Status / Periodic Data)
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
                        <span className="font-mono font-bold text-blue-600 hover:text-blue-800 cursor-pointer underline decoration-dotted">
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
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                                        Contacts
                                    </span>
                                </div>
                                
                                <div className="space-y-3.5">
                                    {/* Owner Section */}
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Owner Information
                                        </div>
                                        <div className="grid grid-cols-[85px_1fr] gap-x-2 gap-y-1.5 pl-3 border-l border-emerald-500/20 text-slate-300">
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
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1.5 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Neighbor Information
                                        </div>
                                        <div className="grid grid-cols-[85px_1fr] gap-x-2 gap-y-1.5 pl-3 border-l border-cyan-500/20 text-slate-300">
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
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                        sev === 'CRITICAL' && "bg-red-100 text-red-700 border border-red-200 animate-pulse",
                        sev === 'HIGH' && "bg-orange-100 text-orange-700 border border-orange-200",
                        sev === 'MEDIUM' && "bg-amber-100 text-amber-700 border border-amber-200",
                        sev === 'LOW' && "bg-blue-100 text-blue-700 border border-blue-200"
                    )}>
                        {sev}
                    </span>
                );
            }
        },
        {
            accessorKey: 'receivedOn',
            header: 'Received On',
            sortingFn: (rowA, rowB, columnId) => {
                const a = parseTimestamp(rowA.getValue(columnId));
                const b = parseTimestamp(rowB.getValue(columnId));
                return a < b ? -1 : a > b ? 1 : 0;
            },
            cell: ({ row }) => <span className="font-mono text-xs">{formatDate(row.original.receivedOn)}</span>
        },
        {
            accessorKey: 'notifiedOn',
            header: 'Notified On',
            sortingFn: (rowA, rowB, columnId) => {
                const a = parseTimestamp(rowA.getValue(columnId));
                const b = parseTimestamp(rowB.getValue(columnId));
                return a < b ? -1 : a > b ? 1 : 0;
            },
            cell: ({ row }) => <span className="font-mono text-xs">{formatDate(row.original.notifiedOn)}</span>
        },
        {
            accessorKey: 'status',
            header: 'Current Status',
            cell: ({ row }) => {
                const status = row.original.status as string;
                if (!status || status === '-') return <span className="text-slate-400">-</span>;
                const statusLower = status.toLowerCase();
                const isOnline = statusLower === 'online' || statusLower === 'active' || statusLower === 'closed' || statusLower === 'resolved';
                const isOffline = statusLower === 'offline' || statusLower === 'inactive';
                const isOpen = statusLower === 'open';
                return (
                    <span className={clsx(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                        isOnline && "bg-emerald-100 text-emerald-700 border border-emerald-200",
                        (isOffline || isOpen) && "bg-red-50 text-red-600 border border-red-100 animate-pulse",
                        !isOnline && !isOffline && !isOpen && "bg-blue-100 text-blue-700 border border-blue-200"
                    )}>
                        {statusLower === 'closed' ? 'CLOSED' : (statusLower === 'open' ? 'OPEN' : status.toUpperCase())}
                    </span>
                );
            }
        },
        {
            accessorKey: 'updatedBy',
            header: 'Updated By',
            cell: ({ row }) => <span className="text-xs">{row.original.updatedBy || '-'}</span>
        },
        {
            accessorKey: 'closedOn',
            header: 'Closed On',
            sortingFn: (rowA, rowB, columnId) => {
                const a = parseTimestamp(rowA.getValue(columnId));
                const b = parseTimestamp(rowB.getValue(columnId));
                return a < b ? -1 : a > b ? 1 : 0;
            },
            cell: ({ row }) => <span className="font-mono text-xs">{formatDate(row.original.closedOn)}</span>
        }
    ], []);

    const alertStats = useMemo(() => {
        const total = allAlerts.length;
        const open = allAlerts.filter(a => (a.alerStatus || a.status || '').toLowerCase() === 'open').length;
        const closed = total - open;
        return { total, open, closed };
    }, [allAlerts]);

    const displayedAlerts = useMemo(() => {
        const filtered = allAlerts.filter(a => {
            const status = (a.alerStatus || a.status || '').toLowerCase();
            
            if (alertStatusFilter === 'all') {
                return alertTab === 'open' ? status === 'open' : status !== 'open';
            }
            if (alertStatusFilter === 'open') return status === 'open';
            if (alertStatusFilter === 'closed') return status !== 'open';
            return true;
        });

        return filtered.sort((a, b) => 
            parseTimestamp(b.receivedOn || b.receivedDate || b.lastRececivedOn || b.dateTime) - 
            parseTimestamp(a.receivedOn || a.receivedDate || a.lastRececivedOn || a.dateTime)
        );
    }, [allAlerts, alertTab, alertStatusFilter]);

    const fetchData = useCallback(async () => {
            setIsLoading(true);
            try {
                // Fetch master, transactions, and live alerts in parallel
                const [masterRes, response, alertsRes] = await Promise.all([
                    ApiService.transformers.getAll(),
                    ApiService.transformers.getTransactionsByUser(),
                    ApiService.alerts.getAll(alertFilters.fromDate, alertFilters.toDate)
                ]);

                let masterTransformers: any[] = [];
                if (masterRes.success && masterRes.data) {
                    masterTransformers = Array.isArray(masterRes.data)
                        ? masterRes.data
                        : (masterRes.data as any).response || (masterRes.data as any).result || [];
                }

                let alertsList: any[] = [];
                if (alertsRes && alertsRes.success && alertsRes.data) {
                    alertsList = Array.isArray(alertsRes.data)
                        ? alertsRes.data
                        : (alertsRes.data as any).response || (alertsRes.data as any).result || [];
                    setAllAlerts(alertsList);
                }

                if (response.success && response.data) {
                    const rawData = response.data as any;
                    
                    // Log the raw data to our node backend for verification
                    try {
                        fetch('/api/inspect', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ source: 'getTransactionsByUser', data: rawData })
                        });
                    } catch (e) {
                        // ignore inspect error
                    }

                    const list = Array.isArray(rawData) ? rawData : (rawData.response || rawData.result || []);

                    console.group('--- LC Management Data ---');
                    console.log('Raw API Response:', rawData);
                    console.log('Extracted List:', list);
                    console.groupEnd();

                    if (Array.isArray(list)) {
                        // 1. Map to standardize structure
                        const mappedItems: TransformerGridItem[] = list.map((item: any) => {
                            // Parse transformer name and capacity
                            let transCode = '';
                            let transCapacity = '100';
                            if (item.transformer) {
                                const parts = item.transformer.split('-');
                                if (parts.length > 1) {
                                    transCapacity = parts[parts.length - 1];
                                    transCode = parts.slice(0, -1).join('-');
                                } else {
                                    transCode = item.transformer;
                                }
                            } else if (item.Transformer) {
                                const parts = item.Transformer.split('-');
                                if (parts.length > 1) {
                                    transCapacity = parts[parts.length - 1];
                                    transCode = parts.slice(0, -1).join('-');
                                } else {
                                    transCode = item.Transformer;
                                }
                            }

                            const rawId = transCode || item.transformerCode || item.TransformerCode || item.masterCode || item.MasterCode || item.code || item.Code || item.transformerId || item.TransformerId || item.masterId || item.MasterId || item.id || item.Id;
                            const resolvedId = typeof rawId === 'string' && rawId.startsWith('TR-') ? rawId : `TR-${rawId || 'undefined'}`;

                            // Find matching master transformer
                            const cleanCode = transCode || item.transformerCode || '';
                            const masterMatch = masterTransformers.find(t => 
                                t.transformerCode === cleanCode || 
                                t.transformerCode === rawId ||
                                (cleanCode && t.transformerCode?.includes(cleanCode)) ||
                                (t.transformerCode && cleanCode.includes(t.transformerCode))
                            );

                            // Support both camelCase and PascalCase casings from the API
                            const subDivision = item.subDivision || item.SubDivision || masterMatch?.subDivision || '-';
                            const substation = item.subGrid || item.subGridName || item.substation || item.Substation || masterMatch?.subStationName || '-';
                            const feeder = item.feeder || item.Feeder || masterMatch?.feederName || '-';
                            const masterDevice = item.masterDevice || item.MasterDevice || '-';
                            const masterCommunicationId = item.masterCommunicationId || item.MasterCommunicationId || '-';
                            const nodeDevice = item.nodeDevice || item.NodeDevice || '-';
                            const nodeStatus = item.nodeStatus || item.NodeStatus || 'Offline';
                            const nodeCommunicationId = item.nodeCommunicationId || item.NodeCommunicationId || '-';
                            const solarVoltage = item.solarVoltage || item.SolarVoltage || '-';
                            const batteryVoltage = item.batteryVoltage || item.BatteryVoltage || '-';
                            const deviceVoltage = item.deviceVoltage || item.DeviceVoltage || '-';
                            const lastRececivedOn = item.lastRececivedOn || item.LastRececivedOn || item.lastReceivedOn || item.LastReceivedOn || '-';

                            // Extract matching alerts for this transformer
                            const matchingAlerts = alertsList.filter((a: any) => {
                                const aClean = getCleanTransformerCode(a);
                                return aClean && cleanCode && aClean.toLowerCase() === cleanCode.toLowerCase();
                            }).sort((a: any, b: any) => parseTimestamp(b.receivedOn || b.receivedDate || b.lastRececivedOn || b.dateTime) - parseTimestamp(a.receivedOn || a.receivedDate || a.lastRececivedOn || a.dateTime));

                            const latestAlert = matchingAlerts[0];

                            // Determine displayStatus & site status based on User Rule:
                            // "dont show online -> instead show active | inactive |theft (as per the alert)"
                            // "if inactive then inactive otherwise active"
                            const masterStatus = item.masterStatus || item.MasterStatus || (item.isOnline || item.IsOnline ? 'Online' : 'Offline');
                            let alertType = '';
                            let displayStatus = 'ACTIVE';
                            let status: 'active' | 'inactive' | 'alert' = 'active';

                            if (latestAlert) {
                                alertType = (latestAlert.alert || latestAlert.alertType || latestAlert.alertName || '').toUpperCase();
                                if (alertType === 'INACTIVE') {
                                    displayStatus = 'INACTIVE';
                                    status = 'inactive';
                                } else if (alertType === 'THEFT') {
                                    displayStatus = 'THEFT';
                                    status = 'active';
                                } else if (alertType === 'ACTIVE') {
                                    displayStatus = 'ACTIVE';
                                    status = 'active';
                                } else {
                                    displayStatus = alertType;
                                    status = 'active';
                                }
                            } else {
                                const isNodeOnline = (nodeStatus && nodeStatus.toLowerCase() === 'online');
                                if (!isNodeOnline) {
                                    displayStatus = 'INACTIVE';
                                    status = 'inactive';
                                } else {
                                    displayStatus = 'ACTIVE';
                                    status = 'active';
                                }
                            }

                            // Calculate Last Ping: latest received timestamp between alert and telemetry
                            let resolvedLastPing = lastRececivedOn;
                            if (latestAlert && latestAlert.receivedOn) {
                                const alertTime = parseTimestamp(latestAlert.receivedOn);
                                const txTime = parseTimestamp(lastRececivedOn);
                                if (alertTime > txTime) {
                                    resolvedLastPing = latestAlert.receivedOn;
                                }
                            }

                            // Resolve Customer Name
                            const rawCustomer = item.customerName || item.CustomerName || item.customer || item.Customer || item.consumerName || item.ConsumerName || masterMatch?.customerName || masterMatch?.CustomerName || masterMatch?.consumerName || item.ownerName || masterMatch?.ownerName || '-';
                            const customerName = formatCustomerName(rawCustomer);

                            return {
                                ...item, // Spread original item to keep all raw properties available
                                id: resolvedId,
                                transformerCode: cleanCode || masterMatch?.transformerCode || rawId || '-',
                                name: transCode || cleanCode || item.transformerCode || item.TransformerCode || item.masterName || item.MasterName || item.name || item.Name || `Transformer ${rawId || 'Unknown'}`,
                                customerName,
                                circle: item.circleName || item.CircleName || 'N/A',
                                division: item.divisionName || item.DivisionName || 'N/A',
                                lat: parseFloat(item.latitude || item.Latitude || masterMatch?.latitude || '12.9716') || 12.9716,
                                lng: parseFloat(item.longitude || item.Longitude || masterMatch?.longitude || '77.5946') || 77.5946,
                                capacity: transCapacity || item.capacityKVA || item.CapacityKVA || masterMatch?.capacityKVA || item.capacity || item.Capacity || '100 KVA',
                                status,
                                masterStatus,
                                displayStatus,
                                alertType,
                                nodeStatus: displayStatus,
                                lastPing: resolvedLastPing !== '-' ? resolvedLastPing : new Date().toISOString(),
                                address: item.address || item.Address || substation || 'Unknown Location',
                                
                                // Merge contact details from master
                                ownerName: item.ownerName || masterMatch?.ownerName || '-',
                                ownerEmail: item.ownerEmail || masterMatch?.ownerEmail || '-',
                                ownerPhoneNo: item.ownerPhoneNo || masterMatch?.ownerPhoneNo || '-',
                                neighborName: item.neighborName || masterMatch?.neighborName || '-',
                                neighborEmail: item.neighborEmail || masterMatch?.neighborEmail || '-',
                                neighborPhoneNo: item.neighborPhoneNo || masterMatch?.neighborPhoneNo || '-',

                                // Explicitly expose values for tooltip mapping
                                subDivision,
                                substation,
                                feeder,
                                masterDevice,
                                masterCommunicationId,
                                nodeDevice,
                                nodeCommunicationId,
                                solarVoltage,
                                batteryVoltage,
                                deviceVoltage,
                                lastRececivedOn: resolvedLastPing,
                                nearestCustomers: []
                            };
                        });

                        // 2. Filter invalid IDs
                        const validItems = mappedItems.filter(item => item.id && item.id !== 'TR-undefined');

                        // 3. Deduplicate by ID
                        const uniqueItems = Array.from(new Map(validItems.map(item => [item.id, item])).values());

                        setTransformers(uniqueItems);
                        setLastUpdated(new Date());
                    }
                }
            } catch (error) {
                console.error("Failed to load map data", error);
            } finally {
                setIsLoading(false);
            }
        }, [alertFilters.fromDate, alertFilters.toDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleManualRefresh = () => {
        setTimeLeft(60);
        fetchData();
        if (activeTab === 'alerts') {
            fetchAlerts();
        } else if (activeTab === 'periodic') {
            fetchTransactions();
        }
    };

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    fetchData();
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isPaused]);

    const filteredData = transformers.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.customerName && item.customerName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const activeCount = transformers.filter(i => i.status !== 'inactive').length;
    const inactiveCount = transformers.filter(i => i.status === 'inactive').length;
    const totalCount = transformers.length;
    const alertCount = allAlerts.filter(a => (a.alerStatus || a.status || '').toLowerCase() === 'open').length || allAlerts.length;

    const toggleMaximize = (panel: 'grid' | 'map') => {
        if (maximizedPanel === panel) {
            setMaximizedPanel('none');
        } else {
            setMaximizedPanel(panel);
        }
    };

    return (
        <div className="space-y-4 h-full flex flex-col">


            {/* Top KPI Cards - Redesigned (Big Icon Left, Data Center) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
                {/* Total Transformers */}
                <div className="relative overflow-hidden pl-3 pr-2 py-2 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] h-[72px] flex items-center justify-between">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100/50">
                        <Server size={28} className="text-blue-600" />
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1">
                        <span className="text-xl font-extrabold text-slate-800 leading-none">{totalCount}</span>
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wide mt-1">Transformers</span>
                    </div>
                </div>

                {/* Active */}
                <div className="relative overflow-hidden pl-3 pr-2 py-2 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] h-[72px] flex items-center justify-between">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100/50">
                        <Zap size={28} className="text-emerald-600" />
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1">
                        <span className="text-xl font-extrabold text-slate-800 leading-none">{activeCount}</span>
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide mt-1">Active</span>
                    </div>
                </div>

                {/* Inactive */}
                <div className="relative overflow-hidden pl-3 pr-2 py-2 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-100 to-gray-200 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] h-[72px] flex items-center justify-between">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-300">
                        <PowerOff size={28} className="text-slate-700" />
                    </div>
                    <div className="flex flex-col items-center justify-center flex-1">
                        <span className="text-xl font-extrabold text-slate-800 leading-none">{inactiveCount}</span>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide mt-1">Inactive</span>
                    </div>
                </div>

                {/* Alerts */}
                <div className="relative overflow-hidden pl-3 pr-2 py-2 rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-rose-50 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] group h-[72px] flex items-center justify-between">
                    <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
                    <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-red-100/50">
                        <AlertTriangle size={28} className="text-red-600" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center justify-center flex-1">
                        <span className="text-xl font-extrabold text-slate-800 leading-none">{alertCount}</span>
                        <span className="text-xs font-bold text-red-600 uppercase tracking-wide mt-1">Alerts</span>
                    </div>
                </div>
            </div>

            {/* Header & Filters */}
            <div className="flex flex-col gap-3">
                <div className="p-3 bg-[hsl(var(--surface))] rounded-lg border border-[hsl(var(--border))] flex flex-wrap gap-3 items-end shadow-sm animate-fade-in">

                    {/* Searchable Filters using Datalist */}
                    <div className="space-y-0.5 opacity-60">
                        <label className="text-[10px] font-bold tracking-tight text-blue-900 uppercase">Circle</label>
                        <div className="relative">
                            <input
                                disabled
                                list="circles"
                                placeholder="Select Circle"
                                className="w-40 h-8 px-2 rounded-md border border-[hsl(var(--border))] bg-slate-100 text-slate-400 text-xs cursor-not-allowed"
                            />
                            <datalist id="circles">
                                <option value="North Circle" />
                                <option value="South Circle" />
                            </datalist>
                        </div>
                    </div>
                    <div className="space-y-0.5 opacity-60">
                        <label className="text-[10px] font-bold tracking-tight text-blue-900 uppercase">Division</label>
                        <div className="relative">
                            <input
                                disabled
                                list="divisions"
                                placeholder="Select Division"
                                className="w-40 h-8 px-2 rounded-md border border-[hsl(var(--border))] bg-slate-100 text-slate-400 text-xs cursor-not-allowed"
                            />
                            <datalist id="divisions">
                                <option value="Div-1" />
                                <option value="Div-2" />
                            </datalist>
                        </div>
                    </div>
                    <div className="space-y-0.5 opacity-60">
                        <label className="text-[10px] font-bold tracking-tight text-blue-900 uppercase">City</label>
                        <div className="relative">
                            <input
                                disabled
                                list="cities"
                                placeholder="Select City"
                                className="w-40 h-8 px-2 rounded-md border border-[hsl(var(--border))] bg-slate-100 text-slate-400 text-xs cursor-not-allowed"
                            />
                            <datalist id="cities">
                                <option value="Bangalore" />
                                <option value="Mysore" />
                            </datalist>
                        </div>
                    </div>

                    <Button disabled variant="secondary" size="sm" className="h-8 text-xs mb-[1px] disabled:opacity-50 disabled:cursor-not-allowed">
                        <Filter size={14} className="mr-2" /> Apply
                    </Button>
                    {/* Auto Refresh & Map Link */}
                    <div className="ml-auto flex items-center gap-3">
                        {lastUpdated && (
                            <span className="text-[11px] italic text-slate-500 whitespace-nowrap">
                                Last updated on: {formatDateTime(lastUpdated)}
                            </span>
                        )}
                        <div className="flex items-center gap-3 bg-white p-1.5 rounded-lg border border-[hsl(var(--border))] shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="relative w-8 h-8 flex items-center justify-center">
                                    <svg className="transform -rotate-90 w-8 h-8">
                                        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-gray-200" />
                                        <circle
                                            cx="16" cy="16" r="14"
                                            stroke="currentColor" strokeWidth="2" fill="transparent"
                                            className={clsx("transition-all duration-1000 ease-linear", timeLeft < 10 ? "text-red-500" : "text-[hsl(var(--primary))]")}
                                            strokeDasharray={88}
                                            strokeDashoffset={88 - (88 * timeLeft) / 60}
                                        />
                                    </svg>
                                    <span className="absolute text-[10px] font-bold">{timeLeft}s</span>
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setIsPaused(!isPaused)} className="text-[10px] hover:text-[hsl(var(--primary))] font-medium flex items-center gap-1 transition-colors">
                                            {isPaused ? <Play size={10} className="fill-current" /> : <Pause size={10} className="fill-current" />} {isPaused ? 'Resume' : 'Pause'}
                                        </button>
                                        <span className="text-gray-300">|</span>
                                        <button onClick={handleManualRefresh} className="text-[10px] hover:text-[hsl(var(--primary))] font-medium flex items-center gap-1 transition-colors" title="Refresh Now">
                                            <RotateCcw size={10} /> Refresh
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="w-[1px] h-6 bg-gray-200" />
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-dashed border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 h-8 text-xs"
                                onClick={() => router.push('/dashboard/neighbors')}
                            >
                                <MapPin size={12} className="mr-1.5" /> Neighbor Map
                            </Button>
                        </div>
                    </div>
                </div>
            </div>


            {/* Main Split View */}
            <div className={clsx(
                "grid gap-4 animate-fade-in transition-all duration-300",
                maximizedPanel === 'none' ? "grid-cols-1 lg:grid-cols-12 h-[600px]" : "h-[calc(100vh-14rem)] grid-cols-1"
            )}>

                {/* Left Panel: Site Status Grid (Modified to Horizontal List) */}
                {(maximizedPanel === 'none' || maximizedPanel === 'grid') && (
                    <div className={clsx(
                        "flex flex-col bg-[hsl(var(--surface))] rounded-xl border border-[hsl(var(--border))] shadow-sm overflow-hidden transition-all duration-300",
                        maximizedPanel === 'grid' ? "col-span-1" : "lg:col-span-5"
                    )}>
                        <div className="p-3 border-b border-[hsl(var(--border))] bg-slate-50 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-sm font-bold tracking-tight text-blue-900">
                                    <MapIcon size={16} /> Site Status
                                </h3>
                                {/* Counters */}
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-2 text-[10px] font-medium mr-2">
                                        {/* Simplified counters for header */}
                                        <span className="text-green-600">{activeCount} Active</span>
                                        <span className="text-gray-500">/</span>
                                        <span className="text-gray-600">{inactiveCount} Inactive</span>
                                    </div>
                                    <button
                                        onClick={() => toggleMaximize('grid')}
                                        className="p-1 hover:bg-gray-200 rounded text-gray-500"
                                        title={maximizedPanel === 'grid' ? "Minimize" : "Maximize"}
                                    >
                                        {maximizedPanel === 'grid' ? <Filter size={14} className="rotate-45" /> : <Filter size={14} className="-rotate-45" />}
                                    </button>
                                </div>
                            </div>
                            <Input
                                placeholder="Search..."
                                leftIcon={<Search size={14} />}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white h-7 text-xs"
                            />
                        </div>

                        <div className="flex-1 p-3 overflow-hidden">
                            {isLoading ? (
                                <div className="h-full flex items-center justify-center">
                                    <TransformerLoader text="Syncing grid status..." />
                                </div>
                            ) : (
                                <div className="flex flex-col h-full justify-between">
                                    <div className="flex flex-wrap gap-2 overflow-y-auto content-start flex-1 max-h-[420px]">
                                        {filteredData.map((item) => (
                                            <Tooltip
                                                key={item.id}
                                                content={
                                                 <div className="min-w-[280px] text-[11px] p-2 space-y-2">
                                                          {/* Header */}
                                                          <div className="font-bold border-b pb-1.5 text-slate-800 flex justify-between items-center">
                                                              <span>{item.name}</span>
                                                              <span className={clsx(
                                                                  "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                                                                  (item.displayStatus === 'INACTIVE' || item.status === 'inactive') && "bg-red-100 text-red-700 border-red-200",
                                                                  item.displayStatus === 'THEFT' && "bg-rose-100 text-rose-700 border-rose-300 font-extrabold animate-pulse",
                                                                  item.displayStatus === 'ACTIVE' && "bg-emerald-100 text-emerald-700 border-emerald-200",
                                                                  !['INACTIVE', 'THEFT', 'ACTIVE'].includes(item.displayStatus || '') && (item.status === 'active' ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200")
                                                              )}>
                                                                  {item.displayStatus || (item.status === 'active' ? 'ACTIVE' : 'INACTIVE')}
                                                              </span>
                                                          </div>

                                                          {/* Location Info */}
                                                          <div className="space-y-0.5 text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                                              <div className="flex justify-between items-center gap-2">
                                                                  <span className="text-slate-400 font-medium shrink-0">Customer:</span> 
                                                                  <span className="font-semibold text-slate-800 text-right truncate" title={item.customerName || '-'}>
                                                                      {item.customerName || '-'}
                                                                  </span>
                                                              </div>
                                                              <div className="flex justify-between items-center gap-2">
                                                                  <span className="text-slate-400 font-medium shrink-0">Sub Div:</span> 
                                                                  <span className="font-semibold text-slate-800 text-right truncate">{item.subDivision || '-'}</span>
                                                              </div>
                                                              <div className="flex justify-between items-center gap-2">
                                                                  <span className="text-slate-400 font-medium shrink-0">Substation:</span> 
                                                                  <span className="font-semibold text-slate-800 text-right truncate">{item.subGrid || item.substation || '-'}</span>
                                                              </div>
                                                              <div className="flex justify-between items-center gap-2">
                                                                  <span className="text-slate-400 font-medium shrink-0">Feeder:</span> 
                                                                  <span className="font-semibold text-slate-800 text-right truncate">{item.feeder || '-'}</span>
                                                              </div>
                                                          </div>

                                                          {/* Hardware Status */}
                                                          <div className="grid grid-cols-2 gap-2 text-slate-600">
                                                              <div className="bg-blue-50/50 p-1.5 rounded-lg border border-blue-100/40">
                                                                  <span className="block text-[9px] font-bold text-blue-700 uppercase tracking-wide mb-1">Master Device</span>
                                                                  <div className="font-semibold text-slate-800 truncate text-[10px]" title={item.masterDevice}>{item.masterDevice || '-'}</div>
                                                                  <div className="text-[10px] text-slate-500 font-mono">Comm: {item.masterCommunicationId || '-'}</div>
                                                              </div>
                                                              <div className="bg-indigo-50/50 p-1.5 rounded-lg border border-indigo-100/40">
                                                                  <span className="block text-[9px] font-bold text-indigo-700 uppercase tracking-wide mb-1 flex items-center justify-between">
                                                                      Node Device 
                                                                      <span className={clsx(
                                                                          "w-1.5 h-1.5 rounded-full inline-block",
                                                                          (item.displayStatus === 'INACTIVE' || item.status === 'inactive') ? "bg-red-500" : (item.displayStatus === 'THEFT' ? "bg-rose-500 animate-pulse" : "bg-emerald-500")
                                                                      )} />
                                                                  </span>
                                                                  <div className="font-semibold text-slate-800 truncate text-[10px]" title={item.nodeDevice}>{item.nodeDevice || '-'}</div>
                                                                  <div className="text-[10px] text-slate-500 font-mono">Comm: {item.nodeCommunicationId || '-'}</div>
                                                              </div>
                                                          </div>

                                                          {/* Telemetry Data */}
                                                          <div className="grid grid-cols-3 gap-1 text-center bg-slate-50 p-1 rounded-lg border border-slate-100 font-mono text-[10px]">
                                                              <div>
                                                                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tight">Solar</span>
                                                                  <span className="font-bold text-slate-700">{formatVoltage(item.solarVoltage)}</span>
                                                              </div>
                                                              <div>
                                                                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tight">Battery</span>
                                                                  <span className="font-bold text-slate-700">{formatVoltage(item.batteryVoltage)}</span>
                                                              </div>
                                                              <div>
                                                                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tight">Device</span>
                                                                  <span className="font-bold text-slate-700">{formatVoltage(item.deviceVoltage)}</span>
                                                              </div>
                                                          </div>

                                                          {/* Footer */}
                                                          <div className="text-[9px] text-slate-400 space-y-0.5 border-t pt-1.5">
                                                              <div className="flex justify-between"><span>Coords:</span> <span className="font-mono">{item.lat.toFixed(4)}, {item.lng.toFixed(4)}</span></div>
                                                              <div className="flex justify-between"><span>Received On:</span> <span className="font-mono text-blue-600 font-bold">{item.lastPing && item.lastPing !== '-' ? formatDate(item.lastPing) : (item.lastRececivedOn && item.lastRececivedOn !== '-' ? formatDate(item.lastRececivedOn) : '-')}</span></div>
                                                          </div>
                                                     </div>
                                                }>
                                                <div
                                                    onClick={() => router.push(`/dashboard/lc-management/${item.id}`)}
                                                    className={clsx(
                                                        "flex items-center gap-2 p-1.5 rounded-lg shrink-0 cursor-pointer transition-all hover:shadow-md w-[140px] border-none shadow-sm",
                                                        (item.displayStatus === 'INACTIVE' || item.status === 'inactive')
                                                            ? "bg-red-600 hover:bg-red-700 text-white"
                                                            : item.status === 'disabled'
                                                                ? "bg-gray-500 hover:bg-gray-600 text-white"
                                                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                                    )}
                                                    style={{ minHeight: '48px', height: 'auto' }}
                                                >
                                                    <div className={clsx(
                                                        "w-1.5 h-1.5 rounded-full shrink-0",
                                                        (item.displayStatus === 'INACTIVE' || item.status === 'inactive') ? "bg-white" : "bg-white",
                                                        item.status === 'active' && "shadow-[0_0_8px_rgba(255,255,255,0.8)]",
                                                        item.displayStatus === 'THEFT' && "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.9)]"
                                                    )} />

                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[9px] uppercase font-bold opacity-80 leading-none mb-0.5">ID: {item.id.replace('TR-', '')}</p>
                                                        <h4 className="text-[10px] font-bold truncate leading-tight">
                                                            {item.name}
                                                        </h4>
                                                        <p 
                                                            className="text-[9px] truncate text-white/90 leading-tight font-medium"
                                                            title={item.customerName && item.customerName !== '-' ? item.customerName : undefined}
                                                        >
                                                            {item.customerName && item.customerName !== '-' ? item.customerName.slice(0, 10) : '-'}
                                                        </p>
                                                    </div>

                                                    <div className={clsx("shrink-0", item.displayStatus === 'THEFT' ? "opacity-100" : "opacity-80")}>
                                                        {(item.displayStatus === 'INACTIVE' || item.status === 'inactive') ? <PowerOff size={12} /> :
                                                            item.displayStatus === 'THEFT' ? <AlertTriangle size={13} className="text-red-400 animate-pulse stroke-[2.5]" /> :
                                                                item.status === 'disabled' ? <div className="w-3 h-3 rounded-full border-2 border-current opacity-50" /> :
                                                                    <Zap size={12} />}
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        ))}
                                        {filteredData.length === 0 && (
                                            <p className="w-full text-center text-xs text-muted-foreground py-4">No transformers.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Right Panel: Map View */}
                {(maximizedPanel === 'none' || maximizedPanel === 'map') && (
                    <div className={clsx(
                        "rounded-xl border border-[hsl(var(--border))] bg-slate-100 relative overflow-hidden group transition-all duration-300 h-full",
                        maximizedPanel === 'map' ? "col-span-1" : "lg:col-span-7"
                    )}>
                        <MapView
                            center={transformers.length > 0 ? [transformers[0].lat, transformers[0].lng] : [12.9716, 77.5946]}
                            zoom={11}
                            markers={transformers.map(m => ({
                                id: m.id,
                                lat: m.lat,
                                lng: m.lng,
                                title: m.name, // Use parsed transformer name
                                status: m.status,
                                description: (
                                    <div className="min-w-[280px] text-[11px] p-2 space-y-2 text-slate-700 bg-white">
                                        {/* Header */}
                                        <div className="font-bold border-b pb-1.5 text-slate-800 flex justify-between items-center">
                                            <span>{m.name}</span>
                                            <span className={clsx(
                                                "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                                                (m.displayStatus === 'INACTIVE' || m.status === 'inactive') && "bg-red-100 text-red-700 border-red-200",
                                                m.displayStatus === 'THEFT' && "bg-rose-100 text-rose-700 border-rose-300 font-extrabold animate-pulse",
                                                m.displayStatus === 'ACTIVE' && "bg-emerald-100 text-emerald-700 border-emerald-200",
                                                !['INACTIVE', 'THEFT', 'ACTIVE'].includes(m.displayStatus || '') && (m.status === 'active' ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200")
                                            )}>
                                                 {m.displayStatus || (m.status === 'active' ? 'ACTIVE' : 'INACTIVE')}
                                             </span>
                                        </div>

                                        {/* Location Info */}
                                        <div className="space-y-0.5 text-slate-600 bg-slate-50/70 p-1.5 rounded-lg border border-slate-100">
                                            <div className="flex justify-between items-center gap-2">
                                                <span className="text-slate-400 font-medium shrink-0">Customer:</span> 
                                                <span className="font-semibold text-slate-800 text-right truncate" title={m.customerName || '-'}>
                                                    {m.customerName || '-'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center gap-2">
                                                <span className="text-slate-400 font-medium shrink-0">Sub Div:</span> 
                                                <span className="font-semibold text-slate-800 text-right truncate">{m.subDivision || '-'}</span>
                                            </div>
                                            <div className="flex justify-between items-center gap-2">
                                                <span className="text-slate-400 font-medium shrink-0">Substation:</span> 
                                                <span className="font-semibold text-slate-800 text-right truncate">{m.subGrid || m.substation || '-'}</span>
                                            </div>
                                            <div className="flex justify-between items-center gap-2">
                                                <span className="text-slate-400 font-medium shrink-0">Feeder:</span> 
                                                <span className="font-semibold text-slate-800 text-right truncate">{m.feeder || '-'}</span>
                                            </div>
                                        </div>

                                        {/* Hardware Status */}
                                        <div className="grid grid-cols-2 gap-2 text-slate-600">
                                            <div className="bg-blue-50/40 p-1.5 rounded-lg border border-blue-100/30">
                                                <span className="block text-[9px] font-bold text-blue-700 uppercase tracking-wide mb-1">Master Device</span>
                                                <div className="font-semibold text-slate-800 truncate text-[10px]" title={m.masterDevice}>{m.masterDevice || '-'}</div>
                                                <div className="text-[10px] text-slate-500 font-mono">Comm: {m.masterCommunicationId || '-'}</div>
                                            </div>
                                            <div className="bg-indigo-50/40 p-1.5 rounded-lg border border-indigo-100/30">
                                                <span className="block text-[9px] font-bold text-indigo-700 uppercase tracking-wide mb-1 flex items-center justify-between">
                                                    Node Device 
                                                    <span className={clsx(
                                                        "w-1.5 h-1.5 rounded-full inline-block",
                                                        (m.displayStatus === 'INACTIVE' || m.status === 'inactive') ? "bg-red-500" : (m.displayStatus === 'THEFT' ? "bg-rose-500 animate-pulse" : "bg-emerald-500")
                                                    )} />
                                                </span>
                                                <div className="font-semibold text-slate-800 truncate text-[10px]" title={m.nodeDevice}>{m.nodeDevice || '-'}</div>
                                                <div className="text-[10px] text-slate-500 font-mono">Comm: {m.nodeCommunicationId || '-'}</div>
                                            </div>
                                        </div>

                                        {/* Telemetry Data */}
                                        <div className="grid grid-cols-3 gap-1 text-center bg-slate-50/70 p-1 rounded-lg border border-slate-100 font-mono text-[10px]">
                                            <div>
                                                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tight">Solar</span>
                                                <span className="font-bold text-slate-700">{formatVoltage(m.solarVoltage)}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tight">Battery</span>
                                                <span className="font-bold text-slate-700">{formatVoltage(m.batteryVoltage)}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tight">Device</span>
                                                <span className="font-bold text-slate-700">{formatVoltage(m.deviceVoltage)}</span>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="text-[9px] text-slate-400 space-y-0.5 border-t pt-1.5">
                                            <div className="flex justify-between"><span>Coords:</span> <span className="font-mono">{m.lat.toFixed(4)}, {m.lng.toFixed(4)}</span></div>
                                            <div className="flex justify-between"><span>Received On:</span> <span className="font-mono text-blue-600 font-bold">{m.lastPing && m.lastPing !== '-' ? formatDate(m.lastPing) : (m.lastRececivedOn && m.lastRececivedOn !== '-' ? formatDate(m.lastRececivedOn) : '-')}</span></div>
                                        </div>
                                    </div>
                                )
                            }))}
                            onMarkerClick={(id) => router.push(`/dashboard/lc-management/${id}`)}
                            className="h-full w-full"
                        />

                        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[400] items-end pointer-events-none">
                            <button
                                onClick={() => toggleMaximize('map')}
                                className="bg-white p-2 text-gray-600 shadow-sm rounded-md hover:bg-gray-50 pointer-events-auto"
                                title={maximizedPanel === 'map' ? "Minimize" : "Maximize"}
                            >
                                {maximizedPanel === 'map' ? <Filter size={16} className="rotate-45" /> : <Filter size={16} className="-rotate-45" />}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Panel: Alert Status / Periodic Data Tabs */}
            <div className="bg-[hsl(var(--surface))] rounded-xl border border-[hsl(var(--border))] p-4 shadow-sm animate-fade-in flex flex-col gap-3">

                {/* Tabs & Stats Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-6 border-b border-slate-100 pb-3">
                    {/* Toggle Switch */}
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        {['alerts', 'periodic'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={clsx(
                                    "relative px-4 py-1.5 rounded-md text-xs font-bold transition-all z-10",
                                    activeTab === tab ? "text-white" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="activeTabPill"
                                        className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 shadow-md rounded-md"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-20">
                                    {tab === 'alerts' ? 'Alert Status' : 'Periodic Data'}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Alert Statistics Header (Total alerts, open, closed) */}
                    {activeTab === 'alerts' && (
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs shadow-sm animate-in fade-in duration-300">
                            <span className="font-bold text-slate-700">Alerts Summary:</span>
                            <span className="text-slate-600 font-medium flex items-center gap-1">
                                Total: <span className="font-extrabold text-slate-900 bg-slate-200/60 px-1.5 py-0.5 rounded text-[10px]">{alertStats.total}</span>
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="text-red-600 font-medium flex items-center gap-1">
                                Open: <span className="font-extrabold text-white bg-red-500 px-1.5 py-0.5 rounded text-[10px] animate-pulse">{alertStats.open}</span>
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="text-emerald-600 font-medium flex items-center gap-1">
                                Closed: <span className="font-extrabold text-white bg-emerald-500 px-1.5 py-0.5 rounded text-[10px]">{alertStats.closed}</span>
                            </span>
                        </div>
                    )}
                </div>

                {/* Filter Controls Row - Neatly Arranged from Right */}
                <div className="flex flex-wrap items-center justify-end gap-4 py-1.5 border-b border-slate-100/80">
                    {activeTab === 'alerts' ? (
                        <>
                            {/* Open / Closed Toggle Switch */}
                            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 h-9 items-center">
                                <button
                                    onClick={() => {
                                        setAlertTab('open');
                                        setAlertStatusFilter('open');
                                    }}
                                    className={clsx(
                                        "px-3 py-1 text-xs font-bold rounded-md transition-all h-7 flex items-center justify-center",
                                        alertTab === 'open' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    Open
                                </button>
                                <button
                                    onClick={() => {
                                        setAlertTab('closed');
                                        setAlertStatusFilter('closed');
                                    }}
                                    className={clsx(
                                        "px-3 py-1 text-xs font-bold rounded-md transition-all h-7 flex items-center justify-center",
                                        alertTab === 'closed' ? "bg-white text-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    Closed
                                </button>
                            </div>

                            {/* Dropdown View Filter */}
                            <div className="flex items-center gap-2 bg-white px-3 h-9 rounded-lg border border-slate-200 shadow-sm">
                                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">View:</span>
                                <select
                                    value={alertStatusFilter}
                                    onChange={(e) => {
                                        const val = e.target.value as any;
                                        setAlertStatusFilter(val);
                                        if (val === 'open') {
                                            setAlertTab('open');
                                        } else if (val === 'closed') {
                                            setAlertTab('closed');
                                        }
                                    }}
                                    className="border-none bg-transparent text-xs font-bold text-slate-700 focus:outline-none focus:ring-0 cursor-pointer pr-5 py-0 h-full -ml-1"
                                    style={{ backgroundImage: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
                                >
                                    <option value="all">All Alerts</option>
                                    <option value="open">Open Alerts</option>
                                    <option value="closed">Closed Alerts</option>
                                </select>
                                <ChevronDown size={12} className="text-slate-400 -ml-4 pointer-events-none" />
                            </div>

                            {/* Date Filter: From */}
                            <div className="flex items-center gap-2 h-9">
                                <span className="text-xs font-semibold text-slate-500">From:</span>
                                <input
                                    type="date"
                                    className="h-8 w-36 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                    value={alertFilters.fromDate}
                                    onChange={(e) => setAlertFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                                />
                            </div>

                            {/* Date Filter: To */}
                            <div className="flex items-center gap-2 h-9">
                                <span className="text-xs font-semibold text-slate-500">To:</span>
                                <input
                                    type="date"
                                    className="h-8 w-36 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                    value={alertFilters.toDate}
                                    onChange={(e) => setAlertFilters(prev => ({ ...prev, toDate: e.target.value }))}
                                />
                            </div>

                            {/* Show Button */}
                            <Button
                                size="sm"
                                className="h-8 text-xs bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold px-4 shadow-sm rounded-lg"
                                onClick={fetchAlerts}
                            >
                                Show
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* Dropdown View Filter for Periodic */}
                            <div className="flex items-center gap-2 bg-white px-3 h-9 rounded-lg border border-slate-200 shadow-sm">
                                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">View:</span>
                                <select
                                    value={periodicAlertFilter}
                                    onChange={(e) => setPeriodicAlertFilter(e.target.value as any)}
                                    className="border-none bg-transparent text-xs font-bold text-slate-700 focus:outline-none focus:ring-0 cursor-pointer pr-5 py-0 h-full -ml-1"
                                    style={{ backgroundImage: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
                                >
                                    <option value="all">All Data</option>
                                    <option value="open">With Alerts</option>
                                    <option value="closed">No Alerts</option>
                                </select>
                                <ChevronDown size={12} className="text-slate-400 -ml-4 pointer-events-none" />
                            </div>

                            {/* Date Filter: From */}
                            <div className="flex items-center gap-2 h-9">
                                <span className="text-xs font-semibold text-slate-500">From:</span>
                                <input
                                    type="date"
                                    className="h-8 w-36 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                    value={periodicFilters.fromDate}
                                    onChange={(e) => setPeriodicFilters(prev => ({ ...prev, fromDate: e.target.value }))}
                                />
                            </div>

                            {/* Date Filter: To */}
                            <div className="flex items-center gap-2 h-9">
                                <span className="text-xs font-semibold text-slate-500">To:</span>
                                <input
                                    type="date"
                                    className="h-8 w-36 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                                    value={periodicFilters.toDate}
                                    onChange={(e) => setPeriodicFilters(prev => ({ ...prev, toDate: e.target.value }))}
                                />
                            </div>

                            {/* Show Button */}
                            <Button
                                size="sm"
                                className="h-8 text-xs bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold px-4 shadow-sm rounded-lg"
                                onClick={fetchTransactions}
                            >
                                Show
                            </Button>

                            {/* Search Site Name Input */}
                            <div className="w-48">
                                <Input
                                    placeholder="Search Site Name..."
                                    className="h-8 px-2 text-xs py-1 rounded-md"
                                    value={periodicFilters.siteSearch}
                                    onChange={(e) => setPeriodicFilters(prev => ({ ...prev, siteSearch: e.target.value }))}
                                    leftIcon={<Search size={12} />}
                                />
                            </div>
                        </>
                    )}
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

                {/* Data Table */}
                <div className="min-h-[200px]">
                    {activeTab === 'alerts' ? (
                        <DataTable
                            columns={bottomTableColumns}
                            minWidth="1200px"
                            data={displayedAlerts.map(d => {
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
                                    status: d.alerStatus || d.status || (alertTab === 'open' ? 'Open' : 'Closed'),
                                    updatedBy: d.updatedBy || '-',
                                    closedOn: d.closedOn || '-',
                                    subDivision: d.subDivision || match?.subDivision || '-',
                                    subGrid: d.subGrid || d.substation || match?.substation || '-',
                                    substation: d.substation || match?.substation || '-',
                                    feeder: d.feeder || match?.feeder || '-',
                                    latitude: d.latitude !== undefined ? d.latitude : (match?.lat || '-'),
                                    longitude: d.longitude !== undefined ? d.longitude : (match?.lng || '-')
                                };
                            })}
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
                    ) : (
                        <DataTable
                            columns={bottomTableColumns}
                            minWidth="1200px"
                            data={periodicData.map(d => {
                                const code = d.transformerCode || d.transformer || d.name || '';
                                const match = transformers.find(t => {
                                    const tCode = t.transformerCode || t.name || '';
                                    return tCode && code && (code.includes(tCode) || tCode.includes(code));
                                });
                                
                                const cleanCode = (code || '').trim();
                                const transformerAlerts = allAlerts.filter(a => {
                                    const aCode = a.transformerCode || a.transformerId || a.id || '';
                                    const cleanACode = String(aCode).replace('TR-', '').trim();
                                    const cleanCCode = String(cleanCode).replace('TR-', '').trim();
                                    return cleanACode && cleanCCode && (cleanACode === cleanCCode || cleanACode.includes(cleanCCode) || cleanCCode.includes(cleanACode));
                                });
                                const hasOpenAlert = transformerAlerts.some(a => {
                                    const aStatus = (a.alerStatus || a.status || '').toLowerCase();
                                    return aStatus === 'open' || aStatus === 'active';
                                });

                                const isOffline = d.masterStatus?.toLowerCase() === 'offline' || d.status?.toLowerCase() === 'offline' || d.nodeStatus?.toLowerCase() === 'offline';
                                const hasTheft = match?.status === 'alert' || d.alert === 'THEFT';
                                
                                return {
                                    ...d,
                                    id: code,
                                    transformerCode: code || '-',
                                    name: d.transformerName || d.name || match?.name || 'Unknown',
                                    alert: hasOpenAlert ? (hasTheft ? 'THEFT' : (isOffline ? 'OFFLINE' : '-')) : '-',
                                    ownerName: d.ownerName || match?.ownerName || '-',
                                    ownerEmail: d.ownerEmail || match?.ownerEmail || '-',
                                    ownerPhoneNo: d.ownerPhoneNo || match?.ownerPhoneNo || '-',
                                    neighborName: d.neighborName || match?.neighborName || '-',
                                    neighborEmail: d.neighborEmail || match?.neighborEmail || '-',
                                    neighborPhoneNo: d.neighborPhoneNo || match?.neighborPhoneNo || '-',
                                    severity: hasOpenAlert ? 'CRITICAL' : '-',
                                    receivedOn: d.lastRececivedOn || d.lastPing || '-',
                                    notifiedOn: '-',
                                    status: hasOpenAlert ? 'Open' : 'Closed',
                                    updatedBy: '-',
                                    closedOn: '-',
                                    subDivision: d.subDivision || match?.subDivision || '-',
                                    subGrid: d.subGrid || d.substation || match?.substation || '-',
                                    substation: d.subGrid || d.substation || match?.substation || '-',
                                    feeder: d.feeder || match?.feeder || '-',
                                    latitude: d.latitude !== undefined ? d.latitude : (match?.lat || '-'),
                                    longitude: d.longitude !== undefined ? d.longitude : (match?.lng || '-')
                                };
                            }).filter(t => {
                                const matchesSearch = !periodicFilters.siteSearch || 
                                    t.transformerCode?.toLowerCase().includes(periodicFilters.siteSearch.toLowerCase()) || 
                                    t.substation?.toLowerCase().includes(periodicFilters.siteSearch.toLowerCase());
                                if (!matchesSearch) return false;

                                const isCriticalOrOffline = t.severity === 'CRITICAL' || t.status?.toLowerCase() === 'offline' || t.status?.toLowerCase() === 'inactive' || t.status?.toLowerCase() === 'open';
                                if (periodicAlertFilter === 'all') return true;
                                if (periodicAlertFilter === 'open') return isCriticalOrOffline;
                                if (periodicAlertFilter === 'closed') return !isCriticalOrOffline;
                                return true;
                            }).sort((a, b) => parseTimestamp(b.receivedOn) - parseTimestamp(a.receivedOn))}
                            searchKey="transformerCode"
                            isLoading={isLoading}
                            getRowClassName={(row) => {
                                const sev = row.original.severity as string;
                                const status = row.original.status as string;
                                if (sev === 'CRITICAL' || status === 'Offline' || status === 'inactive' || status?.toLowerCase() === 'open') {
                                    return 'critical-row';
                                }
                                return '';
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
