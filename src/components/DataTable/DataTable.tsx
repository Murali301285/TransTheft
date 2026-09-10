"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getExpandedRowModel, // Added
    useReactTable,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    Row, // Added
    ExpandedState, // Added
} from "@tanstack/react-table";
import { useState, useMemo, Fragment, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, SlidersHorizontal, Download, Filter, X, ChevronDown, ChevronRight as ChevronRightIcon } from "lucide-react";
import * as XLSX from "xlsx";
import { clsx } from "clsx";
import { TransformerLoader } from "@/components/ui/TransformerLoader";
import { toast } from "sonner";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    onExport?: () => void;
    isLoading?: boolean;
    showSerialNumber?: boolean; // Added
    renderSubComponent?: (props: { row: Row<TData> }) => React.ReactNode; // Added
    getRowClassName?: (row: Row<TData>) => string;
    minWidth?: string;
    hideToolbar?: boolean;
    exportFileName?: string; // Added
    exportTitle?: string; // Added
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    onExport,
    isLoading,
    showSerialNumber = false,
    renderSubComponent,
    getRowClassName,
    minWidth,
    hideToolbar = false,
    exportFileName,
    exportTitle,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({});
    const [expanded, setExpanded] = useState<ExpandedState>({}); // Added
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleTableScroll = () => {
        setIsScrolling(true);
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
            setIsScrolling(false);
        }, 1000);
    };

    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    const toggleFilter = (columnId: string) => {
        setOpenFilters(prev => ({
            ...prev,
            [columnId]: !prev[columnId]
        }));
    };

    // Enhance Columns
    const tableColumns = useMemo(() => {
        const enhanced = [...columns];

        // Add Expander Column if subComponent provided
        if (renderSubComponent) {
            enhanced.unshift({
                id: "expander",
                header: () => null,
                cell: ({ row }: { row: Row<TData> }) => {
                    return row.getCanExpand() ? (
                        <button
                            onClick={row.getToggleExpandedHandler()}
                            className="cursor-pointer text-slate-400 hover:text-slate-600 p-1"
                        >
                            {row.getIsExpanded() ? <ChevronDown size={16} /> : <ChevronRightIcon size={16} />}
                        </button>
                    ) : null;
                },
                size: 30, // Small width
                meta: { className: "w-[30px] pr-0 pl-4" }
            } as any);
        }

        // Add Serial Number Column
        if (showSerialNumber) {
            enhanced.unshift({
                id: "serialNumber",
                header: "Sl. No",
                cell: ({ row }: { row: Row<TData> }) => (
                    <span className="text-muted-foreground font-mono text-xs">
                        {row.index + 1}
                    </span>
                ),
                size: 60,
                meta: { className: "w-[60px]" }
            } as any);
        }

        return enhanced;
    }, [columns, showSerialNumber, renderSubComponent]);

    const table = useReactTable({
        data,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        getExpandedRowModel: getExpandedRowModel(), // Added
        onExpandedChange: setExpanded, // Added
        // Identify rows that can expand
        getRowCanExpand: () => !!renderSubComponent,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            expanded, // Added
        },
        initialState: {
            pagination: {
                pageSize: 10,
            }
        }
    });

    // Derived names for export
    const derivedFileName = useMemo(() => {
        if (exportFileName) return exportFileName;
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            const segments = path.split('/').filter(Boolean);
            const last = segments[segments.length - 1];
            if (last) {
                if (last === 'master-config') return 'Master-Configuration';
                return last.charAt(0).toUpperCase() + last.slice(1);
            }
        }
        return 'Export';
    }, [exportFileName]);

    const derivedTitle = useMemo(() => {
        if (exportTitle) return exportTitle;
        return `${derivedFileName} List`;
    }, [exportTitle, derivedFileName]);

    const handleExport = () => {
        import("xlsx-js-style" as any).then((XLSX: any) => {
            const todayStr = new Date().toISOString().split('T')[0];
            const fileName = `${derivedFileName}_${todayStr}.xlsx`;
            const sheetTitle = derivedTitle;

            // 1. Prepare data
            if (!data || data.length === 0) {
                toast.error("No data to export");
                return;
            }

            // Filter columns to export: exclude actions, expander, serialNumber, etc.
            const exportableColumns = columns.filter(col => {
                const id = col.id || (col as any).accessorKey;
                if (!id) return false;
                if (id === 'actions' || id === 'expander' || id === 'serialNumber') return false;
                return true;
            });

            const headers = [
                "Sl No",
                ...exportableColumns.map(col => {
                    if (typeof col.header === 'string') return col.header;
                    const key = (col as any).accessorKey || col.id || '';
                    return key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str: string) => str.toUpperCase())
                        .trim();
                })
            ];

            // Build array-of-arrays for SheetJS
            const wsData: any[][] = [];

            // Row 1: Title
            wsData.push([sheetTitle]);
            // Row 2: Empty spacer
            wsData.push([]);
            // Row 3: Headers
            wsData.push(headers);

            // Row 4+: Data
            data.forEach((item: any, idx: number) => {
                const row = [
                    idx + 1,
                    ...exportableColumns.map(col => {
                        const key = (col as any).accessorKey || col.id;
                        if (!key) return "";
                        const val = item[key];
                        if (val === null || val === undefined) return "";
                        if (typeof val === "boolean") return val ? "TRUE" : "FALSE";
                        if (Array.isArray(val)) {
                            return val.map((v: any) => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ');
                        }
                        return val;
                    })
                ];
                wsData.push(row);
            });

            const ws = XLSX.utils.aoa_to_sheet(wsData);
            const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
            const maxColIdx = range.e.c;

            // Merges: Title (Row 1)
            ws["!merges"] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: maxColIdx } }
            ];

            // Styles
            const titleStyle = {
                font: { name: "Arial", sz: 14, bold: true, color: { rgb: "1E293B" } }, // slate-800
                alignment: { horizontal: "center", vertical: "center" }
            };

            const headerStyle = {
                font: { name: "Arial", sz: 10, bold: true, color: { rgb: "1E3A8A" } }, // blue-900
                fill: { patternType: "solid", fgColor: { rgb: "DBEAFE" } }, // blue-100 (light blue background)
                alignment: { horizontal: "center", vertical: "center", wrapText: true },
                border: {
                    top: { style: "thin", color: { rgb: "94A3B8" } },
                    bottom: { style: "thin", color: { rgb: "94A3B8" } },
                    left: { style: "thin", color: { rgb: "94A3B8" } },
                    right: { style: "thin", color: { rgb: "94A3B8" } }
                }
            };

            const cellStyle = {
                font: { name: "Arial", sz: 9, color: { rgb: "334155" } }, // slate-700
                alignment: { vertical: "center" },
                border: {
                    top: { style: "thin", color: { rgb: "E2E8F0" } },
                    bottom: { style: "thin", color: { rgb: "E2E8F0" } },
                    left: { style: "thin", color: { rgb: "E2E8F0" } },
                    right: { style: "thin", color: { rgb: "E2E8F0" } }
                }
            };

            // Apply styles to all cells
            for (let r = range.s.r; r <= range.e.r; ++r) {
                for (let c = range.s.c; c <= range.e.c; ++c) {
                    const cellRef = XLSX.utils.encode_cell({ r, c });
                    if (!ws[cellRef]) continue;

                    if (r === 0) {
                        ws[cellRef].s = titleStyle;
                    } else if (r === 2) {
                        ws[cellRef].s = headerStyle;
                    } else if (r > 2) {
                        ws[cellRef].s = {
                            ...cellStyle,
                            alignment: {
                                ...cellStyle.alignment,
                                horizontal: c === 0 ? "center" : "left"
                            }
                        };
                    }
                }
            }

            // Adjust column widths
            const maxLen = (val: any) => String(val ?? "").length;
            const colsWidths = Array(headers.length).fill(0).map((_, cIdx) => {
                let max = maxLen(headers[cIdx]);
                for (let r = 3; r < wsData.length; ++r) {
                    max = Math.max(max, maxLen(wsData[r][cIdx]));
                }
                return { wch: Math.max(max + 3, 10) };
            });
            ws["!cols"] = colsWidths;

            // Row heights
            ws["!rows"] = Array(wsData.length).fill(0).map((_, rIdx) => {
                if (rIdx === 0) return { hpt: 35 }; // Title
                if (rIdx === 1) return { hpt: 15 }; // Spacer
                if (rIdx === 2) return { hpt: 25 }; // Header
                return { hpt: 20 }; // Data
            });

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
            XLSX.writeFile(wb, fileName);
        }).catch(err => {
            console.error("Failed to load xlsx-js-style", err);
            // Fallback to standard xlsx write if package fails
            const exportableColumns = columns.filter(col => {
                const id = col.id || (col as any).accessorKey;
                if (!id) return false;
                if (id === 'actions' || id === 'expander' || id === 'serialNumber') return false;
                return true;
            });
            const fallbackData = data.map((item: any, idx: number) => {
                const obj: any = { "Sl No": idx + 1 };
                exportableColumns.forEach(col => {
                    const label = typeof col.header === 'string' ? col.header : (col.id || (col as any).accessorKey || '');
                    const key = (col as any).accessorKey || col.id;
                    if (key) {
                        const val = item[key];
                        if (val === null || val === undefined) obj[label] = "";
                        else if (typeof val === "boolean") obj[label] = val ? "TRUE" : "FALSE";
                        else if (Array.isArray(val)) obj[label] = val.join(', ');
                        else obj[label] = val;
                    }
                });
                return obj;
            });
            const ws = XLSX.utils.json_to_sheet(fallbackData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Data");
            XLSX.writeFile(wb, `${derivedFileName}_fallback.xlsx`);
        });
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            {!hideToolbar && (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2 flex-1">
                        {searchKey && (
                            <Input
                                placeholder={`Search ${searchKey}...`}
                                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn(searchKey)?.setFilterValue(event.target.value)
                                }
                                className="max-w-sm"
                                leftIcon={<SlidersHorizontal size={14} />}
                            />
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={onExport || handleExport}
                            className="border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 hover:border-blue-300 font-semibold text-xs px-3 shadow-sm rounded-lg flex items-center h-8 transition-all duration-200"
                        >
                            <Download size={13} className="mr-1.5" />
                            Export Excel
                        </Button>
                    </div>
                </div>
            )}

            {/* Table Container */}
            <div className="rounded-md border border-[hsl(var(--border))] bg-white overflow-hidden flex flex-col h-[600px]">
                <div 
                    className={clsx(
                        "flex-1 overflow-auto relative table-scrollbar",
                        isScrolling && "is-scrolling"
                    )}
                    onScroll={handleTableScroll}
                >
                    <table className="w-full text-sm text-left" style={minWidth ? { minWidth } : undefined}>
                        <thead className="text-xs uppercase bg-[hsl(var(--background))] sticky top-0 z-10 shadow-sm text-[hsl(var(--muted-foreground))]">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const isFiltered = header.column.getIsFiltered();
                                        const metaStyle = (header.column.columnDef.meta as any)?.style || {};
                                        const computedHeaderStyle = {
                                            ...metaStyle,
                                            zIndex: metaStyle.position === 'sticky' ? 25 : undefined
                                        };
                                        return (
                                            <th
                                                key={header.id}
                                                className={clsx(
                                                    "px-6 py-3 font-medium border-b border-[hsl(var(--border))]",
                                                    isFiltered && "bg-yellow-100 text-yellow-900 border-yellow-200",
                                                    (header.column.columnDef.meta as any)?.className
                                                )}
                                                style={computedHeaderStyle}
                                            >
                                                <div className="flex flex-col gap-2 relative">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div
                                                            className={clsx(
                                                                "flex items-center gap-2 select-none",
                                                                header.column.getCanSort() ? "cursor-pointer hover:text-indigo-600" : ""
                                                            )}
                                                            onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                                                        >
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                                )}
                                                            {{
                                                                asc: <ChevronDown size={14} className="rotate-180 transition-transform" />,
                                                                desc: <ChevronDown size={14} className="transition-transform" />,
                                                            }[header.column.getIsSorted() as string] ?? (header.column.getCanSort() ? <SlidersHorizontal size={14} className="opacity-20 hover:opacity-100 transition-opacity" /> : null)}
                                                        </div>

                                                        {header.column.getCanFilter() && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleFilter(header.column.id);
                                                                }}
                                                                className={clsx(
                                                                    "p-1 rounded-full hover:bg-[hsl(var(--foreground)/0.1)] transition-colors",
                                                                    openFilters[header.column.id] ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"
                                                                )}
                                                            >
                                                                <Filter size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    {openFilters[header.column.id] && header.column.getCanFilter() && (
                                                        <div className="absolute top-full left-0 mt-2 bg-white p-2 rounded-md shadow-lg border border-[hsl(var(--border))] z-50 w-48 animate-fade-in text-black normal-case font-normal">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs font-semibold">Filter {header.column.id}</span>
                                                                <button onClick={() => toggleFilter(header.column.id)} className="text-gray-400 hover:text-gray-600">
                                                                    <X size={12} />
                                                                </button>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                autoFocus
                                                                value={(header.column.getFilterValue() as string) ?? ""}
                                                                onChange={(e) => header.column.setFilterValue(e.target.value)}
                                                                placeholder={`Value...`}
                                                                className="w-full text-xs px-2 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--border))]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={tableColumns.length} className="py-8 text-center">
                                        <TransformerLoader text="Fetching data from grid..." />
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <Fragment key={row.id}>
                                        <tr className={clsx(
                                            "bg-[hsl(var(--surface))] hover:bg-[hsl(var(--primary)/0.02)] transition-colors",
                                            getRowClassName && getRowClassName(row)
                                        )}>
                                            {row.getVisibleCells().map((cell) => (
                                                <td
                                                    key={cell.id}
                                                    className={clsx(
                                                        "px-6 py-4 whitespace-nowrap text-[hsl(var(--foreground))]",
                                                        (cell.column.columnDef.meta as any)?.className
                                                    )}
                                                    style={(cell.column.columnDef.meta as any)?.style}
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                        {row.getIsExpanded() && renderSubComponent && (
                                            <tr className="bg-slate-50/50">
                                                <td colSpan={row.getVisibleCells().length}>
                                                    {renderSubComponent({ row })}
                                                </td>
                                            </tr>
                                        )}
                                    </Fragment>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={tableColumns.length} className="h-24 text-center text-[hsl(var(--muted-foreground))]">
                                        No results.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-100">
                <div className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                    {table.getFilteredRowModel().rows.length} row(s) total.
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 mr-4">
                        <span className="text-xs font-semibold text-slate-500">Rows per page</span>
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => {
                                table.setPageSize(Number(e.target.value));
                            }}
                            className="h-8 w-20 rounded-lg border border-slate-200 bg-white text-xs font-bold px-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                        >
                            {[10, 20, 50, 100, 99999].map((pageSize) => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize === 99999 ? 'All' : pageSize}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        <ChevronsLeft size={14} />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        <ChevronLeft size={14} />
                    </Button>
                    <span className="text-xs font-bold text-slate-700 min-w-[3.5rem] text-center">
                        Page {table.getState().pagination.pageIndex + 1}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        <ChevronRight size={14} />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                        className="h-8 w-8 p-0 rounded-lg border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center transition-all disabled:opacity-50"
                    >
                        <ChevronsRight size={14} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
