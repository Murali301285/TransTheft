'use client';

import { useState, useMemo } from 'react';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { TransformerDetails } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Map, AlertTriangle, CheckCircle, XCircle, Search, Filter, MapPin, Play, Pause, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';
import { clsx } from 'clsx';
import { formatDate } from '@/lib/date-utils';
import { useRouter } from 'next/navigation';

// Mock Data
const MOCK_DATA: TransformerDetails[] & { id: string; name: string; circle: string; division: string }[] = Array.from({ length: 50 }).map((_, i) => ({
    id: `TR-${1000 + i}`,
    name: `Transformer ${1000 + i}`,
    circle: i % 2 === 0 ? 'North Circle' : 'South Circle',
    division: `Div-${i % 5}`,
    lat: 12.9716 + (Math.random() * 0.1),
    lng: 77.5946 + (Math.random() * 0.1),
    capacity: '100 KVA',
    status: i % 10 === 0 ? 'alert' : i % 5 === 0 ? 'inactive' : 'active',
    lastPing: new Date().toISOString(),
    address: `Street ${i}, Benson Town`,
    nearestCustomers: []
}));



export default function LCManagementPage() {
    const router = useRouter();

    const columns = useMemo<ColumnDef<typeof MOCK_DATA[0]>[]>(() => [
        { accessorKey: 'id', header: 'Transformer ID' },
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'circle', header: 'Circle' },
        { accessorKey: 'division', header: 'Division' },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                return (
                    <span className={clsx(
                        "px-2 py-1 rounded-full text-xs font-medium uppercase border",
                        status === 'active' && "bg-green-100 text-green-700 border-green-200",
                        status === 'inactive' && "bg-gray-100 text-gray-700 border-gray-200",
                        status === 'alert' && "bg-red-100 text-red-700 border-red-200 animate-pulse",
                    )}>
                        {status}
                    </span>
                );
            }
        },
        {
            accessorKey: 'lastPing',
            header: 'Last Ping',
            cell: ({ row }) => formatDate(row.original.lastPing)
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
    const [searchQuery, setSearchQuery] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) return 60;
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isPaused]);

    const filteredData = MOCK_DATA.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCount = MOCK_DATA.filter(i => i.status === 'active').length;
    const inactiveCount = MOCK_DATA.filter(i => i.status === 'inactive').length;
    const totalCount = MOCK_DATA.length;
    const alertCount = MOCK_DATA.filter(i => i.status === 'alert').length;

    const [maximizedPanel, setMaximizedPanel] = useState<'none' | 'grid' | 'map'>('none');

    const toggleMaximize = (panel: 'grid' | 'map') => {
        if (maximizedPanel === panel) {
            setMaximizedPanel('none');
        } else {
            setMaximizedPanel(panel);
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Top KPI Cards - Added as per requirement */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in">
                <div className="p-4 rounded-xl bg-white border border-[hsl(var(--border))] shadow-sm flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-1">Transformers</p>
                    <p className="text-2xl font-bold text-[hsl(var(--foreground))]">{totalCount}</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[hsl(var(--border))] shadow-sm flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Active</p>
                    <p className="text-2xl font-bold text-green-700">{activeCount}</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[hsl(var(--border))] shadow-sm flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Inactive</p>
                    <p className="text-2xl font-bold text-gray-600">{inactiveCount}</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[hsl(var(--border))] shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Alerts</p>
                    <p className="text-2xl font-bold text-red-700">{alertCount}</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-[hsl(var(--border))] shadow-sm flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Uptime</p>
                    <p className="text-2xl font-bold text-blue-700">99.98%</p>
                </div>
            </div>

            {/* Header & Filters */}
            <div className="flex flex-col gap-4">
                {/* Top Filters Bar */}
                <div className="p-4 bg-[hsl(var(--surface))] rounded-lg border border-[hsl(var(--border))] flex flex-wrap gap-4 items-end shadow-sm animate-fade-in">

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase">Circle</label>
                        <select className="w-48 h-10 px-3 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]">
                            <option>-- Select Circle --</option>
                            <option>North Circle</option>
                            <option>South Circle</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase">Division</label>
                        <select className="w-48 h-10 px-3 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]">
                            <option>-- Select Division --</option>
                            <option>Div-1</option>
                            <option>Div-2</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase">City</label>
                        <select className="w-48 h-10 px-3 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)]">
                            <option>-- Select City --</option>
                            <option>Bangalore</option>
                            <option>Mysore</option>
                        </select>
                    </div>
                    <Button variant="secondary" className="mb-[1px]">
                        <Filter size={16} className="mr-2" /> Apply Filters
                    </Button>

                    <div className="ml-auto flex items-center gap-4 bg-white p-2 rounded-lg border border-[hsl(var(--border))] shadow-sm">
                        {/* Auto-Refresh Timer */}
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 flex items-center justify-center">
                                {/* Background Circle */}
                                <svg className="transform -rotate-90 w-10 h-10">
                                    <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-gray-200" />
                                    <circle
                                        cx="20" cy="20" r="18"
                                        stroke="currentColor" strokeWidth="3" fill="transparent"
                                        className={clsx("transition-all duration-1000 ease-linear", timeLeft < 10 ? "text-red-500" : "text-[hsl(var(--primary))]")}
                                        strokeDasharray={113}
                                        strokeDashoffset={113 - (113 * timeLeft) / 60}
                                    />
                                </svg>
                                <span className="absolute text-xs font-bold">{timeLeft}s</span>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Auto Refresh</span>
                                <div className="flex gap-1">
                                    <button onClick={() => setIsPaused(!isPaused)} className="text-xs hover:text-[hsl(var(--primary))] font-medium flex items-center gap-1 transition-colors">
                                        {isPaused ? <Play size={12} className="fill-current" /> : <Pause size={12} className="fill-current" />} {isPaused ? 'Resume' : 'Pause'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="w-[1px] h-8 bg-gray-200" />

                        <Button
                            variant="outline"
                            size="sm"
                            className="border-dashed border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 h-9"
                            onClick={() => router.push('/dashboard/neighbors')}
                        >
                            <MapPin size={14} className="mr-2" /> Neighbor Map
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Split View */}
            <div className={clsx(
                "grid gap-6 animate-fade-in transition-all duration-300",
                maximizedPanel === 'none' ? "grid-cols-1 lg:grid-cols-12 h-[600px]" : "h-[calc(100vh-14rem)] grid-cols-1"
            )}>

                {/* Left Panel: Site Status Grid */}
                {(maximizedPanel === 'none' || maximizedPanel === 'grid') && (
                    <div className={clsx(
                        "flex flex-col bg-[hsl(var(--surface))] rounded-xl border border-[hsl(var(--border))] shadow-sm overflow-hidden transition-all duration-300",
                        maximizedPanel === 'grid' ? "col-span-1" : "lg:col-span-5"
                    )}>
                        <div className="p-4 border-b border-[hsl(var(--border))] bg-slate-50 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Map size={18} /> Site Status
                                </h3>
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-2 text-xs font-medium mr-2">
                                        <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                            <CheckCircle size={12} /> {activeCount}
                                        </span>
                                        <span className="flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                                            <XCircle size={12} /> {inactiveCount}
                                        </span>
                                        <span className="flex items-center gap-1 text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                            Total: {totalCount}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => toggleMaximize('grid')}
                                        className="p-1 hover:bg-gray-200 rounded text-gray-500"
                                        title={maximizedPanel === 'grid' ? "Minimize" : "Maximize"}
                                    >
                                        {maximizedPanel === 'grid' ? <Filter size={16} className="rotate-45" /> : <Filter size={16} className="-rotate-45" />} {/* Using icon as placeholder for resize */}
                                    </button>
                                </div>
                            </div>
                            <Input
                                placeholder="Search Site ID / Name..."
                                leftIcon={<Search size={16} />}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 content-start">
                            {/* Updated Grid Styling: Larger, clean squares */}
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                                {filteredData.map((item) => (
                                    <div
                                        key={item.id}
                                        title={`${item.id} - ${item.status}`}
                                        onClick={() => router.push(`/dashboard/lc-management/${item.id}`)}
                                        className={clsx(
                                            "aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold text-white shadow-sm cursor-pointer hover:scale-105 transition-transform border-b-4 border-black/10",
                                            item.status === 'active' && "bg-[#22c55e]",
                                            item.status === 'inactive' && "bg-[#94a3b8]",
                                            item.status === 'alert' && "bg-[#ef4444] animate-pulse"
                                        )}
                                    >
                                        <span className="text-white/80 text-[10px] uppercase font-normal mb-0.5">ID</span>
                                        {item.id.replace('TR-', '')}
                                    </div>
                                ))}
                                {filteredData.length === 0 && (
                                    <p className="col-span-full text-center text-sm text-[hsl(var(--muted-foreground))] py-8">
                                        No transformers match your search.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Right Panel: Map View */}
                {(maximizedPanel === 'none' || maximizedPanel === 'map') && (
                    <div className={clsx(
                        "rounded-xl border border-[hsl(var(--border))] bg-slate-100 relative overflow-hidden group transition-all duration-300",
                        maximizedPanel === 'map' ? "col-span-1" : "lg:col-span-7"
                    )}>
                        {/* Placeholder Map Visual */}
                        <div className="absolute inset-0 opacity-30 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center" />

                        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 items-end">
                            <div className="flex gap-2">
                                <button className="bg-white px-3 py-1 text-sm font-medium shadow-sm rounded-md hover:bg-gray-50">Map</button>
                                <button className="bg-white px-3 py-1 text-sm font-medium shadow-sm rounded-md hover:bg-gray-50">Satellite</button>
                            </div>
                            <button
                                onClick={() => toggleMaximize('map')}
                                className="bg-white p-2 text-gray-600 shadow-sm rounded-md hover:bg-gray-50 mt-2"
                                title={maximizedPanel === 'map' ? "Minimize" : "Maximize"}
                            >
                                {maximizedPanel === 'map' ? <Filter size={16} className="rotate-45" /> : <Filter size={16} className="-rotate-45" />}
                            </button>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-center space-y-4 bg-white/80 backdrop-blur p-6 rounded-2xl shadow-xl pointer-events-auto">
                                <Map size={48} className="mx-auto text-[hsl(var(--primary))]" />
                                <div>
                                    <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Interactive Map View</h3>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-xs mx-auto mt-2">
                                        Google Maps integration pending API Key configuration.
                                    </p>
                                </div>
                                <Button size="sm" onClick={() => alert('Please configure NEXT_PUBLIC_GOOGLE_MAPS_KEY')}>
                                    Configure API
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Panel: Alert Table */}
            <div className="bg-[hsl(var(--surface))] rounded-xl border border-[hsl(var(--border))] p-4 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2 mb-4 text-[hsl(var(--danger))]">
                    <AlertTriangle size={20} />
                    <h3 className="font-bold text-lg">Alert Status</h3>
                </div>
                <DataTable
                    columns={columns.filter(c => c.id !== 'actions')} // Simplified columns for alert table
                    data={MOCK_DATA.filter(d => d.status === 'alert')}
                    searchKey="name"
                />
            </div>
        </div>
    );
}
