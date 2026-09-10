'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { ApiService } from '@/services/api';
import { ArrowLeft, Plus, Pencil, Trash2, Server, Smartphone, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';

interface FeederMapping {
    id: string;
    feederId: string;
    feederCode: string;
    feederName: string;
    substationName: string;
    circleName: string;
    divisionName: string;
    masterDeviceId: string;
}

interface TransformerMapping {
    id: string;
    transformerId: string;
    transformerCode: string;
    transformerName: string;
    nodeId: string;
    circleName: string;
    divisionName: string;
}

const MOCK_MASTER_DEVICES = [
    { value: 'APLM-MD001-APLM-MD001', label: 'Master APLM-MD001 (APLM-MD001)' },
    { value: 'APLM-MD002-APLM-MD002', label: 'Master APLM-MD002 (APLM-MD002)' },
    { value: 'APLM-MD003-APLM-MD003', label: 'Master APLM-MD003 (APLM-MD003)' }
];

const MOCK_NODES = [
    { value: 'ND001-ND001', label: 'Node ND001 (ND001-ND001)' },
    { value: 'ND002-ND002', label: 'Node ND002 (ND002-ND002)' },
    { value: 'ND003-ND003', label: 'Node ND003 (ND003-ND003)' },
    { value: 'ND004-ND004', label: 'Node ND004 (ND004-ND004)' },
    { value: 'ND005-ND005', label: 'Node ND005 (ND005-ND005)' }
];

const INITIAL_FEEDER_MAPPINGS: FeederMapping[] = [
    {
        id: 'FM-001',
        feederId: 'F1',
        feederCode: 'MDUW-F01',
        feederName: 'MDUW-F01-Feeder_01',
        substationName: 'MDUW-SS001-Substation_01',
        circleName: 'Madurai Circle',
        divisionName: 'Madurai West',
        masterDeviceId: 'APLM-MD001-APLM-MD001'
    },
    {
        id: 'FM-002',
        feederId: 'F2',
        feederCode: 'MDUW-F02',
        feederName: 'MDUW-F02-Feeder_02',
        substationName: 'MDUW-SS001-Substation_01',
        circleName: 'Madurai Circle',
        divisionName: 'Madurai West',
        masterDeviceId: 'APLM-MD002-APLM-MD002'
    }
];

const INITIAL_TRANSFORMER_MAPPINGS: TransformerMapping[] = [
    {
        id: 'TM-001',
        transformerId: 'T1',
        transformerCode: 'TR-APLM-001',
        transformerName: 'TUP-NB001-250',
        nodeId: 'ND001-ND001',
        circleName: 'Tiruppur Circle',
        divisionName: 'Aarapalayam Division'
    },
    {
        id: 'TM-002',
        transformerId: 'T2',
        transformerCode: 'TR-APLM-002',
        transformerName: 'TUP-PMB001-280',
        nodeId: 'ND002-ND002',
        circleName: 'Tiruppur Circle',
        divisionName: 'Aarapalayam Division'
    }
];

export default function DeviceMappingPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'feederMaster' | 'transformerNode'>('feederMaster');
    
    // Feeder Master Mapping State
    const [feederMappings, setFeederMappings] = useState<FeederMapping[]>(INITIAL_FEEDER_MAPPINGS);
    
    // Transformer Node Mapping State
    const [transMappings, setTransMappings] = useState<TransformerMapping[]>(INITIAL_TRANSFORMER_MAPPINGS);
    
    // Master data lists for combos
    const [feeders, setFeeders] = useState<any[]>([]);
    const [transformers, setTransformers] = useState<any[]>([]);
    const [masterDevices, setMasterDevices] = useState<any[]>([]);
    const [masterDevicesList, setMasterDevicesList] = useState<any[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState<any>({});

    // Fetch Feeder and Transformer master list data
    const fetchMasterLists = async () => {
        setIsDataLoading(true);
        try {
            // Load Feeders from Substation list
            const subResponse = await ApiService.locations.substation.getAll();
            const subList = Array.isArray(subResponse.data) 
                ? subResponse.data 
                : ((subResponse.data as any)?.response || (subResponse.data as any)?.result || []);

            const flattenedFeeders = subList.flatMap((ss: any) => {
                const localFeeders = Array.isArray(ss.feeders) ? ss.feeders : [];
                return localFeeders.map((f: any) => ({
                    feederId: f.fId || f.feederId || `F-${f.fCode || f.feederCode}`,
                    feederCode: f.fCode || f.feederCode,
                    feederName: f.fName || f.feederName,
                    subStationId: ss.ssId || ss.subStationId,
                    subStationName: ss.ssName || ss.subStationName || `Substation ${ss.ssId}`,
                    divisionName: ss.divisionName || ss.division || 'Madurai West',
                    circleName: ss.circleName || ss.circle || 'Madurai Circle'
                }));
            });
            setFeeders(flattenedFeeders);

            // Load Transformers
            const transResponse = await ApiService.transformers.getAll();
            const transList = Array.isArray(transResponse.data) 
                ? transResponse.data 
                : ((transResponse.data as any)?.response || (transResponse.data as any)?.result || []);
            
            const normalizedTransformers = transList.map((t: any) => ({
                id: t.masterId || t.transformerId || t.id,
                transformerId: t.masterId || t.transformerId || t.id,
                transformerCode: t.masterCode || t.transformerCode || `TR-${t.masterId}`,
                transformerName: t.masterName || t.name || `Transformer ${t.masterId}`,
                circleName: t.circleName || t.circle || 'Madurai Circle',
                divisionName: t.divisionName || t.division || 'Madurai West'
            }));
            setTransformers(normalizedTransformers);

            // Load Master Devices (with full details)
            try {
                const mdResponse = await ApiService.masterDevices.getAll();
                const mdList = Array.isArray(mdResponse.data) 
                    ? mdResponse.data 
                    : ((mdResponse.data as any)?.response || (mdResponse.data as any)?.result || []);
                setMasterDevicesList(mdList);
                
                const normalizedMasterDevices = mdList.map((md: any) => ({
                    value: `${md.masterCode} - (${md.communicationId})`,
                    label: `Master ${md.masterCode} - (${md.communicationId})`
                }));
                setMasterDevices(normalizedMasterDevices.length > 0 ? normalizedMasterDevices : MOCK_MASTER_DEVICES);
            } catch (mdErr) {
                console.error("Failed to load Master Devices list, using mocks", mdErr);
                setMasterDevices(MOCK_MASTER_DEVICES);
            }

        } catch (e) {
            console.error("Failed to load device mapping combos", e);
            toast.error("Error loading master lists");
        } finally {
            setIsDataLoading(false);
        }
    };

    useEffect(() => {
        fetchMasterLists();
    }, []);

    // Get selected details based on selections in form
    const selectedFeeder = useMemo(() => {
        if (!formData.feederId || feeders.length === 0) return null;
        return feeders.find(f => String(f.feederId) === String(formData.feederId));
    }, [formData.feederId, feeders]);

    const selectedTransformer = useMemo(() => {
        if (!formData.transformerId || transformers.length === 0) return null;
        return transformers.find(t => String(t.transformerId) === String(formData.transformerId));
    }, [formData.transformerId, transformers]);

    const selectedMasterDevice = useMemo(() => {
        if (!formData.masterDeviceId) return null;
        const liveMatch = masterDevicesList.find(md => {
            const valStr = `${md.masterCode} - (${md.communicationId})`;
            return String(formData.masterDeviceId) === valStr || 
                   String(formData.masterDeviceId).includes(md.masterCode);
        });
        if (liveMatch) return liveMatch;

        const mockCode = String(formData.masterDeviceId).split('-')[0] || String(formData.masterDeviceId);
        return {
            masterCode: mockCode,
            masterName: mockCode,
            communicationId: '40001',
            serialNo: '1234564899',
            isOnline: true,
            installedOn: '2025-08-19T08:35:39.343'
        };
    }, [formData.masterDeviceId, masterDevicesList]);

    const handleAdd = () => {
        setFormData(activeTab === 'feederMaster' 
            ? { feederId: '', masterDeviceId: '' } 
            : { transformerId: '', nodeId: '' }
        );
        setIsEditing(false);
        setEditId(null);
        setIsModalOpen(true);
    };

    const handleEdit = (item: any) => {
        if (activeTab === 'feederMaster') {
            setFormData({
                feederId: item.feederId,
                masterDeviceId: item.masterDeviceId
            });
        } else {
            setFormData({
                transformerId: item.transformerId,
                nodeId: item.nodeId
            });
        }
        setIsEditing(true);
        setEditId(item.id);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure you want to delete this mapping?")) return;
        if (activeTab === 'feederMaster') {
            setFeederMappings(prev => prev.filter(m => m.id !== id));
        } else {
            setTransMappings(prev => prev.filter(m => m.id !== id));
        }
        toast.success("Mapping deleted successfully");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (activeTab === 'feederMaster') {
            if (!formData.feederId || !formData.masterDeviceId) {
                toast.error("Please select all required fields.");
                return;
            }

            const feederObj = feeders.find(f => String(f.feederId) === String(formData.feederId));
            if (!feederObj) {
                toast.error("Invalid Feeder selection");
                return;
            }

            if (isEditing && editId) {
                setFeederMappings(prev => prev.map(m => 
                    m.id === editId 
                        ? {
                            ...m,
                            feederId: feederObj.feederId,
                            feederCode: feederObj.feederCode,
                            feederName: feederObj.feederName,
                            substationName: feederObj.subStationName,
                            circleName: feederObj.circleName,
                            divisionName: feederObj.divisionName,
                            masterDeviceId: formData.masterDeviceId
                        }
                        : m
                ));
                toast.success("Feeder Master Mapping updated successfully");
            } else {
                const newMapping: FeederMapping = {
                    id: `FM-${Math.floor(100 + Math.random() * 900)}`,
                    feederId: feederObj.feederId,
                    feederCode: feederObj.feederCode,
                    feederName: feederObj.feederName,
                    substationName: feederObj.subStationName,
                    circleName: feederObj.circleName,
                    divisionName: feederObj.divisionName,
                    masterDeviceId: formData.masterDeviceId
                };
                setFeederMappings(prev => [...prev, newMapping]);
                toast.success("Feeder Master Mapping created successfully");
            }
        } else {
            // Transformer Node mapping
            if (!formData.transformerId || !formData.nodeId) {
                toast.error("Please select all required fields.");
                return;
            }

            const transObj = transformers.find(t => String(t.transformerId) === String(formData.transformerId));
            if (!transObj) {
                toast.error("Invalid Transformer selection");
                return;
            }

            if (isEditing && editId) {
                setTransMappings(prev => prev.map(m => 
                    m.id === editId 
                        ? {
                            ...m,
                            transformerId: transObj.transformerId,
                            transformerCode: transObj.transformerCode,
                            transformerName: transObj.transformerName,
                            circleName: transObj.circleName,
                            divisionName: transObj.divisionName,
                            nodeId: formData.nodeId
                        }
                        : m
                ));
                toast.success("Transformer Node Mapping updated successfully");
            } else {
                const newMapping: TransformerMapping = {
                    id: `TM-${Math.floor(100 + Math.random() * 900)}`,
                    transformerId: transObj.transformerId,
                    transformerCode: transObj.transformerCode,
                    transformerName: transObj.transformerName,
                    circleName: transObj.circleName,
                    divisionName: transObj.divisionName,
                    nodeId: formData.nodeId
                };
                setTransMappings(prev => [...prev, newMapping]);
                toast.success("Transformer Node Mapping created successfully");
            }
        }
        setIsModalOpen(false);
    };

    // Columns definitions
    const feederColumns: ColumnDef<FeederMapping>[] = useMemo(() => [
        { accessorKey: 'feederCode', header: 'Feeder Code' },
        { accessorKey: 'feederName', header: 'Feeder Name' },
        { accessorKey: 'masterDeviceId', header: 'Master Device ID', cell: ({ row }) => <span className="font-mono text-xs bg-slate-100 border px-2 py-0.5 rounded">{row.original.masterDeviceId}</span> },
        { accessorKey: 'substationName', header: 'Substation' },
        { accessorKey: 'circleName', header: 'Circle' },
        { accessorKey: 'divisionName', header: 'Division' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)}>
                        <Pencil size={14} className="text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(row.original.id)}>
                        <Trash2 size={14} className="text-red-600" />
                    </Button>
                </div>
            )
        }
    ], [feeders]);

    const transColumns: ColumnDef<TransformerMapping>[] = useMemo(() => [
        { accessorKey: 'transformerCode', header: 'Transformer Code' },
        { accessorKey: 'transformerName', header: 'Transformer Name' },
        { accessorKey: 'nodeId', header: 'Node ID', cell: ({ row }) => <span className="font-mono text-xs bg-slate-100 border px-2 py-0.5 rounded">{row.original.nodeId}</span> },
        { accessorKey: 'circleName', header: 'Circle' },
        { accessorKey: 'divisionName', header: 'Division' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(row.original)}>
                        <Pencil size={14} className="text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(row.original.id)}>
                        <Trash2 size={14} className="text-red-600" />
                    </Button>
                </div>
            )
        }
    ], [transformers]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[hsl(var(--border))] shadow-sm mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/admin')}>
                        <ArrowLeft size={18} />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                            <Server className="text-blue-600" /> Device Mapping
                        </h1>
                        <p className="text-xs text-muted-foreground">Link registered Feeders and Transformers to Master devices and Nodes.</p>
                    </div>
                </div>

                <Button size="sm" onClick={handleAdd} className="bg-blue-600 text-white">
                    <Plus size={16} className="mr-2" /> Add New
                </Button>
            </div>

            {/* Tab selection */}
            <div className="border-b border-slate-200 px-4 flex gap-6">
                <button
                    onClick={() => setActiveTab('feederMaster')}
                    className={clsx(
                        "flex items-center gap-2 pb-3 pt-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'feederMaster'
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    )}
                >
                    <Smartphone size={16} />
                    Feeder Master Mapping
                </button>
                <button
                    onClick={() => setActiveTab('transformerNode')}
                    className={clsx(
                        "flex items-center gap-2 pb-3 pt-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'transformerNode'
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    )}
                >
                    <Zap size={16} />
                    Transformer Node Mapping
                </button>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
                {activeTab === 'feederMaster' ? (
                    <DataTable
                        columns={feederColumns}
                        data={feederMappings}
                        isLoading={isDataLoading}
                        searchKey="feederName"
                        exportFileName="Feeder-Master-Mappings"
                        exportTitle="Feeder Master Mapping List"
                        showSerialNumber={true}
                    />
                ) : (
                    <DataTable
                        columns={transColumns}
                        data={transMappings}
                        isLoading={isDataLoading}
                        searchKey="transformerName"
                        exportFileName="Transformer-Node-Mappings"
                        exportTitle="Transformer Node Mapping List"
                        showSerialNumber={true}
                    />
                )}
            </div>

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`${isEditing ? 'Edit' : 'Add New'} ${activeTab === 'feederMaster' ? 'Feeder Master Mapping' : 'Transformer Node Mapping'}`}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {activeTab === 'feederMaster' ? (
                        <>
                            {/* Feeder Searchable Dropdown */}
                            <div>
                                <SearchableSelect
                                    label="Feeder"
                                    placeholder="Select Feeder..."
                                    required
                                    options={feeders.map(f => ({
                                        label: `${f.feederName} (${f.feederCode})`,
                                        value: f.feederId
                                    }))}
                                    value={formData.feederId}
                                    onChange={(val) => setFormData({ ...formData, feederId: val })}
                                />
                            </div>

                            {/* Feeder Details display */}
                            {selectedFeeder && (
                                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mt-2 animate-fade-in space-y-2">
                                    <h5 className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <Smartphone size={13} /> Selected Feeder Details
                                    </h5>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-700">
                                        <div>
                                            <span className="text-slate-400">Name:</span> <span className="font-semibold">{selectedFeeder.feederName}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Code:</span> <span className="font-semibold">{selectedFeeder.feederCode}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Substation:</span> <span className="font-semibold">{selectedFeeder.subStationName}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Circle:</span> <span className="font-semibold">{selectedFeeder.circleName}</span>
                                        </div>
                                        <div className="col-span-2 border-t pt-1 mt-1 border-blue-100/50">
                                            <span className="text-slate-400">Division:</span> <span className="font-semibold">{selectedFeeder.divisionName}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Master Device Dropdown */}
                            <div className="mt-2">
                                <SearchableSelect
                                    label="Master Device"
                                    placeholder="Select Master Device..."
                                    required
                                    options={masterDevices}
                                    value={formData.masterDeviceId}
                                    onChange={(val) => setFormData({ ...formData, masterDeviceId: val })}
                                />
                            </div>

                            {/* Master Device Details display */}
                            {selectedMasterDevice && (
                                <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 mt-2 animate-fade-in space-y-2">
                                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <Server size={13} className="text-blue-600" /> Selected Master Device Details
                                    </h5>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-700">
                                        <div>
                                            <span className="text-slate-400">Name:</span> <span className="font-semibold">{selectedMasterDevice.masterName}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Code:</span> <span className="font-semibold">{selectedMasterDevice.masterCode}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Comm ID:</span> <span className="font-mono font-semibold">{selectedMasterDevice.communicationId}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Serial No:</span> <span className="font-mono font-semibold">{selectedMasterDevice.serialNo || 'N/A'}</span>
                                        </div>
                                        <div className="col-span-2 border-t pt-1.5 mt-1.5 border-slate-200/50 flex justify-between items-center">
                                            <div>
                                                <span className="text-slate-400">Status: </span>
                                                <span className={clsx(
                                                    "font-bold",
                                                    selectedMasterDevice.isOnline ? "text-emerald-600" : "text-rose-500"
                                                )}>
                                                    {selectedMasterDevice.isOnline ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                            {selectedMasterDevice.installedOn && selectedMasterDevice.installedOn !== '0001-01-01T00:00:00' && (
                                                <div className="text-[10px] text-slate-400">
                                                    Installed: {new Date(selectedMasterDevice.installedOn).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Transformer Searchable Dropdown */}
                            <div>
                                <SearchableSelect
                                    label="Transformer"
                                    placeholder="Select Transformer..."
                                    required
                                    options={transformers.map(t => ({
                                        label: `${t.transformerName} (${t.transformerCode})`,
                                        value: t.transformerId
                                    }))}
                                    value={formData.transformerId}
                                    onChange={(val) => setFormData({ ...formData, transformerId: val })}
                                />
                            </div>

                            {/* Transformer Details display */}
                            {selectedTransformer && (
                                <div className="bg-indigo-50/40 border border-indigo-100/60 rounded-xl p-4 mt-2 animate-fade-in space-y-2">
                                    <h5 className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <Zap size={13} /> Selected Transformer Details
                                    </h5>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-700">
                                        <div>
                                            <span className="text-slate-400">Name:</span> <span className="font-semibold">{selectedTransformer.transformerName}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Code:</span> <span className="font-semibold">{selectedTransformer.transformerCode}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Circle:</span> <span className="font-semibold">{selectedTransformer.circleName}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Division:</span> <span className="font-semibold">{selectedTransformer.divisionName}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Node Dropdown */}
                            <div className="mt-2">
                                <SearchableSelect
                                    label="Node"
                                    placeholder="Select Node..."
                                    required
                                    options={MOCK_NODES}
                                    value={formData.nodeId}
                                    onChange={(val) => setFormData({ ...formData, nodeId: val })}
                                />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                            {isEditing ? 'Update Mapping' : 'Save Mapping'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
