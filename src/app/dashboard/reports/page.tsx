'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileBarChart, Calendar, ShieldAlert, Download, Activity, HelpCircle, FileSpreadsheet, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { DataTable } from '@/components/DataTable/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { ApiService } from '@/services/api';
import { formatDate } from '@/lib/date-utils';
import { clsx } from 'clsx';

// Helper to get start date of current month
const getStartOfCurrentMonthString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
};

// Helper to get today's date in local YYYY-MM-DD
const getTodayDateString = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
};

// Helper to calculate time duration cleanly
const calculateTimeTaken = (startStr: string, endStr: string) => {
    if (!startStr || !endStr || startStr === '-' || endStr === '-') return '-';
    try {
        const start = new Date(startStr);
        const end = new Date(endStr);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return '-';
        const diffMs = end.getTime() - start.getTime();
        if (diffMs < 0) return '-';
        
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const days = Math.floor(diffMins / (24 * 60));
        const hours = Math.floor((diffMins % (24 * 60)) / 60);
        const mins = diffMins % 60;
        
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (mins > 0 || parts.length === 0) parts.push(`${mins}m`);
        return parts.join(' ');
    } catch {
        return '-';
    }
};

export default function ReportsPage() {
    const [reportType, setReportType] = useState<'alerts' | 'voltage'>('alerts');
    const [selectedTransformer, setSelectedTransformer] = useState<string>('all');
    const [fromDate, setFromDate] = useState<string>(getStartOfCurrentMonthString());
    const [toDate, setToDate] = useState<string>(getTodayDateString());
    
    const [isLoading, setIsLoading] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);
    
    // Master data
    const [transformers, setTransformers] = useState<any[]>([]);
    const [reportData, setReportData] = useState<any[]>([]);

    // Fetch master list of transformers
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

    // Memoize options for Transformer searchable select
    const transOptions = useMemo(() => {
        const list = [
            { label: 'All Transformers', value: 'all' }
        ];
        transformers.forEach(t => {
            const code = t.transformerCode || String(t.id);
            const labelName = t.name ? `${t.name} (${code})` : `Transformer ${code}`;
            if (!list.some(item => item.value === code)) {
                list.push({ label: labelName, value: code });
            }
        });
        return list;
    }, [transformers]);

    // Handle Generation Action
    const handleGenerateReport = async () => {
        setIsLoading(true);
        setHasGenerated(true);
        try {
            if (reportType === 'alerts') {
                const res = await ApiService.alerts.getAll(fromDate, toDate);
                if (res.success && res.data) {
                    const list = Array.isArray(res.data) ? res.data : (res.data as any).response || (res.data as any).result || [];
                    setReportData(list);
                } else {
                    setReportData([]);
                }
            } else {
                const res = await ApiService.transformers.getTransactionsByUser(fromDate, toDate);
                if (res.success && res.data) {
                    const list = Array.isArray(res.data) ? res.data : (res.data as any).response || (res.data as any).result || [];
                    setReportData(list);
                } else {
                    setReportData([]);
                }
            }
        } catch (e) {
            console.error('Error generating report data:', e);
            setReportData([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Memoized Mapped Display Records for Alerts Report
    const displayedAlerts = useMemo(() => {
        if (reportType !== 'alerts') return [];
        return reportData.map(d => {
            const code = d.transformerCode || d.transformerId || d.id;
            const match = transformers.find(t => t.transformerCode === code || t.id === code || (code && code.includes(t.transformerCode || '---')));
            
            // Filter by selected transformer
            if (selectedTransformer !== 'all' && selectedTransformer !== code) {
                return null;
            }

            const recDate = d.receivedOn || '-';
            const closedDate = d.closedOn || d.updatedOn || '-';
            const timeTaken = calculateTimeTaken(recDate, closedDate);

            const rawStatus = d.alerStatus || d.status || 'Open';
            const isOpen = rawStatus.toLowerCase() === 'open' || rawStatus.toLowerCase() === 'active';

            return {
                id: d.id || code,
                transformerCode: code || '-',
                transformerName: d.transformerName || d.name || match?.name || `Transformer ${code || 'Unknown'}`,
                alert: d.alert || '-',
                ownerName: d.ownerName || match?.ownerName || '-',
                severity: d.severity || '-',
                receivedOn: recDate,
                notifiedOn: d.notifiedOn || '-',
                currentStatus: isOpen ? 'Open' : 'Closed',
                updatedBy: d.updatedBy || '-',
                updatedOn: closedDate,
                timeTaken: timeTaken
            };
        }).filter(Boolean);
    }, [reportData, transformers, selectedTransformer, reportType]);

    // Memoized Mapped Display Records for Voltage Report
    const displayedVoltage = useMemo(() => {
        if (reportType !== 'voltage') return [];
        return reportData.map(d => {
            const code = d.transformerCode || d.transformer || d.name || '';
            const match = transformers.find(t => {
                const tCode = t.transformerCode || t.name || '';
                return tCode && code && (code.includes(tCode) || tCode.includes(code));
            });

            // Filter by selected transformer
            const resolvedCode = match?.transformerCode || code;
            if (selectedTransformer !== 'all' && selectedTransformer !== resolvedCode) {
                return null;
            }

            const formatV = (val: any) => {
                if (val === undefined || val === null || val === '-') return '-';
                const num = parseFloat(val);
                return isNaN(num) ? '-' : `${num.toFixed(2)} V`;
            };

            return {
                id: d.id || code,
                transformerName: d.transformerName || d.name || match?.name || `Transformer ${code || 'Unknown'}`,
                receivedDateTime: d.lastRececivedOn || d.lastPing || d.dateTime || '-',
                deviceVoltage: formatV(d.deviceVoltage),
                solarVoltage: formatV(d.solarVoltage),
                batteryVoltage: formatV(d.batteryVoltage)
            };
        }).filter(Boolean);
    }, [reportData, transformers, selectedTransformer, reportType]);

    // Alerts Report Column Definitions
    const alertColumns = useMemo<ColumnDef<any>[]>(() => [
        {
            id: 'slno',
            header: 'SI No',
            cell: ({ row }) => <span className="text-xs font-semibold text-slate-600">{row.index + 1}</span>,
            size: 60
        },
        {
            accessorKey: 'transformerName',
            header: 'Transformer Name',
            cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.transformerName || '-'}</span>
        },
        {
            accessorKey: 'alert',
            header: 'Alert',
            cell: ({ row }) => {
                const alert = row.original.alert;
                if (!alert || alert === '-') return <span className="text-slate-400">-</span>;
                const isTheft = alert.toLowerCase() === 'theft';
                return (
                    <span className={clsx(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                        isTheft ? "bg-red-100 text-red-700 border-red-200 animate-pulse" : "bg-slate-100 text-slate-700 border-slate-200"
                    )}>
                        {alert}
                    </span>
                );
            }
        },
        {
            accessorKey: 'ownerName',
            header: 'Owner Name',
            cell: ({ row }) => <span>{row.original.ownerName || '-'}</span>
        },
        {
            accessorKey: 'severity',
            header: 'Severity',
            cell: ({ row }) => {
                const sev = row.original.severity;
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
            accessorKey: 'currentStatus',
            header: 'Current Status',
            cell: ({ row }) => {
                const status = row.original.currentStatus;
                if (!status || status === '-') return <span className="text-slate-400">-</span>;
                const isOpen = status.toLowerCase() === 'open' || status.toLowerCase() === 'active';
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
        },
        {
            accessorKey: 'updatedOn',
            header: 'Updated On',
            cell: ({ row }) => <span className="font-mono text-xs">{formatDate(row.original.updatedOn)}</span>
        },
        {
            accessorKey: 'timeTaken',
            header: 'Time Taken',
            cell: ({ row }) => <span className="text-xs font-semibold text-slate-700">{row.original.timeTaken || '-'}</span>
        }
    ], []);

    // Voltage Report Column Definitions
    const voltageColumns = useMemo<ColumnDef<any>[]>(() => [
        {
            id: 'slno',
            header: 'SI No',
            cell: ({ row }) => <span className="text-xs font-semibold text-slate-600">{row.index + 1}</span>,
            size: 60
        },
        {
            accessorKey: 'transformerName',
            header: 'Transformer Name',
            cell: ({ row }) => <span className="font-semibold text-slate-800">{row.original.transformerName || '-'}</span>
        },
        {
            accessorKey: 'receivedDateTime',
            header: 'Received Date Time',
            cell: ({ row }) => <span className="font-mono text-xs">{formatDate(row.original.receivedDateTime)}</span>
        },
        {
            accessorKey: 'deviceVoltage',
            header: 'Device Voltage',
            cell: ({ row }) => <span className="font-mono text-xs text-slate-700 font-bold">{row.original.deviceVoltage || '-'}</span>
        },
        {
            accessorKey: 'solarVoltage',
            header: 'Solar Voltage',
            cell: ({ row }) => <span className="font-mono text-xs text-slate-700 font-bold">{row.original.solarVoltage || '-'}</span>
        },
        {
            accessorKey: 'batteryVoltage',
            header: 'Battery Voltage',
            cell: ({ row }) => <span className="font-mono text-xs text-slate-700 font-bold">{row.original.batteryVoltage || '-'}</span>
        }
    ], []);

    // Neatly Formatted Excel Export callback with freeze panes, borders, and custom backgrounds
    const handleExport = () => {
        const dataToExport = reportType === 'alerts' ? displayedAlerts : displayedVoltage;
        if (dataToExport.length === 0) return;

        const reportName = reportType === 'alerts' ? "Alerts_Report" : "Voltage_Telemetry_Report";
        const reportTitle = reportType === 'alerts' ? "Alerts Log Report" : "Voltage Telemetry Report";
        const periodText = `Period: ${formatDate(fromDate)} to ${formatDate(toDate)}`;
        const todayStr = new Date().toISOString().split('T')[0];
        
        let headers: string[] = [];
        let dataRows: any[][] = [];

        if (reportType === 'alerts') {
            headers = [
                "SI No",
                "Transformer Name",
                "Alert",
                "Owner Name",
                "Severity",
                "Received On",
                "Notified On",
                "Current Status",
                "Updated By",
                "Updated On",
                "Time Taken"
            ];
            dataRows = dataToExport.map((item: any, idx) => [
                idx + 1,
                item.transformerName || '-',
                item.alert || '-',
                item.ownerName || '-',
                item.severity || '-',
                formatDate(item.receivedOn),
                formatDate(item.notifiedOn),
                item.currentStatus || '-',
                item.updatedBy || '-',
                formatDate(item.updatedOn),
                item.timeTaken || '-'
            ]);
        } else {
            headers = [
                "SI No",
                "Transformer Name",
                "Received Date Time",
                "Device Voltage",
                "Solar Voltage",
                "Battery Voltage"
            ];
            dataRows = dataToExport.map((item: any, idx) => [
                idx + 1,
                item.transformerName || '-',
                formatDate(item.receivedDateTime),
                item.deviceVoltage || '-',
                item.solarVoltage || '-',
                item.batteryVoltage || '-'
            ]);
        }

        const maxColIdx = headers.length - 1;
        const emptyRow = Array(headers.length).fill("");

        const wsData = [
            [reportTitle, ...Array(maxColIdx).fill("")],
            [periodText, ...Array(maxColIdx).fill("")],
            emptyRow,
            headers,
            ...dataRows,
            emptyRow,
            [`Generated on: ${new Date().toLocaleString()}`, ...Array(maxColIdx).fill("")]
        ];

        import('xlsx-js-style' as any).then((XLSX: any) => {
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');

            // Merges: Title (Row 1), Period (Row 2), Footer (Last Row)
            ws['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: maxColIdx } },
                { s: { r: 1, c: 0 }, e: { r: 1, c: maxColIdx } },
                { s: { r: range.e.r, c: 0 }, e: { r: range.e.r, c: maxColIdx } }
            ];

            // Freeze first 4 rows (Title, Subtitle, Space, Headers)
            ws['!views'] = [
                {
                    state: 'frozen',
                    ySplit: 4,
                    xSplit: 0,
                    topLeftCell: 'A5',
                    activePane: 'bottomLeft'
                }
            ];

            // Setup styles
            const titleStyle = {
                font: { name: "Arial", sz: 14, bold: true, color: { rgb: "1E293B" } },
                alignment: { horizontal: "center", vertical: "center" }
            };

            const subtitleStyle = {
                font: { name: "Arial", sz: 10, italic: true, color: { rgb: "64748B" } },
                alignment: { horizontal: "center", vertical: "center" }
            };

            const headerStyle = {
                font: { name: "Arial", sz: 10, bold: true, color: { rgb: "0369A1" } }, // sky-700
                fill: { patternType: "solid", fgColor: { rgb: "E0F2FE" } }, // sky-100 (light blue)
                alignment: { horizontal: "center", vertical: "center", wrapText: true },
                border: {
                    top: { style: "thin", color: { rgb: "94A3B8" } },
                    bottom: { style: "thin", color: { rgb: "94A3B8" } },
                    left: { style: "thin", color: { rgb: "94A3B8" } },
                    right: { style: "thin", color: { rgb: "94A3B8" } }
                }
            };

            const cellStyle = {
                font: { name: "Arial", sz: 9, color: { rgb: "334155" } },
                alignment: { vertical: "center" },
                border: {
                    top: { style: "thin", color: { rgb: "E2E8F0" } },
                    bottom: { style: "thin", color: { rgb: "E2E8F0" } },
                    left: { style: "thin", color: { rgb: "E2E8F0" } },
                    right: { style: "thin", color: { rgb: "E2E8F0" } }
                }
            };

            const footerStyle = {
                font: { name: "Arial", sz: 9, italic: true, color: { rgb: "94A3B8" } },
                alignment: { horizontal: "center", vertical: "center" }
            };

            // Apply styles to all generated cells
            for (let r = range.s.r; r <= range.e.r; ++r) {
                for (let c = range.s.c; c <= range.e.c; ++c) {
                    const cellRef = XLSX.utils.encode_cell({ r, c });
                    if (!ws[cellRef]) continue;

                    if (r === 0) {
                        ws[cellRef].s = titleStyle;
                    } else if (r === 1) {
                        ws[cellRef].s = subtitleStyle;
                    } else if (r === 3) {
                        ws[cellRef].s = headerStyle;
                    } else if (r === range.e.r) {
                        ws[cellRef].s = footerStyle;
                    } else if (r > 3 && r < range.e.r - 1) {
                        // Alignments: Sl No centered, Voltages right, else left
                        const isVoltageCol = reportType === 'voltage' && c >= 3;
                        ws[cellRef].s = {
                            ...cellStyle,
                            alignment: {
                                ...cellStyle.alignment,
                                horizontal: c === 0 ? "center" : (isVoltageCol ? "right" : "left")
                            }
                        };
                    }
                }
            }

            // Adjust column widths nicely
            const maxLen = (val: any) => String(val || '').length;
            const colsWidths = Array(headers.length).fill(0).map((_, cIdx) => {
                let max = maxLen(headers[cIdx]);
                dataRows.forEach(row => {
                    max = Math.max(max, maxLen(row[cIdx]));
                });
                return { wch: Math.max(max + 3, 10) };
            });
            ws['!cols'] = colsWidths;

            // Row heights
            ws['!rows'] = Array(wsData.length).fill(0).map((_, rIdx) => {
                if (rIdx === 0) return { hpt: 30 }; // Title
                if (rIdx === 1) return { hpt: 20 }; // Subtitle
                if (rIdx === 3) return { hpt: 25 }; // Header
                return { hpt: 18 }; // Data/Footer
            });

            const wb = XLSX.utils.book_new();
            const sheetName = reportType === 'alerts' ? "Alerts Report" : "Voltage Report";
            XLSX.utils.book_append_sheet(wb, ws, sheetName);
            
            XLSX.writeFile(wb, `${reportName}_${todayStr}.xlsx`);
        });
    };

    return (
        <div className="space-y-6 animate-fade-in relative pb-10">
            {/* Header Title & Top Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-4">
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                        <FileBarChart className="text-[hsl(var(--primary))]" /> Reports & Analytics
                    </h1>
                    <p className="text-[hsl(var(--muted-foreground))] text-sm font-medium">Generate, view, and download system reports.</p>
                </div>
            </div>

            {/* Filter Bar Panel Card */}
            <div className="bg-white rounded-xl border border-[hsl(var(--border))] p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
                    
                    {/* Report Type Dropdown */}
                    <div className="space-y-1.5 w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            Report Type
                        </label>
                        <select
                            value={reportType}
                            onChange={(e) => {
                                setReportType(e.target.value as any);
                                setHasGenerated(false); // Reset generated state on change
                            }}
                            className="h-[40px] w-full px-3 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
                        >
                            <option value="alerts">Alerts</option>
                            <option value="voltage">Voltage Telemetry</option>
                        </select>
                    </div>

                    {/* Transformer Selector */}
                    <div className="space-y-1.5 w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                            Transformer
                        </label>
                        <SearchableSelect
                            value={selectedTransformer}
                            onChange={(val) => {
                                setSelectedTransformer(val as string);
                                setHasGenerated(false);
                            }}
                            options={transOptions}
                            placeholder="All Transformers"
                            className="text-slate-700"
                        />
                    </div>

                    {/* From Date Picker */}
                    <div className="space-y-1.5 w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-400" /> From Date
                        </label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => {
                                setFromDate(e.target.value);
                                setHasGenerated(false);
                            }}
                            className="h-[40px] w-full px-3 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
                        />
                    </div>

                    {/* To Date Picker */}
                    <div className="space-y-1.5 w-full">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-400" /> To Date
                        </label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => {
                                setToDate(e.target.value);
                                setHasGenerated(false);
                            }}
                            className="h-[40px] w-full px-3 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm"
                        />
                    </div>

                    {/* Generate Report Button */}
                    <div className="w-full">
                        <Button
                            onClick={handleGenerateReport}
                            disabled={isLoading}
                            className="h-[40px] w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold px-6 shadow-md rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
                        >
                            <FileBarChart size={16} />
                            Generate Report
                        </Button>
                    </div>
                </div>
            </div>

            {/* Generated Report Display Container */}
            {hasGenerated ? (
                <div className="bg-white rounded-xl border border-[hsl(var(--border))] shadow-sm overflow-hidden p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 border-slate-100 gap-4">
                        <div>
                            <h3 className="font-bold text-slate-800 text-base capitalize">
                                {reportType === 'alerts' ? 'Alerts Log Report' : 'Voltage Telemetry Report'}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">
                                Period: <span className="font-semibold text-slate-600">{formatDate(fromDate)}</span> to <span className="font-semibold text-slate-600">{formatDate(toDate)}</span> • Transformer: <span className="font-semibold text-slate-600">{selectedTransformer === 'all' ? 'All' : selectedTransformer}</span>
                            </p>
                        </div>
                        <div className="bg-slate-50 px-4 py-2 border rounded-xl shadow-inner text-right">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Records Found</span>
                            <span className="text-lg font-black text-slate-700 leading-none">
                                {reportType === 'alerts' ? displayedAlerts.length : displayedVoltage.length}
                            </span>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="border border-[hsl(var(--border))] rounded-lg overflow-hidden min-h-[300px]">
                        <DataTable
                            columns={reportType === 'alerts' ? alertColumns : voltageColumns}
                            data={reportType === 'alerts' ? displayedAlerts : displayedVoltage}
                            searchKey="transformerName"
                            isLoading={isLoading}
                            onExport={handleExport}
                            minWidth="1200px"
                        />
                    </div>
                </div>
            ) : (
                /* Empty / Awaiting Generation State */
                <div className="bg-slate-50/50 rounded-xl border border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[350px]">
                    <div className="p-4 bg-white rounded-2xl border shadow-sm text-slate-400">
                        <FileSpreadsheet size={36} className="text-blue-500 animate-pulse" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                        <h3 className="font-bold text-slate-700 text-sm">No Report Generated Yet</h3>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                            Configure report type, transformer nodes, and date duration filters above, then click **Generate Report** to query logs.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
