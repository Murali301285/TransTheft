'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { BulkUpload } from '@/components/Admin/BulkUpload';
import { formatDate } from '@/lib/date-utils';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { ApiService } from '@/services/api';
import {
    MapPin, Plus, Pencil, Trash2, ArrowLeft, Layers,
    CircleDot, GitCommit, Map, Zap, Network
} from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { useLanguage } from '@/context/LanguageContext';

type LocationType = 'company' | 'region' | 'circle' | 'division' | 'subDivision' | 'substation' | 'feeder' | 'transformer';

const TABS: { id: LocationType; label: string; icon: any }[] = [
    { id: 'company', label: 'Companies', icon: MapPin },
    { id: 'region', label: 'Regions', icon: Map },
    { id: 'circle', label: 'Circles', icon: CircleDot },
    { id: 'division', label: 'Divisions', icon: Layers },
    { id: 'subDivision', label: 'Sub-Divisions', icon: GitCommit },
    { id: 'substation', label: 'Substations', icon: Zap },
    { id: 'feeder', label: 'Feeders', icon: Network },
    { id: 'transformer', label: 'Transformers', icon: Zap },
];

export default function MasterConfigPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<LocationType>('region');
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});

    // Dropdown Data
    const [comboData, setComboData] = useState<{
        regions: any[],
        circles: any[],
        divisions: any[],
        subDivisions: any[],
        companies: any[],
        feeders: any[],
        substations: any[]
    }>({
        regions: [], circles: [], divisions: [], subDivisions: [], companies: [], feeders: [], substations: []
    });

    // Fetch Main Table Data
    const fetchData = async () => {
        setIsLoading(true);

        try {
            let apiGroup;
            if (activeTab === 'company') {
                apiGroup = ApiService.company;
            } else if (activeTab === 'transformer') {
                apiGroup = ApiService.transformers;
            } else if (activeTab === 'feeder') {
                // Special handling: Feeder data comes from Substation API
                const subResponse = await ApiService.locations.substation.getAll();
                const subList = extractList(subResponse);

                console.group('--- FEEDER DATA (Extracted from Substations) ---');
                console.log('Substation Response:', JSON.stringify(subResponse, null, 2));
                console.log('Extracted Substation List Length:', subList.length);

                if (subList.length > 0) {
                    console.log('First Substation Keys:', Object.keys(subList[0]));
                    console.log('First Substation Feeders:', subList[0].feeders); // Check if undefined
                }

                // Extract and flatten feeders
                const feeders = subList.flatMap((ss: any) => {
                    const localFeeders = Array.isArray(ss.feeders) ? ss.feeders : [];
                    if (localFeeders.length === 0) console.log(`No feeders in Substation ${ss.ssName || ss.ssId}`);
                    return localFeeders.map((f: any) => ({
                        ...f,
                        // Normalize keys for table/form compatibility
                        feederId: f.fId || f.feederId,
                        feederCode: f.fCode || f.feederCode,
                        feederName: f.fName || f.feederName,
                        latitude: f.fLatitude || f.latitude,
                        longitude: f.fLongitude || f.longitude,
                        // Attach parent Substation details
                        subStationId: ss.ssId || ss.subStationId,
                        subStationName: ss.ssName || ss.subStationName,
                        ssCode: ss.ssCode
                    }));
                });

                console.log('Processed Feeder List:', feeders);
                if (feeders.length > 0) console.log('Sample Feeder:', feeders[0]);
                else console.warn('No feeders found in substation data');
                console.groupEnd();

                setData(feeders);
                return; // Done for feeder
            } else {
                // @ts-ignore
                apiGroup = ApiService.locations[activeTab];
            }

            if (!apiGroup) {
                console.warn(`No API group for ${activeTab}`);
                setData([]);
                return;
            }
            const res = await apiGroup.getAll();
            console.log(`Fetch ${activeTab} response:`, res); // Debug

            console.group(`--- ${activeTab.toUpperCase()} DATA ---`);
            console.log('Raw API Response:', JSON.stringify(res, null, 2));
            const list = extractList(res);
            if (list.length > 0) {
                // Stringify the keys and sample record for visibility
                console.log('First Record Keys:', JSON.stringify(Object.keys(list[0]), null, 2));
                console.log('First Record Sample:', JSON.stringify(list[0], null, 2));
            } else {
                console.warn(`${activeTab} list appears empty.`);
            }
            console.groupEnd();

            // If the response is the array directly (some APIs might do this)
            if (Array.isArray(res)) {
                setData(res);
            }
            // If standard ApiResponse wrapper
            else if (res.success || res.data || (res as any).result) {
                const list = extractList(res);
                setData(list);
            } else {
                toast.error(res.message || 'Failed to fetch data');
            }
        } catch (e) {
            console.error('Fetch Error', e);
            toast.error('Network Error');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to extract array from various API response formats
    const extractList = (res: any) => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        // If it's a standard generic response with .data
        if (res.data) {
            const inner = res.data;
            if (Array.isArray(inner)) return inner;
            // standard wrapper pattern
            return inner.result || inner.value || inner.response || [];
        }
        // Direct properties on the response object
        return res.result || res.value || res.response || [];
    };

    // Fetch Dropdown List Data
    const fetchCombos = async () => {
        try {
            // Using getAll for Region/etc to ensure we get code/name
            // Bypassing feeder API direct fetch since it returns 404 (feeders are nested inside substations response)
            const [reg, cir, div, sub, comp, substations] = await Promise.all([
                ApiService.locations.region.getAll(),
                ApiService.locations.circle.getAll(),
                ApiService.locations.division.getAll(),
                ApiService.locations.subDivision.getAll(),
                ApiService.company.getCombo(),
                ApiService.locations.substation.getAll()
            ]);

            const substationList = extractList(substations);
            const extractedFeeders = substationList.flatMap((ss: any) => {
                const localFeeders = Array.isArray(ss.feeders) ? ss.feeders : [];
                return localFeeders.map((f: any) => ({
                    ...f,
                    feederId: f.fId || f.feederId || f.id,
                    feederCode: f.fCode || f.feederCode || f.code,
                    feederName: f.fName || f.feederName || f.name || `Feeder ${f.fId || f.feederId}`,
                    substationId: ss.ssId || ss.subStationId || ss.id,
                    subStationId: ss.ssId || ss.subStationId || ss.id, // Normalize casing styles for robustness
                    substationName: ss.ssName || ss.subStationName || ss.name,
                    subStationName: ss.ssName || ss.subStationName || ss.name // Normalize casing styles for robustness
                }));
            });

            setComboData({
                regions: extractList(reg),
                circles: extractList(cir),
                divisions: extractList(div),
                subDivisions: extractList(sub),
                companies: extractList(comp),
                feeders: extractedFeeders,
                substations: substationList
            });
        } catch (e) {
            console.error('Error fetching combos', e);
        }
    };

    useEffect(() => {
        setData([]);
        fetchData();
        // pre-fetch combos for lookups
        fetchCombos();
    }, [activeTab]);

    // Resolve missing subStationId when editing a transformer
    useEffect(() => {
        if (isModalOpen && activeTab === 'transformer' && formData.feederId && !formData.subStationId && comboData.feeders.length > 0) {
            console.log('[DEBUG] resolving missing subStationId for feederId:', formData.feederId);
            const feeder = comboData.feeders.find(f => String(f.feederId || f.fId) === String(formData.feederId));
            if (feeder) {
                const subId = feeder.substationId || feeder.subStationId || feeder.ssId;
                console.log('[DEBUG] resolved subStationId:', subId);
                if (subId) {
                    setFormData((prev: any) => ({ ...prev, subStationId: subId }));
                }
            }
        }
    }, [isModalOpen, activeTab, formData.feederId, formData.subStationId, comboData.feeders]);

    // Dynamic Columns
    const columns: ColumnDef<any>[] = useMemo(() => {
        const cols: ColumnDef<any>[] = [];

        // Serial Number Column
        cols.push({
            id: 'serialNo',
            header: 'S.No',
            cell: ({ row }) => <div className="w-12 text-center">{row.index + 1}</div>,
            size: 50,
            meta: activeTab === 'transformer' ? {
                style: { position: 'sticky', left: 0, backgroundColor: 'white', zIndex: 1, borderRight: '1px solid #e2e8f0' },
                headerStyle: { zIndex: 2 } // Higher z-index for header intersection
            } : undefined
        });

        // Name/Code Columns
        if (activeTab === 'company') {
            cols.push(
                { accessorKey: 'companyCode', header: 'Code' },
                { accessorKey: 'companyName', header: 'Company Name' },
                { accessorKey: 'city', header: 'City' },
                { accessorKey: 'contactNumber', header: 'Phone' }
            );
        } else if (activeTab === 'substation') {
            cols.push(
                { accessorKey: 'ssCode', header: 'Code' },
                { accessorKey: 'ssName', header: 'Name' },
                { accessorKey: 'ssLatitude', header: 'Latitude' },
                { accessorKey: 'ssLongitude', header: 'Longitude' }
            );
        } else if (activeTab === 'transformer') {
            // Transformer Specific Columns (Consolidated)
            // Frozen Columns: S.No (0, 50px) -> Device ID (50, 150px) -> Name (200, 180px) -> Capacity (380, 120px)

            cols.push({
                id: 'deviceId', // Unique ID
                accessorKey: 'transformerCode',
                header: 'Device ID',
                size: 150,
                meta: {
                    style: { position: 'sticky', left: 50, backgroundColor: 'white', zIndex: 1, borderRight: '1px solid #e2e8f0' }
                }
            });
            cols.push({
                id: 'transformerNameCol', // Unique ID
                accessorKey: 'transformerCode',
                header: 'Transformer Name',
                size: 180,
                meta: {
                    style: { position: 'sticky', left: 200, backgroundColor: 'white', zIndex: 1, borderRight: '1px solid #e2e8f0' }
                }
            });
            cols.push({
                accessorKey: 'capacityKVA',
                header: 'Capacity (KVA)',
                size: 120,
                meta: {
                    style: { position: 'sticky', left: 380, backgroundColor: 'white', zIndex: 1, borderRight: '1px solid #e2e8f0', boxShadow: '4px 0 4px -2px rgba(0,0,0,0.1)' } // Shadow on last frozen col
                }
            });

            cols.push({ accessorKey: 'feederName', header: 'Feeder', size: 150 });
            cols.push({ accessorKey: 'subStationName', header: 'Sub-Station', size: 150 });

            cols.push(
                { accessorKey: 'latitude', header: 'Lat' },
                { accessorKey: 'longitude', header: 'Long' }
            );
            cols.push(
                { accessorKey: 'ownerName', header: 'Owner Name' },
                { accessorKey: 'ownerPhoneNo', header: 'Owner Phone' },
                /* { accessorKey: 'ownerEmail', header: 'Owner Email' } */
            );
            cols.push(
                { accessorKey: 'neighborName', header: 'Neighbor Name' },
                { accessorKey: 'neighborPhoneNo', header: 'Neighbor Phone' }
            );
            cols.push({
                id: 'geo',
                header: 'Map',
                cell: ({ row }) => {
                    const lat = row.original.latitude;
                    const lng = row.original.longitude;
                    if (!lat || !lng) return <span className="text-slate-300">-</span>;
                    return (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
                            }}
                            className="text-indigo-600 hover:text-indigo-800 transition-colors p-1"
                            title="View on Google Maps"
                        >
                            <MapPin size={18} />
                        </button>
                    );
                },
                size: 50
            });

        } else if (activeTab === 'feeder') {
            cols.push(
                { accessorKey: 'feederCode', header: 'Code' },
                { accessorKey: 'feederName', header: 'Name' },
                { accessorKey: 'subStationName', header: 'Sub-Station' },
                { accessorKey: 'latitude', header: 'Latitude' },
                { accessorKey: 'longitude', header: 'Longitude' }
            );

        } else {
            cols.push(
                { accessorKey: `${activeTab}Code`, header: 'Code' },
                { accessorKey: `${activeTab}Name`, header: 'Name' }
            );
        }

        // Parent Linkage Columns
        // Removed Company linkage for Region as per request

        if (activeTab === 'circle') {
            cols.push({
                accessorKey: 'regionId',
                header: 'Region',
                cell: ({ row }) => {
                    const id = row.original.regionId;
                    const list = Array.isArray(comboData.regions) ? comboData.regions : [];
                    // Robust lookup: check different ID/Name patterns just in case
                    const found = list.find((x: any) =>
                        x.regionId === id || x.RegionId === id || x.id === id
                    );

                    if (!found) return <span className="text-slate-400 italic">Unknown ({id})</span>;

                    return found.regionName || found.RegionName || found.name || id;
                }
            });
        }

        if (activeTab === 'division') {
            cols.push({
                accessorKey: 'circleId',
                header: 'Circle',
                cell: ({ row }) => {
                    const id = row.original.circleId;
                    const list = Array.isArray(comboData.circles) ? comboData.circles : [];
                    const found = list.find((x: any) =>
                        x.circleId === id || x.CircleId === id || x.id === id
                    );

                    if (!found) return <span className="text-slate-400 italic">Unknown ({id})</span>;

                    return found.circleName || found.CircleName || found.name || id;
                }
            });
        }

        if (activeTab === 'subDivision') {
            cols.push({
                accessorKey: 'divisionId',
                header: 'Division',
                cell: ({ row }) => {
                    const id = row.original.divisionId;
                    const list = Array.isArray(comboData.divisions) ? comboData.divisions : [];
                    const found = list.find((x: any) =>
                        x.divisionId === id || x.DivisionId === id || x.id === id
                    );

                    if (!found) return <span className="text-slate-400 italic">Unknown ({id})</span>;

                    return found.divisionName || found.DivisionName || found.name || id;
                }
            });
        }

        if (activeTab === 'substation') {
            cols.push({
                accessorKey: 'subDivisionId',
                header: 'Sub-Division',
                cell: ({ row }) => {
                    const id = row.original.subDivisionId;
                    const list = Array.isArray(comboData.subDivisions) ? comboData.subDivisions : [];
                    const found = list.find((x: any) => x.subDivisionId === id);
                    return found ? found.subDivisionName : id;
                }
            });
        }
        // Removed redundant transformer block - logic moved to consolidated block above

        cols.push({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)}>
                        <Pencil size={14} className="text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => {
                        let id;
                        if (activeTab === 'company') id = row.original.id;
                        else if (activeTab === 'transformer') id = row.original.transformerId || row.original.masterId;
                        else if (activeTab === 'substation') id = row.original.ssId || row.original.subStationId || row.original.substationId || row.original.id;
                        else id = row.original[`${activeTab}Id`];

                        console.log(`Deleting ${activeTab} ID:`, id); // Debug
                        if (id) handleDelete(id);
                        else toast.error('Could not determine record ID');
                    }}>
                        <Trash2 size={14} className="text-red-600" />
                    </Button>
                </div>
            )
        });

        return cols;
    }, [activeTab, comboData]);

    const handleEdit = (item: any) => {
        setFormData(item);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setFormData({});
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try {
            let apiGroup;
            if (activeTab === 'company') apiGroup = ApiService.company;
            else if (activeTab === 'transformer') apiGroup = ApiService.transformers;
            // @ts-ignore
            else apiGroup = ApiService.locations[activeTab];

            const res = await apiGroup.delete(id);
            if (res.success) {
                toast.success('Deleted');
                fetchData();
            } else {
                toast.error(res.message || 'Failed');
            }
        } catch (e) { toast.error('Network Error'); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let apiGroup;
            let id;

            if (activeTab === 'company') {
                apiGroup = ApiService.company;
                id = formData.id;
            } else if (activeTab === 'transformer') {
                apiGroup = ApiService.transformers;
                id = formData.transformerId || formData.masterId;
            } else if (activeTab === 'substation') {
                // @ts-ignore
                apiGroup = ApiService.locations[activeTab];
                // Check possible ID keys for Substation
                id = formData.ssId || formData.subStationId || formData.substationId || formData.id;
            } else {
                // @ts-ignore
                apiGroup = ApiService.locations[activeTab];
                id = formData[`${activeTab}Id`];
            }

            // Duplicate Validation
            if (!isEditing && ['region', 'circle', 'division'].includes(activeTab)) {
                const codeKey = `${activeTab}Code`;
                const nameKey = `${activeTab}Name`;
                const inputCode = String(formData[codeKey] || '').trim().toLowerCase();
                const inputName = String(formData[nameKey] || '').trim().toLowerCase();

                const isDuplicateCode = data.some((item: any) => String(item[codeKey] || '').trim().toLowerCase() === inputCode);
                const isDuplicateName = data.some((item: any) => String(item[nameKey] || '').trim().toLowerCase() === inputName);

                if (isDuplicateCode) {
                    toast.error(`Duplicate ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Code found.`);
                    return;
                }
                if (isDuplicateName) {
                    toast.error(`Duplicate ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Name found.`);
                    return;
                }
            }

            // Prepare Payload with Timestamps to fix DB constraints
            const now = new Date().toISOString();
            const basePayload = { ...formData, updatedOn: now, UpdatedOn: now };

            if (!isEditing) {
                basePayload.createdOn = now;
                basePayload.CreatedOn = now;
                // Set default active status for new entries if applicable
                if (activeTab === 'company') {
                    basePayload.isActive = true;
                    basePayload.IsActive = true;
                }
            }

            let res;
            if (isEditing) {
                // Ensure ID is valid
                if (!id) {
                    toast.error('Update failed: Missing Record ID');
                    return;
                }

                // Ensure ID is explicitly in the payload for updates
                if (activeTab === 'company') basePayload.id = id;
                else if (activeTab === 'transformer') {
                    basePayload.transformerId = id;
                    basePayload.masterId = id; // Fallback helper
                }
                else if (activeTab === 'substation') {
                    basePayload.ssId = id;
                    basePayload.subStationId = id; // Redundant but safe
                }
                // Handle update call signature differences
                if (['region', 'circle', 'division', 'subDivision'].includes(activeTab)) {
                    res = await (apiGroup as any).update(id, basePayload);
                } else if (activeTab === 'substation') {
                    // Substation expects a specific wrapper based on error: "substationDTO field is required"
                    // And the update signature in api.ts is update(data), not update(id, data)
                    const wrappedPayload = { substationDTO: basePayload };
                    console.log('Substation Update Payload:', wrappedPayload);
                    res = await (apiGroup as any).update(wrappedPayload);
                } else {
                    res = await (apiGroup as any).update(basePayload);
                }
            } else {
                if (activeTab === 'substation') {
                    const wrappedPayload = { substationDTO: basePayload };
                    console.log('Substation Create Payload:', wrappedPayload);
                    res = await (apiGroup as any).create(wrappedPayload);
                } else {
                    res = await (apiGroup as any).create(basePayload);
                }
            }

            // More permissive success check
            if (res && (res.success === true || res.success === undefined || res.id || res.result)) {
                toast.success('Saved successfully');
                setIsModalOpen(false);
                fetchData();
            } else {
                toast.error(res?.message || 'Operation failed');
            }
        } catch (e) { toast.error('Network Error'); }
    };

    // Helper to get nested/case-insensitive property
    const ml_get = (obj: any, key: string) => {
        if (!obj) return undefined;
        if (obj[key] !== undefined) return obj[key];
        // capitalize first letter
        const cap = key.charAt(0).toUpperCase() + key.slice(1);
        if (obj[cap] !== undefined) return obj[cap];
        return undefined;
    };

    // Render Dropdown Helper
    const renderSelect = (label: string, field: string, options: any[], idKey: string, nameKey: string) => {
        // Safe check for options
        const safeOptions = Array.isArray(options) ? options : [];

        // Transform options for SearchableSelect
        const selectOptions = safeOptions.map((opt: any) => {
            // Case-insensitive fallback for keys
            const idVal = opt[idKey] || ml_get(opt, idKey);
            const nameVal = opt[nameKey] || ml_get(opt, nameKey);

            // Fallback if specific keys fail (e.g. "id", "name", "Id", "Name")
            const finalId = idVal || opt.id || opt.Id || opt[`${label}Id`];
            const finalName = nameVal || opt.name || opt.Name || opt[`${label}Name`];

            if (finalId === undefined) return null;

            return {
                label: `${finalName || finalId}${String(finalId) !== String(finalName) ? ` (${finalId})` : ''}`,
                value: finalId
            };
        }).filter(Boolean) as { label: string, value: string | number }[];

        return (
            <SearchableSelect
                label={label}
                options={selectOptions}
                value={formData[field]}
                onChange={(val) => {
                    // Handle numeric IDs if necessary
                    setFormData({ ...formData, [field]: val ? (isNaN(Number(val)) ? val : Number(val)) : '' });
                }}
                required
                placeholder={`Select ${label}...`}
            />
        );
    };
    // End of helper functions

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[hsl(var(--border))] shadow-sm">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin')}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                            <Network className="text-indigo-600" /> Master Configuration
                        </h1>
                        <p className="text-xs text-muted-foreground">Manage Regions, Circles, Divisions, and Network Hierarchy</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white" size="sm">
                        <Plus size={16} className="mr-2" /> Add {(() => {
                            const label = TABS.find(t => t.id === activeTab)?.label || '';
                            if (label === 'Companies') return 'Company';
                            return label.endsWith('s') ? label.slice(0, -1) : label;
                        })()}
                    </Button>
                </div>
            </div>

            {/* Modern Tabs */}
            <div className="border-b flex gap-1 overflow-x-auto">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all relative whitespace-nowrap",
                                isActive
                                    ? "text-indigo-600 bg-indigo-50/50 rounded-t-lg"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-lg"
                            )}
                        >
                            <Icon size={16} className={clsx(isActive ? "text-indigo-600" : "text-slate-400")} />
                            {tab.label}
                            {isActive && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 animate-slide-in-right" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-b-xl rounded-tr-xl border shadow-sm p-4 min-h-[400px]">
                <DataTable
                    key={activeTab} // Force re-mount to clear sorting/filtering state
                    columns={columns}
                    data={data}
                    isLoading={isLoading}
                    searchKey={(() => {
                        if (activeTab === 'company') return 'companyName';
                        if (activeTab === 'transformer') return 'deviceId'; // Searches by Device ID column
                        if (activeTab === 'substation') return 'ssName';
                        return `${activeTab}Name`;
                    })()}
                    exportFileName={(() => {
                        const tabObj = TABS.find(t => t.id === activeTab);
                        return tabObj ? tabObj.label : 'Master';
                    })()}
                    exportTitle={(() => {
                        const tabObj = TABS.find(t => t.id === activeTab);
                        return tabObj ? `${tabObj.label} List` : 'Master Configuration';
                    })()}
                />
            </div>

            {/* Config Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`${isEditing ? 'Edit' : 'Add'} ${(() => {
                    const label = TABS.find(t => t.id === activeTab)?.label || '';
                    if (label === 'Companies') return 'Company';
                    return label.endsWith('s') ? label.slice(0, -1) : label;
                })()}`}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Common Fields (Name/Code) - Except for Transformer which handles it differently */}
                    {activeTab !== 'transformer' && activeTab !== 'substation' && (
                        <div className="grid grid-cols-2 gap-4">
                            {/* ... (existing generic code) ... */}
                            {activeTab === 'company' ? (
                                <>
                                    <Input
                                        label="Short Code"
                                        value={formData.companyCode || ''}
                                        onChange={(e) => setFormData({ ...formData, companyCode: e.target.value })}
                                    />
                                    <Input
                                        label="Company Name"
                                        value={formData.companyName || ''}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        required
                                    />
                                </>
                            ) : (
                                <>
                                    <Input
                                        label="Code"
                                        value={formData[`${activeTab}Code`] || ''}
                                        onChange={(e) => setFormData({ ...formData, [`${activeTab}Code`]: e.target.value })}
                                        required
                                    />
                                    <Input
                                        label="Name"
                                        value={formData[`${activeTab}Name`] || ''}
                                        onChange={(e) => setFormData({ ...formData, [`${activeTab}Name`]: e.target.value })}
                                        required
                                    />
                                </>
                            )}
                        </div>
                    )}

                    {/* Substation Specific Fields (ssCode/ssName) */}
                    {activeTab === 'substation' && (
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Sub-Station Code"
                                value={formData.ssCode || formData.substationCode || ''}
                                onChange={(e) => setFormData({ ...formData, ssCode: e.target.value, substationCode: e.target.value })}
                                required
                            />
                            <Input
                                label="Sub-Station Name"
                                value={formData.ssName || formData.substationName || ''}
                                onChange={(e) => setFormData({ ...formData, ssName: e.target.value, substationName: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    {/* Company Specific */}
                    {activeTab === 'company' && (
                        <>
                            <Input label="Address" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="City" value={formData.city || ''} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                                <Input label="Phone" value={formData.contactNumber || ''} onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })} />
                            </div>
                        </>
                    )}

                    {/* Transformer Specific */}
                    {activeTab === 'transformer' && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                {/* Use transformerCode as the main identifier */}
                                <Input label="Transformer Code" value={formData.transformerCode || formData.masterCode || ''} onChange={(e) => setFormData({ ...formData, transformerCode: e.target.value, masterCode: e.target.value })} required />
                                <Input label="Capacity (KVA)" value={formData.capacityKVA || formData.capacity || ''} onChange={(e) => setFormData({ ...formData, capacityKVA: e.target.value })} />
                            </div>

                            {/* Linked to Sub-Station */}
                            <div className="mt-2">
                                <SearchableSelect
                                    label="Sub-Station"
                                    placeholder="Select Sub-Station..."
                                    options={comboData.substations.map(ss => ({
                                        label: `${ss.ssName || ss.name || ss.ssId} (${ss.ssId || ss.id})`,
                                        value: ss.ssId || ss.id
                                    }))}
                                    value={formData.subStationId}
                                    onChange={(val) => {
                                        const numVal = val ? (isNaN(Number(val)) ? val : Number(val)) : '';
                                        
                                        // Clear Feeder if it doesn't belong to the new Sub-Station
                                        let updatedFeederId = formData.feederId;
                                        if (numVal && formData.feederId) {
                                            const currentFeeder = comboData.feeders.find(f => String(f.feederId || f.fId) === String(formData.feederId));
                                            if (currentFeeder) {
                                                const fSubId = currentFeeder.substationId || currentFeeder.subStationId || currentFeeder.ssId;
                                                if (String(fSubId) !== String(numVal)) {
                                                    updatedFeederId = '';
                                                }
                                            }
                                        }
                                        setFormData({ ...formData, subStationId: numVal, feederId: updatedFeederId });
                                    }}
                                />
                            </div>

                            {/* Linked to Feeder */}
                            <div className="mt-2">
                                <SearchableSelect
                                    label="Feeder"
                                    placeholder="Select Feeder..."
                                    required
                                    options={(formData.subStationId
                                        ? comboData.feeders.filter(f => String(f.substationId || f.subStationId || f.ssId) === String(formData.subStationId))
                                        : []
                                    ).map(f => ({
                                        label: `${f.feederName || f.name} (${f.feederId || f.fId})`,
                                        value: f.feederId || f.fId
                                    }))}
                                    value={formData.feederId}
                                    onChange={(val) => {
                                        const numVal = val ? (isNaN(Number(val)) ? val : Number(val)) : '';
                                        
                                        // Auto-select parent Sub-Station if Feeder is selected
                                        let parentSubId = formData.subStationId;
                                        if (numVal) {
                                            const feederObj = comboData.feeders.find(f => String(f.feederId || f.fId) === String(numVal));
                                            if (feederObj) {
                                                parentSubId = feederObj.substationId || feederObj.subStationId || feederObj.ssId || '';
                                            }
                                        }
                                        setFormData({ 
                                            ...formData, 
                                            feederId: numVal,
                                            subStationId: parentSubId ? (isNaN(Number(parentSubId)) ? parentSubId : Number(parentSubId)) : ''
                                        });
                                    }}
                                />
                            </div>

                            {/* Location */}
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <Input label="Latitude" value={formData.latitude || ''} onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })} />
                                <Input label="Longitude" value={formData.longitude || ''} onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })} />
                            </div>

                            {/* Owner Details */}
                            <div className="border-t pt-4 mt-4">
                                <h4 className="text-sm font-semibold mb-3 text-slate-600">Owner Details</h4>
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <Input label="Name" value={formData.ownerName || ''} onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })} />
                                    <Input label="Phone" value={formData.ownerPhoneNo || formData.ownerPhone || ''} onChange={(e) => setFormData({ ...formData, ownerPhoneNo: e.target.value })} />
                                </div>
                                <Input label="Email" value={formData.ownerEmail || ''} onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })} />
                            </div>

                            {/* Neighbor Details */}
                            <div className="border-t pt-4 mt-4">
                                <h4 className="text-sm font-semibold mb-3 text-slate-600">Neighbor Details</h4>
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <Input label="Name" value={formData.neighborName || formData.neighbourName || ''} onChange={(e) => setFormData({ ...formData, neighborName: e.target.value })} />
                                    <Input label="Phone" value={formData.neighborPhoneNo || formData.neighbourPhone || ''} onChange={(e) => setFormData({ ...formData, neighborPhoneNo: e.target.value })} />
                                </div>
                                <Input label="Email" value={formData.neighborEmail || formData.neighbourEmail || ''} onChange={(e) => setFormData({ ...formData, neighborEmail: e.target.value })} />
                            </div>
                        </>
                    )}

                    {/* Hierarchy Dropdowns: Company Removed from Region */}

                    {activeTab === 'circle' && renderSelect('Region', 'regionId', comboData.regions, 'regionId', 'regionName')}

                    {activeTab === 'division' && renderSelect('Circle', 'circleId', comboData.circles, 'circleId', 'circleName')}

                    {activeTab === 'subDivision' && renderSelect('Division', 'divisionId', comboData.divisions, 'divisionId', 'divisionName')}

                    {activeTab === 'substation' && (
                        <>
                            {renderSelect('Sub-Division', 'subDivisionId', comboData.subDivisions, 'subDivisionId', 'subDivisionName')}
                            {/* Additional Substation Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Latitude" value={formData.ssLatitude || ''} onChange={(e) => setFormData({ ...formData, ssLatitude: e.target.value })} />
                                <Input label="Longitude" value={formData.ssLongitude || ''} onChange={(e) => setFormData({ ...formData, ssLongitude: e.target.value })} />
                            </div>
                            <Input label="Address" value={formData.ssAddress || ''} onChange={(e) => setFormData({ ...formData, ssAddress: e.target.value })} />
                        </>
                    )}

                    {activeTab === 'feeder' && (
                        <>
                            {renderSelect('Sub-Station', 'subStationId', comboData.substations, 'ssId', 'ssName')}
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Feeder Code" value={formData.feederCode || formData.fCode || ''} onChange={(e) => setFormData({ ...formData, feederCode: e.target.value, fCode: e.target.value })} required />
                                <Input label="Feeder Name" value={formData.feederName || formData.fName || ''} onChange={(e) => setFormData({ ...formData, feederName: e.target.value, fName: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <Input label="Latitude" value={formData.latitude || formData.fLatitude || ''} onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value), fLatitude: parseFloat(e.target.value) })} />
                                <Input label="Longitude" value={formData.longitude || formData.fLongitude || ''} onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value), fLongitude: parseFloat(e.target.value) })} />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                            {isEditing ? 'Update Changes' : 'Save Record'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
