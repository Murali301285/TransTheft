'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { MapPin, Navigation, Download, Search, LocateFixed, CircleDot, Eye, Maximize2, Minimize2, X, ArrowLeft, List, Grid, ChevronDown, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import * as XLSX from 'xlsx';

// Types
interface Site {
    id: string;
    name: string;
    lat: number;
    lng: number;
    address: string;
    status: 'active' | 'inactive' | 'alert';
    distance?: number; // Calculated
}

// Mock Data (Bangalore Area)
const MOCK_SITES: Site[] = Array.from({ length: 50 }).map((_, i) => ({
    id: `TR-${1000 + i}`,
    name: `Transformer ${1000 + i}`,
    lat: 12.9716 + (Math.random() - 0.5) * 0.2, // ~ +/- 10km spread
    lng: 77.5946 + (Math.random() - 0.5) * 0.2,
    address: `Street ${i}, Bangalore`,
    status: i % 10 === 0 ? 'alert' : 'active'
}));

// Utility: Haversine Formula for Distance (KM)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export default function NeighboringSitesPage() {
    const router = useRouter();
    const [selectedSiteId, setSelectedSiteId] = useState<string>('');
    const [radiusFilter, setRadiusFilter] = useState<'5' | '5-10' | '10+'>('5');
    const [showList, setShowList] = useState(false); // Controls the List Popup
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Derived State
    const selectedSite = MOCK_SITES.find(s => s.id === selectedSiteId);

    // Filter sites for dropdown
    const filteredSites = useMemo(() => {
        return MOCK_SITES.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    // Update search term when site is selected externally or cleanly
    useMemo(() => {
        if (selectedSite) {
            setSearchTerm(selectedSite.name);
        }
    }, [selectedSite]);

    const neighbors = useMemo(() => {
        if (!selectedSite) return [];

        return MOCK_SITES
            .filter(s => s.id !== selectedSite.id) // Exclude self
            .map(s => ({
                ...s,
                distance: getDistance(selectedSite.lat, selectedSite.lng, s.lat, s.lng)
            }))
            .filter(s => {
                if (radiusFilter === '5') return s.distance <= 5;
                if (radiusFilter === '5-10') return s.distance > 5 && s.distance <= 10;
                if (radiusFilter === '10+') return s.distance > 10;
                return true;
            })
            .sort((a, b) => a.distance - b.distance);
    }, [selectedSite, radiusFilter]);

    const handleDownload = () => {
        if (!neighbors.length) return;

        const dataToExport = neighbors.map(n => ({
            ID: n.id,
            Name: n.name,
            Distance_KM: n.distance?.toFixed(2),
            Status: n.status,
            Coordinates: `${n.lat}, ${n.lng}`
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(wb, ws, "Neighbors");
        XLSX.writeFile(wb, `neighbors_of_${selectedSiteId}_${radiusFilter}km.xlsx`);
    };

    const columns = useMemo<ColumnDef<Site>[]>(() => [
        { accessorKey: 'id', header: 'ID' },
        { accessorKey: 'name', header: 'Site Name' },
        { accessorKey: 'address', header: 'Address' },
        {
            accessorKey: 'distance',
            header: 'Distance (KM)',
            cell: ({ row }) => row.original.distance ? row.original.distance.toFixed(2) + ' km' : '-'
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <span className={clsx(
                    "w-2 h-2 rounded-full inline-block mr-2",
                    row.original.status === 'active' ? "bg-green-500" : "bg-red-500"
                )}>
                    {row.original.status}
                </span>
            )
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                    onClick={() => {
                        // User clicked "View Map" from within the list, close the list to show map
                        setShowList(false);
                    }}
                >
                    <Eye size={12} className="mr-1" /> View Map
                </Button>
            )
        }
    ], []);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] relative">
            {/* Header / Filter Bar - Overlay on top of map (or static top) */}
            {/* Keeping it static at top for usability, but transparent background? No, keep robust. */}
            <div className="flex-none p-4 bg-[hsl(var(--surface))] border-b border-[hsl(var(--border))] shadow-sm z-20">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/lc-management')} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                            <ArrowLeft size={16} className="mr-1" /> Back
                        </Button>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Navigation className="text-[hsl(var(--primary))]" /> Neighboring Sites
                        </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search Site Dropdown */}
                        <div className="relative min-w-[280px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                <input
                                    type="text"
                                    className="w-full h-9 pl-9 pr-8 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] text-sm focus:ring-2 focus:ring-[hsl(var(--primary)/0.2)] focus:border-[hsl(var(--primary))]"
                                    placeholder="Select Site..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => {
                                        setSearchTerm(''); // Clear on focus to show all? Or keep value? User expects clear to search new usually, or select all.
                                        setIsDropdownOpen(true);
                                    }}
                                    onBlur={() => {
                                        // Delay close to allow click event on item
                                        setTimeout(() => setIsDropdownOpen(false), 200);
                                    }}
                                />
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                            </div>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute top-full mt-1 left-0 w-full max-h-[300px] overflow-auto bg-white border border-[hsl(var(--border))] rounded-md shadow-lg z-50 animate-fade-in-up">
                                    {filteredSites.length > 0 ? (
                                        filteredSites.map(s => (
                                            <div
                                                key={s.id}
                                                className="px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer flex items-center justify-between group"
                                                onClick={() => {
                                                    setSelectedSiteId(s.id);
                                                    setSearchTerm(s.name);
                                                    setIsDropdownOpen(false);
                                                }}
                                                onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-[hsl(var(--foreground))]">{s.name}</span>
                                                    <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{s.id}</span>
                                                </div>
                                                {selectedSiteId === s.id && <Check size={14} className="text-green-600" />}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-3 text-xs text-center text-gray-500">No sites found.</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Radius Filter */}
                        <div className="flex bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md overflow-hidden">
                            {(['5', '5-10', '10+'] as const).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRadiusFilter(r)}
                                    className={clsx(
                                        "px-3 py-1.5 text-xs font-medium transition-all",
                                        radiusFilter === r
                                            ? "bg-[hsl(var(--primary))] text-white"
                                            : "hover:bg-gray-100"
                                    )}
                                >
                                    {r === '5' ? '< 5km' : r === '5-10' ? '5-10km' : '> 10km'}
                                </button>
                            ))}
                        </div>

                        {/* Toggle List Button (Main Control) */}
                        <Button
                            variant={showList ? "secondary" : "primary"}
                            onClick={() => setShowList(!showList)}
                        >
                            {showList ? <MapPin size={16} className="mr-2" /> : <List size={16} className="mr-2" />}
                            {showList ? 'Hide List' : 'Show List'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content Area: Map is Full Screen (relative to header) */}
            <div className="flex-1 relative bg-slate-100 overflow-hidden">
                {/* Map Layer */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-[url('/map-pattern.png')] opacity-10 pointer-events-none"></div>

                    {/* Simulated Map Content */}
                    {selectedSite ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-[30vw] h-[30vw] min-w-[300px] min-h-[300px] border-2 border-dashed border-blue-300 rounded-full flex items-center justify-center bg-blue-50/30 animate-pulse-slow">
                                <div className="absolute w-4 h-4 bg-red-500 rounded-full shadow-lg z-10 animate-bounce"></div>
                                <div className="absolute w-full h-full border border-blue-400 rounded-full opacity-30"></div>

                                <span className="absolute -bottom-8 text-sm font-semibold text-blue-800 bg-white/80 px-2 py-1 rounded">
                                    Visualizing {radiusFilter} Radius around {selectedSite.name}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[hsl(var(--muted-foreground))]">
                            <div className="text-center">
                                <LocateFixed size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Select a center site to begin analysis</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Floating List Popup */}
                {showList && (
                    <div className="absolute inset-x-4 bottom-4 top-20 z-30 lg:top-4 lg:right-4 lg:left-auto lg:bottom-4 lg:w-[600px] flex flex-col animate-fade-in-up">
                        <div className="bg-white rounded-xl shadow-2xl border border-[hsl(var(--border))] flex flex-col h-full overflow-hidden">
                            <div className="p-4 border-b border-[hsl(var(--border))] flex justify-between items-center bg-gray-50">
                                <h3 className="font-bold flex items-center gap-2">
                                    <List size={18} className="text-blue-600" /> Neighbor List
                                    <span className="text-xs font-normal text-gray-500 ml-2">({neighbors.length} found)</span>
                                </h3>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={handleDownload} title="Export">
                                        <Download size={14} />
                                    </Button>
                                    <button
                                        onClick={() => setShowList(false)}
                                        className="p-1 hover:bg-gray-200 rounded-full text-gray-500"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-auto p-0">
                                <DataTable columns={columns} data={neighbors} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
