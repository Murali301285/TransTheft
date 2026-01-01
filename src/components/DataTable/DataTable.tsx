"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, SlidersHorizontal, Download, Filter, X } from "lucide-react";
import * as XLSX from "xlsx";
import { clsx } from "clsx";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    onExport?: () => void;
    isLoading?: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    isLoading,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({});

    const toggleFilter = (columnId: string) => {
        setOpenFilters(prev => ({
            ...prev,
            [columnId]: !prev[columnId]
        }));
    };

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            }
        }
    });

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data");
        XLSX.writeFile(wb, "export.xlsx");
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
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
                    <Button variant="outline" size="sm" onClick={handleExport}>
                        <Download size={14} className="mr-2" />
                        Export Excel
                    </Button>
                    {/* Column Toggle Logic could go here */}
                </div>
            </div>

            {/* Table Container - Fixed Height / Scroll */}
            <div className="rounded-md border border-[hsl(var(--border))] bg-white overflow-hidden flex flex-col h-[600px]">
                <div className="flex-1 overflow-auto relative">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-[hsl(var(--background))] sticky top-0 z-10 shadow-sm text-[hsl(var(--muted-foreground))]">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const isFiltered = header.column.getIsFiltered();
                                        return (
                                            <th
                                                key={header.id}
                                                className={clsx(
                                                    "px-6 py-3 font-medium border-b border-[hsl(var(--border))]",
                                                    isFiltered && "bg-yellow-100 text-yellow-900 border-yellow-200"
                                                )}
                                            >
                                                <div className="flex flex-col gap-2 relative">
                                                    <div className="flex items-center justify-between gap-2">
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}

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

                                                    {/* Filter Input Popover-like */}
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
                                    <td colSpan={columns.length} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2 text-[hsl(var(--muted-foreground))]">
                                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                            Loading data...
                                        </div>
                                    </td>
                                </tr>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="bg-[hsl(var(--surface))] hover:bg-[hsl(var(--primary)/0.02)] transition-colors"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-[hsl(var(--foreground))]">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="h-24 text-center text-[hsl(var(--muted-foreground))]">
                                        No results.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2">
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                    {table.getFilteredRowModel().rows.length} row(s) total.
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 mr-4">
                        <span className="text-sm text-[hsl(var(--muted-foreground))]">Rows per page</span>
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={(e) => {
                                table.setPageSize(Number(e.target.value));
                            }}
                            className="h-8 w-16 rounded border border-[hsl(var(--border))] bg-transparent text-sm"
                        >
                            {[10, 20, 50, 100].map((pageSize) => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronsLeft size={16} />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    <span className="text-sm font-medium min-w-[3rem] text-center">
                        Page {table.getState().pagination.pageIndex + 1}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight size={16} />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronsRight size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
