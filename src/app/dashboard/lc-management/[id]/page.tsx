'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, MapPin, Calendar, Info, Activity, Search, Download, ChevronDown, PowerOff, AlertTriangle, Zap } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { clsx } from 'clsx';
import MapView from '@/components/Map';
import { motion } from 'framer-motion';
import { ApiService } from '@/services/api';
import { Tooltip } from '@/components/ui/Tooltip';
import { TransformerLoader } from '@/components/ui/TransformerLoader';

// Helper to get past date string (current date - N days)
const getPastDateString = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
};

// Robust helper to extract clean transformer code
const getCleanTransformerCode = (item: any): string => {
    if (!item) return '';
    if (typeof item === 'string') {
        return item.replace(/^TR-/, '').replace(/-\d+$/, '').trim();
    }
    const raw = item.transformer || item.Transformer || item.transformerCode || item.TransformerCode || item.masterCode || item.MasterCode || item.code || item.Code || item.transformerId || item.TransformerId || item.masterId || item.MasterId || item.id || item.Id || '';
    return String(raw).replace(/^TR-/, '').replace(/-\d+$/, '').trim();
};

// Helper to format capacity cleanly without hardcoded fallback values
const formatCapacity = (cap: any) => {
    if (cap === undefined || cap === null || cap === '-' || cap === '') return '-';
    const capStr = String(cap).trim();
    if (capStr.toLowerCase().includes('kva')) return capStr;
    return `${capStr} KVA`;
};

// Helper to parse date strings for reliable chronological sorting
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

export default function TransformerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [activeTab, setActiveTab] = useState<'alerts' | 'periodic'>('alerts');
    const [searchQuery, setSearchQuery] = useState('');
    const [remarksQuery, setRemarksQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // States for dynamically fetched API data
    const [transformer, setTransformer] = useState<any>(null);
    const [allTransformers, setAllTransformers] = useState<any[]>([]);
    const [allAlerts, setAllAlerts] = useState<any[]>([]);
    const [allPeriodic, setAllPeriodic] = useState<any[]>([]);

    // Date Filters (Default to last 30 days)
    const [fromDate, setFromDate] = useState(getPastDateString(30));
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);

    // Bottom Table Filtering States
    const [alertTab, setAlertTab] = useState<'open' | 'closed'>('open');
    const [alertStatusFilter, setAlertStatusFilter] = useState<'all' | 'open' | 'closed'>('all');
    const [periodicAlertFilter, setPeriodicAlertFilter] = useState<'all' | 'open' | 'closed'>('all');

    // Fetch details on mount or when dates change
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Fetch master list, live telemetry status, and range-filtered alerts/transactions in parallel
                const [masterRes, response, alertsRes, dateFilteredTransactionsRes] = await Promise.all([
                    ApiService.transformers.getAll(),
                    ApiService.transformers.getTransactionsByUser(),
                    ApiService.alerts.getAll(fromDate, toDate),
                    ApiService.transformers.getTransactionsByUser(fromDate, toDate)
                ]);

                let masterTransformers: any[] = [];
                if (masterRes.success && masterRes.data) {
                    masterTransformers = Array.isArray(masterRes.data)
                        ? masterRes.data
                        : (masterRes.data as any).response || (masterRes.data as any).result || [];
                }

                let transactionList: any[] = [];
                if (response.success && response.data) {
                    const rawData = response.data as any;
                    transactionList = Array.isArray(rawData) ? rawData : (rawData.response || rawData.result || []);
                }

                // Map/merge all transactions to get real coordinates and statuses
                const mappedTransformers = transactionList.map((item: any) => {
                    const cleanCode = getCleanTransformerCode(item);
                    
                    let transCapacity = null;
                    const rawTransformer = item.transformer || item.Transformer || '';
                    if (rawTransformer) {
                        const parts = rawTransformer.split('-');
                        if (parts.length > 1) {
                            transCapacity = parts[parts.length - 1];
                        }
                    }

                    const resolvedId = `TR-${cleanCode || 'undefined'}`;

                    const masterMatch = masterTransformers.find(t => {
                        const tCode = getCleanTransformerCode(t);
                        return tCode && cleanCode && tCode === cleanCode;
                    });

                    const substation = item.subGrid || item.subGridName || item.substation || item.Substation || masterMatch?.subStationName || null;
                    const nodeStatus = item.nodeStatus || item.NodeStatus || 'Offline';
                    const masterStatus = item.masterStatus || item.MasterStatus || (item.isOnline || item.IsOnline ? 'Online' : 'Offline');
                    const isNodeOnline = (nodeStatus.toLowerCase() === 'online');
                    const status = isNodeOnline ? 'active' : 'inactive';

                    return {
                        ...item,
                        id: resolvedId,
                        transformerCode: cleanCode || masterMatch?.transformerCode || null,
                        name: cleanCode ? `Transformer ${cleanCode}` : `Transformer ${item.id || 'Unknown'}`,
                        circle: item.circleName || item.CircleName || null,
                        division: item.divisionName || item.DivisionName || null,
                        lat: parseFloat(item.latitude || item.Latitude || masterMatch?.latitude) || null,
                        lng: parseFloat(item.longitude || item.Longitude || masterMatch?.longitude) || null,
                        capacity: transCapacity || item.capacityKVA || item.CapacityKVA || masterMatch?.capacityKVA || item.capacity || item.Capacity || null,
                        status,
                        masterStatus,
                        nodeStatus,
                        lastPing: item.lastRececivedOn || item.LastRececivedOn || item.lastReceivedOn || item.LastReceivedOn || '-',
                        address: item.address || item.Address || (substation !== '-' ? substation : null) || null,
                        make: item.make || masterMatch?.make || null,
                        installedOn: item.installedOn || masterMatch?.installedOn || null,
                        lastMaintenance: item.lastMaintenance || masterMatch?.lastMaintenance || null,
                        circleName: item.circleName || item.CircleName || masterMatch?.circleName || null,
                        divisionName: item.divisionName || item.DivisionName || masterMatch?.divisionName || null,
                        
                        // Contact Info
                        ownerName: item.ownerName || masterMatch?.ownerName || '-',
                        ownerEmail: item.ownerEmail || masterMatch?.ownerEmail || '-',
                        ownerPhoneNo: item.ownerPhoneNo || masterMatch?.ownerPhoneNo || '-',
                        neighborName: item.neighborName || masterMatch?.neighborName || '-',
                        neighborEmail: item.neighborEmail || masterMatch?.neighborEmail || '-',
                        neighborPhoneNo: item.neighborPhoneNo || masterMatch?.neighborPhoneNo || '-'
                    };
                });

                // Extract alerts list
                let alertsList: any[] = [];
                if (alertsRes.success && alertsRes.data) {
                    alertsList = Array.isArray(alertsRes.data)
                        ? alertsRes.data
                        : (alertsRes.data as any).response || (alertsRes.data as any).result || [];
                }

                // Map transformers with alert status rule:
                // "dont show online -> instead show active | inactive |theft (as per the alert)"
                // "if inactive then inactive otherwise active"
                const mappedWithAlerts = mappedTransformers.map((item: any) => {
                    const cleanCode = getCleanTransformerCode(item);
                    const matchingAlerts = alertsList.filter((a: any) => {
                        const aCode = getCleanTransformerCode(a);
                        return cleanCode && aCode === cleanCode;
                    }).sort((a: any, b: any) => 
                        parseTimestamp(b.receivedOn || b.receivedDate || b.lastRececivedOn || b.dateTime) - 
                        parseTimestamp(a.receivedOn || a.receivedDate || a.lastRececivedOn || a.dateTime)
                    );
                    const latestAlert = matchingAlerts[0];
                    let alertType = '';
                    let displayStatus = 'ACTIVE';
                    let effectiveStatus = 'active';
                    let resolvedLastPing = item.lastPing;

                    if (latestAlert) {
                        alertType = (latestAlert.alert || latestAlert.alertType || latestAlert.alertName || '').toUpperCase();
                        if (alertType === 'INACTIVE') {
                            displayStatus = 'INACTIVE';
                            effectiveStatus = 'inactive';
                        } else if (alertType === 'THEFT') {
                            displayStatus = 'THEFT';
                            effectiveStatus = 'active';
                        } else if (alertType === 'ACTIVE') {
                            displayStatus = 'ACTIVE';
                            effectiveStatus = 'active';
                        } else {
                            displayStatus = alertType;
                            effectiveStatus = 'active';
                        }
                        if (latestAlert.receivedOn) {
                            const alertTime = parseTimestamp(latestAlert.receivedOn);
                            const txTime = parseTimestamp(item.lastPing);
                            if (alertTime > txTime) {
                                resolvedLastPing = latestAlert.receivedOn;
                            }
                        }
                    } else {
                        const isOnline = item.status === 'active' || item.nodeStatus === 'Online' || item.isOnline;
                        if (!isOnline) {
                            displayStatus = 'INACTIVE';
                            effectiveStatus = 'inactive';
                        } else {
                            displayStatus = 'ACTIVE';
                            effectiveStatus = 'active';
                        }
                    }
                    return {
                        ...item,
                        status: effectiveStatus,
                        displayStatus,
                        alertType,
                        nodeStatus: displayStatus,
                        lastPing: resolvedLastPing,
                        lastRececivedOn: resolvedLastPing,
                    };
                });

                // Find the matched transformer in this mapped list
                const cleanId = id.startsWith('TR-') ? id.replace('TR-', '') : id;
                let matchedTrans = mappedWithAlerts.find((t: any) => {
                    const cleanCode = getCleanTransformerCode(t);
                    return cleanCode === cleanId;
                });

                // If not found in the transaction list, check the master list or fallback
                if (!matchedTrans && masterTransformers.length > 0) {
                    const mMatch = masterTransformers.find((t: any) => {
                        const tCode = getCleanTransformerCode(t);
                        return tCode === cleanId;
                    });
                    if (mMatch) {
                        const matchingAlerts = alertsList.filter((a: any) => {
                            const aCode = getCleanTransformerCode(a);
                            return cleanId && aCode === cleanId;
                        }).sort((a: any, b: any) => 
                            parseTimestamp(b.receivedOn || b.receivedDate || b.lastRececivedOn || b.dateTime) - 
                            parseTimestamp(a.receivedOn || a.receivedDate || a.lastRececivedOn || a.dateTime)
                        );
                        const latestAlert = matchingAlerts[0];
                        let alertType = '';
                        let displayStatus = 'ACTIVE';
                        let effectiveStatus = 'active';
                        let resolvedLastPing = '-';
                        if (latestAlert) {
                            alertType = (latestAlert.alert || latestAlert.alertType || latestAlert.alertName || '').toUpperCase();
                            if (alertType === 'INACTIVE') {
                                displayStatus = 'INACTIVE';
                                effectiveStatus = 'inactive';
                            } else if (alertType === 'THEFT') {
                                displayStatus = 'THEFT';
                                effectiveStatus = 'active';
                            } else if (alertType === 'ACTIVE') {
                                displayStatus = 'ACTIVE';
                                effectiveStatus = 'active';
                            } else {
                                displayStatus = alertType;
                                effectiveStatus = 'active';
                            }
                            if (latestAlert.receivedOn) {
                                resolvedLastPing = latestAlert.receivedOn;
                            }
                        } else {
                            displayStatus = 'INACTIVE';
                            effectiveStatus = 'inactive';
                        }
                        matchedTrans = {
                            id: id,
                            transformerCode: cleanId,
                            name: mMatch.name || cleanId,
                            subStationId: mMatch.subStationId || null,
                            address: mMatch.address || mMatch.subStationName || null,
                            lat: parseFloat(mMatch.latitude) || null,
                            lng: parseFloat(mMatch.longitude) || null,
                            capacity: mMatch.capacityKVA || null,
                            make: mMatch.make || null,
                            installedOn: mMatch.installedOn || null,
                            lastMaintenance: mMatch.lastMaintenance || null,
                            status: effectiveStatus,
                            displayStatus,
                            alertType,
                            masterStatus: 'Offline',
                            nodeStatus: displayStatus,
                            lastPing: resolvedLastPing,
                            lastRececivedOn: resolvedLastPing,
                            circleName: mMatch.circleName || null,
                            divisionName: mMatch.divisionName || null,
                            ownerName: mMatch.ownerName || '-',
                            ownerEmail: mMatch.ownerEmail || '-',
                            ownerPhoneNo: mMatch.ownerPhoneNo || '-',
                            neighborName: mMatch.neighborName || '-',
                            neighborEmail: mMatch.neighborEmail || '-',
                            neighborPhoneNo: mMatch.neighborPhoneNo || '-'
                        };
                    }
                }

                // Fallback alert determination for cleanId
                const fallbackAlerts = alertsList.filter((a: any) => {
                    const aCode = getCleanTransformerCode(a);
                    return cleanId && aCode === cleanId;
                }).sort((a: any, b: any) => 
                    parseTimestamp(b.receivedOn || b.receivedDate || b.lastRececivedOn || b.dateTime) - 
                    parseTimestamp(a.receivedOn || a.receivedDate || a.lastRececivedOn || a.dateTime)
                );
                const fallbackLatestAlert = fallbackAlerts[0];
                let fallbackAlertType = '';
                let fallbackDisplayStatus = 'ACTIVE';
                let fallbackStatus = 'active';
                let fallbackPing = '-';
                if (fallbackLatestAlert) {
                    fallbackAlertType = (fallbackLatestAlert.alert || fallbackLatestAlert.alertType || fallbackLatestAlert.alertName || '').toUpperCase();
                    if (fallbackAlertType === 'INACTIVE') {
                        fallbackDisplayStatus = 'INACTIVE';
                        fallbackStatus = 'inactive';
                    } else if (fallbackAlertType === 'THEFT') {
                        fallbackDisplayStatus = 'THEFT';
                        fallbackStatus = 'active';
                    } else if (fallbackAlertType === 'ACTIVE') {
                        fallbackDisplayStatus = 'ACTIVE';
                        fallbackStatus = 'active';
                    } else {
                        fallbackDisplayStatus = fallbackAlertType;
                        fallbackStatus = 'active';
                    }
                    if (fallbackLatestAlert.receivedOn) {
                        fallbackPing = fallbackLatestAlert.receivedOn;
                    }
                } else {
                    fallbackDisplayStatus = 'INACTIVE';
                    fallbackStatus = 'inactive';
                }

                let ssAddress = null;
                let ssLat = null;
                let ssLng = null;

                if (matchedTrans) {
                    // Fetch Substation details if ssId/subStationId exists
                    const ssIdToFetch = matchedTrans.ssId || matchedTrans.subStationId || null;
                    if (ssIdToFetch) {
                        try {
                            const ssRes = await ApiService.locations.substation.getById(ssIdToFetch);
                            if (ssRes.success && ssRes.data) {
                                const sData = ssRes.data as any;
                                const substationInfo = sData.response || sData.result || null;
                                if (substationInfo) {
                                    ssAddress = substationInfo.ssAddress || null;
                                    if (substationInfo.ssLatitude && substationInfo.ssLatitude !== '-') {
                                        const latVal = parseFloat(substationInfo.ssLatitude);
                                        if (!isNaN(latVal)) ssLat = latVal;
                                    }
                                    if (substationInfo.ssLongitude && substationInfo.ssLongitude !== '-') {
                                        const lngVal = parseFloat(substationInfo.ssLongitude);
                                        if (!isNaN(lngVal)) ssLng = lngVal;
                                    }
                                }
                            }
                        } catch (err) {
                            console.error("Failed to fetch substation info for ssId", ssIdToFetch, err);
                        }
                    }

                    setTransformer({
                        ...matchedTrans,
                        address: ssAddress || matchedTrans.address || null,
                        lat: ssLat !== null ? ssLat : matchedTrans.lat,
                        lng: ssLng !== null ? ssLng : matchedTrans.lng,
                    });
                } else {
                    // Fallback to parse ID
                    setTransformer({
                        id: id,
                        transformerCode: cleanId,
                        name: cleanId,
                        address: null,
                        lat: null,
                        lng: null,
                        capacity: null,
                        make: null,
                        installedOn: null,
                        lastMaintenance: null,
                        status: fallbackStatus,
                        displayStatus: fallbackDisplayStatus,
                        alertType: fallbackAlertType,
                        masterStatus: 'Offline',
                        nodeStatus: fallbackDisplayStatus,
                        lastPing: fallbackPing,
                        lastRececivedOn: fallbackPing,
                        circleName: null,
                        divisionName: null,
                        ownerName: '-',
                        ownerEmail: '-',
                        ownerPhoneNo: '-',
                        neighborName: '-',
                        neighborEmail: '-',
                        neighborPhoneNo: '-'
                    });
                }

                // Ensure the matched/current transformer is part of the allTransformers list
                let listToSet = [...mappedWithAlerts];
                const currentTransformerObj = matchedTrans ? {
                    ...matchedTrans,
                    address: ssAddress || matchedTrans.address || null,
                    lat: ssLat !== null ? ssLat : matchedTrans.lat,
                    lng: ssLng !== null ? ssLng : matchedTrans.lng,
                } : {
                    id: id,
                    transformerCode: cleanId,
                    name: cleanId,
                    lat: null,
                    lng: null,
                    status: fallbackStatus,
                    displayStatus: fallbackDisplayStatus,
                    alertType: fallbackAlertType,
                    masterStatus: 'Offline',
                    nodeStatus: fallbackDisplayStatus,
                    lastPing: fallbackPing,
                    lastRececivedOn: fallbackPing,
                };

                const currentCleanCode = getCleanTransformerCode(currentTransformerObj);
                const existingIndex = listToSet.findIndex(t => getCleanTransformerCode(t) === currentCleanCode);
                if (existingIndex > -1) {
                    listToSet[existingIndex] = {
                        ...listToSet[existingIndex],
                        ...currentTransformerObj
                    };
                } else {
                    listToSet.push(currentTransformerObj);
                }
                setAllTransformers(listToSet);

                // Match alerts for this transformer
                const filteredAlerts = alertsList.filter((a: any) => {
                    const aCode = getCleanTransformerCode(a);
                    return aCode === cleanId;
                });
                filteredAlerts.sort((a: any, b: any) => 
                    parseTimestamp(b.receivedOn || b.receivedDate || b.lastRececivedOn || b.dateTime) - 
                    parseTimestamp(a.receivedOn || a.receivedDate || a.lastRececivedOn || a.dateTime)
                );
                setAllAlerts(filteredAlerts);

                // Match periodic data for this transformer
                if (dateFilteredTransactionsRes.success && dateFilteredTransactionsRes.data) {
                    const list = Array.isArray(dateFilteredTransactionsRes.data)
                        ? dateFilteredTransactionsRes.data
                        : (dateFilteredTransactionsRes.data as any).response || (dateFilteredTransactionsRes.data as any).result || [];

                    const filteredPeriodic = list.filter((p: any) => {
                        const pCode = getCleanTransformerCode(p);
                        return pCode === cleanId;
                    });
                    filteredPeriodic.sort((a: any, b: any) => 
                        parseTimestamp(b.lastRececivedOn || b.lastPing || b.dateTime || b.receivedOn) - 
                        parseTimestamp(a.lastRececivedOn || a.lastPing || a.dateTime || a.receivedOn)
                    );
                    setAllPeriodic(filteredPeriodic);
                } else {
                    setAllPeriodic([]);
                }

            } catch (error) {
                console.error("Failed to load transformer detail data", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [id, fromDate, toDate]);

    // Unified columns list for detail page tables (WITHOUT Transformer Code)
    const COLUMNS = useMemo<ColumnDef<any>[]>(() => [
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
            accessorKey: 'alert',
            header: 'Alert',
            size: 120,
            meta: {
                style: { 
                    position: 'sticky', 
                    left: 60, 
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
                            <div className="min-w-[320px] text-xs bg-slate-950/95 backdrop-blur-md text-slate-100 rounded-xl shadow-2xl border border-slate-800 p-4 font-sans leading-relaxed pointer-events-none text-left">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="font-bold text-sm tracking-tight text-white font-sans">Contact Directory</span>
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
            cell: ({ row }) => <span className="font-mono text-xs">{formatDate(row.original.receivedOn)}</span>,
            sortingFn: (rowA, rowB) => parseTimestamp(rowA.original.receivedOn) - parseTimestamp(rowB.original.receivedOn)
        },
        {
            accessorKey: 'notifiedOn',
            header: 'Notified On',
            cell: ({ row }) => <span className="font-mono text-xs">{formatDate(row.original.notifiedOn)}</span>,
            sortingFn: (rowA, rowB) => parseTimestamp(rowA.original.notifiedOn) - parseTimestamp(rowB.original.notifiedOn)
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
            cell: ({ row }) => <span className="font-mono text-xs">{formatDate(row.original.closedOn)}</span>,
            sortingFn: (rowA, rowB) => parseTimestamp(rowA.original.closedOn) - parseTimestamp(rowB.original.closedOn)
        }
    ], []);

    // Memoized Alert statistics (Total, Open, Closed)
    const alertStats = useMemo(() => {
        const total = allAlerts.length;
        const open = allAlerts.filter(a => (a.alerStatus || a.status || '').toLowerCase() === 'open').length;
        const closed = total - open;
        return { total, open, closed };
    }, [allAlerts]);

    // Memoized Filter Logic
    const displayedData = useMemo(() => {
        const query = searchQuery.toLowerCase();
        const subQuery = remarksQuery.toLowerCase();

        if (activeTab === 'alerts') {
            const mapped = allAlerts.map((a, index) => ({
                id: a.id || `alt-${index}`,
                alert: a.alert || '-',
                ownerName: a.ownerName || transformer?.ownerName || '-',
                ownerEmail: a.ownerEmail || transformer?.ownerEmail || '-',
                ownerPhoneNo: a.ownerPhoneNo || transformer?.ownerPhoneNo || '-',
                neighborName: a.neighborName || transformer?.neighborName || '-',
                neighborEmail: a.neighborEmail || transformer?.neighborEmail || '-',
                neighborPhoneNo: a.neighborPhoneNo || transformer?.neighborPhoneNo || '-',
                severity: a.severity || '-',
                receivedOn: a.receivedOn || '-',
                notifiedOn: a.notifiedOn || '-',
                status: a.alerStatus || a.status || 'Open',
                updatedBy: a.updatedBy || '-',
                closedOn: a.closedOn || '-'
            }));

            const filtered = mapped.filter(item => {
                // Apply Open/Closed status filtering
                const statusLower = item.status.toLowerCase();
                if (alertStatusFilter === 'all') {
                    if (alertTab === 'open' && statusLower !== 'open') return false;
                    if (alertTab === 'closed' && statusLower === 'open') return false;
                } else if (alertStatusFilter === 'open') {
                    if (statusLower !== 'open') return false;
                } else if (alertStatusFilter === 'closed') {
                    if (statusLower === 'open') return false;
                }

                const matchesSearch = !query || 
                    item.alert.toLowerCase().includes(query) ||
                    item.ownerName.toLowerCase().includes(query);
                
                const matchesRemarks = !subQuery ||
                    item.alert.toLowerCase().includes(subQuery) ||
                    item.severity.toLowerCase().includes(subQuery);

                return matchesSearch && matchesRemarks;
            });

            // Sort descending: latest received first
            filtered.sort((a, b) => parseTimestamp(b.receivedOn) - parseTimestamp(a.receivedOn));

            return filtered.map((item, idx) => ({
                ...item,
                slno: idx + 1
            }));
        } else {
            const mapped = allPeriodic.map((p, index) => {
                const hasOpenAlert = allAlerts.some(a => {
                    const aStatus = (a.alerStatus || a.status || '').toLowerCase();
                    return aStatus === 'open' || aStatus === 'active';
                });
                const isOffline = p.masterStatus?.toLowerCase() === 'offline' || p.status?.toLowerCase() === 'offline' || p.nodeStatus?.toLowerCase() === 'offline';
                const hasTheft = p.alert === 'THEFT';
                return {
                    id: p.id || `per-${index}`,
                    alert: hasOpenAlert ? (hasTheft ? 'THEFT' : (isOffline ? 'OFFLINE' : '-')) : '-',
                    ownerName: p.ownerName || transformer?.ownerName || '-',
                    ownerEmail: p.ownerEmail || transformer?.ownerEmail || '-',
                    ownerPhoneNo: p.ownerPhoneNo || transformer?.ownerPhoneNo || '-',
                    neighborName: p.neighborName || transformer?.neighborName || '-',
                    neighborEmail: p.neighborEmail || transformer?.neighborEmail || '-',
                    neighborPhoneNo: p.neighborPhoneNo || transformer?.neighborPhoneNo || '-',
                    severity: hasOpenAlert ? 'CRITICAL' : '-',
                    receivedOn: p.lastRececivedOn || p.lastPing || p.dateTime || '-',
                    notifiedOn: '-',
                    status: hasOpenAlert ? 'Open' : 'Closed',
                    updatedBy: '-',
                    closedOn: '-'
                };
            });

            const filtered = mapped.filter(item => {
                 const isCriticalOrOffline = item.severity === 'CRITICAL' || item.status?.toLowerCase() === 'offline' || item.status?.toLowerCase() === 'inactive' || item.status?.toLowerCase() === 'open';
                 if (periodicAlertFilter === 'open' && !isCriticalOrOffline) return false;
                 if (periodicAlertFilter === 'closed' && isCriticalOrOffline) return false;

                const matchesSearch = !query || 
                    item.alert.toLowerCase().includes(query) ||
                    item.ownerName.toLowerCase().includes(query);

                const matchesTelemetry = !subQuery ||
                    item.alert.toLowerCase().includes(subQuery) ||
                    item.severity.toLowerCase().includes(subQuery) ||
                    item.status.toLowerCase().includes(subQuery);

                return matchesSearch && matchesTelemetry;
            });

            // Sort descending: latest received first
            filtered.sort((a, b) => parseTimestamp(b.receivedOn) - parseTimestamp(a.receivedOn));

            return filtered.map((item, idx) => ({
                ...item,
                slno: idx + 1
            }));
        }
    }, [allAlerts, allPeriodic, activeTab, searchQuery, remarksQuery, transformer, alertTab, alertStatusFilter, periodicAlertFilter]);

    // Lazy load XLSX on user click and trigger download
    const handleExport = () => {
        import('xlsx').then((XLSX) => {
            const ws = XLSX.utils.json_to_sheet(displayedData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, activeTab === 'alerts' ? "Alerts" : "Periodic");
            XLSX.writeFile(wb, `${id}_${activeTab}_data.xlsx`);
        });
    };
    const cleanId = id.startsWith('TR-') ? id.replace('TR-', '') : id;

    const mapMarkers = useMemo(() => {
        const formatVoltage = (val: any) => {
            if (val === undefined || val === null || val === '-') return '-';
            const num = parseFloat(val);
            return isNaN(num) ? '-' : `${num.toFixed(2)} V`;
        };

        if (!allTransformers || allTransformers.length === 0) {
            if (transformer?.lat && transformer?.lng) {
                return [{
                    id: transformer.id || id,
                    lat: transformer.lat,
                    lng: transformer.lng,
                    title: `${transformer.name || id} (Transformer Location)`,
                    status: transformer.status === 'active' ? 'active' : 'inactive',
                    description: (
                        <div className="min-w-[280px] text-[11px] p-2 space-y-2 text-slate-700 bg-white">
                            {/* Header */}
                            <div className="font-bold border-b pb-1.5 text-slate-800 flex justify-between items-center">
                                <span>{transformer.name || id}</span>
                                <span className={clsx(
                                    "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                                    (transformer.displayStatus === 'INACTIVE' || transformer.status === 'inactive') && "bg-red-100 text-red-700 border-red-200",
                                    transformer.displayStatus === 'THEFT' && "bg-rose-100 text-rose-700 border-rose-300 font-extrabold animate-pulse",
                                    transformer.displayStatus === 'ACTIVE' && "bg-emerald-100 text-emerald-700 border-emerald-200",
                                    !['INACTIVE', 'THEFT', 'ACTIVE'].includes(transformer.displayStatus || '') && (transformer.status === 'active' ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200")
                                )}>
                                    {transformer.displayStatus || (transformer.status === 'active' ? 'ACTIVE' : 'INACTIVE')}
                                </span>
                            </div>

                            {/* Location Info */}
                            <div className="space-y-0.5 text-slate-600 bg-slate-50/70 p-1.5 rounded-lg border border-slate-100">
                                <div className="flex justify-between"><span className="text-slate-400 font-medium">Sub Div:</span> <span className="font-semibold text-slate-800">{transformer.subDivision || '-'}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400 font-medium">Substation:</span> <span className="font-semibold text-slate-800">{transformer.subGrid || transformer.substation || '-'}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400 font-medium">Feeder:</span> <span className="font-semibold text-slate-800">{transformer.feeder || '-'}</span></div>
                            </div>

                            {/* Hardware Status */}
                            <div className="grid grid-cols-2 gap-2 text-slate-600">
                                <div className="bg-blue-50/40 p-1.5 rounded-lg border border-blue-100/30">
                                    <span className="block text-[9px] font-bold text-blue-700 uppercase tracking-wide mb-1">Master Device</span>
                                    <div className="font-semibold text-slate-800 truncate text-[10px]" title={transformer.masterDevice}>{transformer.masterDevice || '-'}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">Comm: {transformer.masterCommunicationId || '-'}</div>
                                </div>
                                <div className="bg-indigo-50/40 p-1.5 rounded-lg border border-indigo-100/30">
                                    <span className="block text-[9px] font-bold text-indigo-700 uppercase tracking-wide mb-1 flex items-center justify-between">
                                        Node Device 
                                        <span className={clsx(
                                            "w-1.5 h-1.5 rounded-full inline-block",
                                            (transformer.displayStatus === 'INACTIVE' || transformer.status === 'inactive') ? "bg-red-500" : (transformer.displayStatus === 'THEFT' ? "bg-rose-500 animate-pulse" : "bg-emerald-500")
                                        )} />
                                    </span>
                                    <div className="font-semibold text-slate-800 truncate text-[10px]" title={transformer.nodeDevice}>{transformer.nodeDevice || '-'}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">Comm: {transformer.nodeCommunicationId || '-'}</div>
                                </div>
                            </div>

                            {/* Telemetry Data */}
                            <div className="grid grid-cols-3 gap-1 text-center bg-slate-50/70 p-1 rounded-lg border border-slate-100 font-mono text-[10px]">
                                <div>
                                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tight">Solar</span>
                                    <span className="font-bold text-slate-700">{formatVoltage(transformer.solarVoltage)}</span>
                                </div>
                                <div>
                                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tight">Battery</span>
                                    <span className="font-bold text-slate-700">{formatVoltage(transformer.batteryVoltage)}</span>
                                </div>
                                <div>
                                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tight">Device</span>
                                    <span className="font-bold text-slate-700">{formatVoltage(transformer.deviceVoltage)}</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="text-[9px] text-slate-400 space-y-0.5 border-t pt-1.5">
                                <div className="flex justify-between"><span>Coords:</span> <span className="font-mono">{transformer.lat ? transformer.lat.toFixed(4) : '-'}, {transformer.lng ? transformer.lng.toFixed(4) : '-'}</span></div>
                                <div className="flex justify-between"><span>Received On:</span> <span className="font-mono text-blue-600 font-bold">{transformer.lastPing && transformer.lastPing !== '-' ? formatDate(transformer.lastPing) : (transformer.lastRececivedOn && transformer.lastRececivedOn !== '-' ? formatDate(transformer.lastRececivedOn) : '-')}</span></div>
                            </div>
                        </div>
                    )
                }];
            }
            return [];
        }

        return allTransformers
            .filter(t => t.lat !== null && t.lng !== null && !isNaN(t.lat) && !isNaN(t.lng))
            .map(t => {
                const isCurrent = getCleanTransformerCode(t) === cleanId;
                return {
                    id: t.id,
                    lat: t.lat,
                    lng: t.lng,
                    title: isCurrent ? `${t.name} (Transformer Location)` : t.name,
                    status: t.status === 'active' ? (isCurrent ? 'active' : 'other') : 'inactive',
                    description: (
                        <div className="min-w-[280px] text-[11px] p-2 space-y-2 text-slate-700 bg-white">
                            {/* Header */}
                            <div className="font-bold border-b pb-1.5 text-slate-800 flex justify-between items-center">
                                <span>{t.name} {isCurrent && <span className="text-[9px] text-emerald-600 font-normal font-sans">(Selected)</span>}</span>
                                <span className={clsx(
                                    "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border",
                                    (t.displayStatus === 'INACTIVE' || t.status === 'inactive') && "bg-red-100 text-red-700 border-red-200",
                                    t.displayStatus === 'THEFT' && "bg-rose-100 text-rose-700 border-rose-300 font-extrabold animate-pulse",
                                    t.displayStatus === 'ACTIVE' && "bg-emerald-100 text-emerald-700 border-emerald-200",
                                    !['INACTIVE', 'THEFT', 'ACTIVE'].includes(t.displayStatus || '') && (t.status === 'active' ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200")
                                )}>
                                    {t.displayStatus || (t.status === 'active' ? 'ACTIVE' : 'INACTIVE')}
                                </span>
                            </div>

                            {/* Location Info */}
                            <div className="space-y-0.5 text-slate-600 bg-slate-50/70 p-1.5 rounded-lg border border-slate-100">
                                <div className="flex justify-between"><span className="text-slate-400 font-medium">Sub Div:</span> <span className="font-semibold text-slate-800">{t.subDivision || '-'}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400 font-medium">Substation:</span> <span className="font-semibold text-slate-800">{t.subGrid || t.substation || '-'}</span></div>
                                <div className="flex justify-between"><span className="text-slate-400 font-medium">Feeder:</span> <span className="font-semibold text-slate-800">{t.feeder || '-'}</span></div>
                            </div>

                            {/* Hardware Status */}
                            <div className="grid grid-cols-2 gap-2 text-slate-600">
                                <div className="bg-blue-50/40 p-1.5 rounded-lg border border-blue-100/30">
                                    <span className="block text-[9px] font-bold text-blue-700 uppercase tracking-wide mb-1">Master Device</span>
                                    <div className="font-semibold text-slate-800 truncate text-[10px]" title={t.masterDevice}>{t.masterDevice || '-'}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">Comm: {t.masterCommunicationId || '-'}</div>
                                </div>
                                <div className="bg-indigo-50/40 p-1.5 rounded-lg border border-indigo-100/30">
                                    <span className="block text-[9px] font-bold text-indigo-700 uppercase tracking-wide mb-1 flex items-center justify-between">
                                        Node Device 
                                        <span className={clsx(
                                            "w-1.5 h-1.5 rounded-full inline-block",
                                            (t.displayStatus === 'INACTIVE' || t.status === 'inactive') ? "bg-red-500" : (t.displayStatus === 'THEFT' ? "bg-rose-500 animate-pulse" : "bg-emerald-500")
                                        )} />
                                    </span>
                                    <div className="font-semibold text-slate-800 truncate text-[10px]" title={t.nodeDevice}>{t.nodeDevice || '-'}</div>
                                    <div className="text-[10px] text-slate-500 font-mono">Comm: {t.nodeCommunicationId || '-'}</div>
                                </div>
                            </div>

                            {/* Telemetry Data */}
                            <div className="grid grid-cols-3 gap-1 text-center bg-slate-50/70 p-1 rounded-lg border border-slate-100 font-mono text-[10px]">
                                <div>
                                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tight">Solar</span>
                                    <span className="font-bold text-slate-700">{formatVoltage(t.solarVoltage)}</span>
                                </div>
                                <div>
                                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tight">Battery</span>
                                    <span className="font-bold text-slate-700">{formatVoltage(t.batteryVoltage)}</span>
                                </div>
                                <div>
                                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tight">Device</span>
                                    <span className="font-bold text-slate-700">{formatVoltage(t.deviceVoltage)}</span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="text-[9px] text-slate-400 space-y-0.5 border-t pt-1.5">
                                <div className="flex justify-between"><span>Coords:</span> <span className="font-mono">{t.lat ? t.lat.toFixed(4) : '-'}, {t.lng ? t.lng.toFixed(4) : '-'}</span></div>
                                <div className="flex justify-between"><span>Received On:</span> <span className="font-mono text-blue-600 font-bold">{t.lastPing && t.lastPing !== '-' ? formatDate(t.lastPing) : (t.lastRececivedOn && t.lastRececivedOn !== '-' ? formatDate(t.lastRececivedOn) : '-')}</span></div>
                            </div>
                        </div>
                    )
                };
            });
    }, [allTransformers, transformer, id, cleanId]);

    return (
        <div className="space-y-6 animate-fade-in relative pb-10">
            {/* Header / Nav */}
            <div className="flex items-center gap-4 border-b border-[hsl(var(--border))] pb-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                    <ArrowLeft size={20} className="mr-2" /> Back
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                        {id.replace('TR-', 'Transformer ')} Details
                        <span className="text-sm font-normal text-[hsl(var(--muted-foreground))] bg-slate-100 px-2 py-0.5 rounded-md border">
                            {(transformer?.circleName || transformer?.divisionName) ? `${transformer.circleName || '-'} / ${transformer.divisionName || '-'}` : '-'}
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
                            <Info size={20} /> Transformer Information
                        </h3>
 
                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                            <div>
                                <span className="block text-[hsl(var(--muted-foreground))] text-xs uppercase font-medium mb-1">Location / Address</span>
                                <div className="flex items-start gap-2">
                                    <MapPin size={16} className="mt-0.5 text-red-500 shrink-0" />
                                    <span className="font-semibold text-slate-700 text-left">{transformer?.address || '-'}</span>
                                </div>
                            </div>
 
                            <div>
                                <span className="block text-[hsl(var(--muted-foreground))] text-xs uppercase font-medium mb-1">Coordinates</span>
                                <span className="font-mono bg-slate-50 px-2 py-1 rounded text-xs border font-semibold text-slate-700">
                                    {(transformer?.lat !== null && transformer?.lat !== undefined && transformer?.lng !== null && transformer?.lng !== undefined) ? `${transformer.lat}, ${transformer.lng}` : '-'}
                                </span>
                            </div>
 
                            <div>
                                <span className="block text-[hsl(var(--muted-foreground))] text-xs uppercase font-medium mb-1">Capacity</span>
                                <span className="font-semibold text-slate-700">{formatCapacity(transformer?.capacity)}</span>
                            </div>
 
                            <div>
                                <span className="block text-[hsl(var(--muted-foreground))] text-xs uppercase font-medium mb-1">Make / Model</span>
                                <span className="font-semibold text-slate-700">{transformer?.make || '-'}</span>
                            </div>
 
                            <div>
                                <span className="block text-[hsl(var(--muted-foreground))] text-xs uppercase font-medium mb-1">Install Date</span>
                                <span className="font-semibold text-slate-700">{transformer?.installedOn ? formatDate(transformer.installedOn) : '-'}</span>
                            </div>
 
                            <div>
                                <span className="block text-[hsl(var(--muted-foreground))] text-xs uppercase font-medium mb-1">Last Maintenance</span>
                                <span className="font-semibold text-slate-700">{transformer?.lastMaintenance ? formatDate(transformer.lastMaintenance) : '-'}</span>
                            </div>
                        </div>
                    </div>
 
                    {/* Current Status Widget */}
                    <div className="bg-white p-6 rounded-xl border border-[hsl(var(--border))] shadow-sm flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-sm text-[hsl(var(--muted-foreground))] uppercase">Current Live Status</h3>
                            <p className={clsx(
                                "text-2xl font-bold mt-1 flex items-center gap-2",
                                (transformer?.displayStatus === 'INACTIVE' || transformer?.status === 'inactive') ? "text-red-500" :
                                    (transformer?.displayStatus === 'THEFT') ? "text-rose-600 animate-pulse" : "text-emerald-600"
                            )}>
                                {(transformer?.displayStatus === 'INACTIVE' || transformer?.status === 'inactive') ? (
                                    <>
                                        <PowerOff size={24} /> Inactive
                                    </>
                                ) : transformer?.displayStatus === 'THEFT' ? (
                                    <>
                                        <AlertTriangle size={24} className="animate-pulse" /> Theft Alert
                                    </>
                                ) : (
                                    <>
                                        <Activity size={24} /> Active / Healthy
                                    </>
                                )}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs text-[hsl(var(--muted-foreground))]">Last Ping</span>
                            <p className="font-mono text-sm text-slate-600 font-semibold">{transformer?.lastPing && transformer.lastPing !== '-' ? formatDate(transformer.lastPing) : 'Just now'}</p>
                        </div>
                    </div>
                </div>
 
                {/* Right: Map View */}
                <div className="h-[400px] lg:h-auto min-h-[300px] bg-slate-100 rounded-xl border border-[hsl(var(--border))] relative overflow-hidden">
                    <MapView
                        center={transformer?.lat !== null && transformer?.lng !== null ? [transformer?.lat || 11.13, transformer?.lng || 77.34] : [11.13, 77.34]}
                        zoom={14}
                        markers={mapMarkers}
                        onMarkerClick={(markerId) => router.push(`/dashboard/lc-management/${markerId}`)}
                        className="h-full w-full"
                    />
                </div>
            </div>
 
            {/* Bottom Section: Tabbed Data Table & Double-Row Toolbar */}
            <div className="bg-white rounded-xl border border-[hsl(var(--border))] shadow-sm overflow-hidden mt-8 flex flex-col gap-3 p-4">
                
                {/* Toolbar Row 1 */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Tab Toggle Switch */}
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
                                            layoutId="activeTabPillDetails"
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

                    {/* Date Range Picker (Right Aligned) */}
                    <div className="flex items-center gap-2 bg-slate-50 px-3 h-9 rounded-lg border border-slate-200 shadow-sm text-xs font-semibold text-slate-600">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar size={12} /> Range:
                        </span>
                        <input
                            type="date"
                            className="h-6 rounded border border-gray-300 px-2 text-[10px] bg-white w-28 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-700"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                        <span className="text-gray-400">-</span>
                        <input
                            type="date"
                            className="h-6 rounded border border-gray-300 px-2 text-[10px] bg-white w-28 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-700"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                </div>

                {/* Toolbar Row 2 */}
                <div className="flex flex-wrap items-center justify-between gap-4 py-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Search Remarks/Telemetry Input */}
                        <div className="relative w-64 h-9">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                placeholder={activeTab === 'alerts' ? "Search remarks..." : "Search telemetry..."}
                                className="pl-9 pr-4 h-full w-full rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-700"
                                value={remarksQuery}
                                onChange={(e) => setRemarksQuery(e.target.value)}
                            />
                        </div>

                        {/* General Search Input */}
                        <div className="relative w-64 h-9">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                placeholder="Search..."
                                className="pl-9 pr-4 h-full w-full rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-700"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

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
                            </>
                        )}
                    </div>

                    {/* Export Excel Button */}
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleExport}
                        className="h-9 text-xs border border-slate-200 shadow-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-all text-slate-700 bg-white"
                    >
                        <Download size={14} className="text-slate-500" />
                        Export Excel
                    </Button>
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
                <div className="p-0">
                    <DataTable
                        columns={COLUMNS}
                        data={displayedData}
                        hideToolbar={true}
                        isLoading={isLoading}
                        getRowClassName={(row) => {
                            const sev = row.original.severity as string;
                            const alert = row.original.alert as string;
                            const status = row.original.status as string;
                            if (activeTab === 'alerts') {
                                if (sev === 'CRITICAL' || alert === 'THEFT') {
                                    return 'critical-row';
                                }
                            } else {
                                if (sev === 'CRITICAL' || status === 'Offline' || status === 'inactive' || status?.toLowerCase() === 'open') {
                                    return 'critical-row';
                                }
                            }
                            return '';
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
