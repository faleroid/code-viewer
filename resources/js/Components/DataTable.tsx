import React, { useState, useMemo } from 'react';
import {
    ColumnDef,
    SortingState,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';

import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import Checkbox from '@/Components/Checkbox';
import { Filter, Search, FileSpreadsheet, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface DataTableProps {
    tableTitle?: string;
    columns: ColumnDef<any, any>[];
    data: any[];
    searchPlaceholder?: string;
    showSelect?: boolean;
    showExport?: boolean;
    showFilter?: boolean;
    actionButton?: React.ReactNode;
    onExport?: () => void;
    onFilter?: () => void;
}

export default function DataTable({
    tableTitle = 'Data Tabel',
    columns,
    data,
    searchPlaceholder = 'Cari',
    showSelect = true,
    showExport = true,
    showFilter = true,
    actionButton,
    onExport,
    onFilter,
}: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState({});

    const finalColumns = useMemo(() => {
        if (!showSelect) return columns;

        const selectColumn: ColumnDef<any, any> = {
            id: 'select',
            header: ({ table }) => (
                <div className="px-1 flex items-center justify-center">
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected()}
                        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
                        className="rounded border-slate-300 text-sky-400 focus:ring-transparent w-4 h-4"
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className="px-1 flex items-center justify-center">
                    <Checkbox
                        checked={row.getIsSelected()}
                        onChange={(e) => row.toggleSelected(e.target.checked)}
                        className="rounded border-slate-300 text-sky-400 focus:ring-transparent w-4 h-4"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
            size: 50,
        };

        return [selectColumn, ...columns];
    }, [columns, showSelect]);

    const table = useReactTable({
        data,
        columns: finalColumns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            rowSelection,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="w-full bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Header Controls */}
            <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 tracking-tight">{tableTitle}</h2>

                <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Action Button */}
                    {actionButton}

                    {/* Filter Button */}
                    {showFilter && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-3 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-none gap-2 font-normal rounded-lg"
                            onClick={onFilter}
                        >
                            <Filter className="w-4 h-4 text-slate-500" />
                            <span>Filter</span>
                        </Button>
                    )}

                    {/* Search Input */}
                    <div className="relative min-w-[180px] sm:min-w-[220px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <Input
                            value={globalFilter ?? ''}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="h-9 pl-9 pr-3 text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:border-slate-300 focus-visible:ring-1 focus-visible:ring-slate-400 rounded-lg placeholder:text-slate-400"
                        />
                    </div>

                    {/* Excel / Export Button */}
                    {showExport && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-3 border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100/70 hover:text-emerald-800 shadow-none gap-1.5 font-medium rounded-lg"
                            onClick={onExport}
                        >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            <span>Excel</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Table Container */}
            <div className="relative overflow-x-auto">
                <Table className="w-full text-left text-sm border-collapse">
                    <TableHeader className="bg-slate-50/70 border-b border-slate-200/80">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-b-slate-200/80">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        style={header.column.columnDef.size ? { width: `${header.column.columnDef.size}px` } : undefined}
                                        className="h-11 px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider border-r last:border-r-0 border-slate-200/60 select-none"
                                    >
                                        <p className='flex justify-center'>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </p>
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100">
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() ? 'selected' : undefined}
                                    className="hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-b-0 data-[state=selected]:bg-sky-50/30"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            style={cell.column.columnDef.size ? { width: `${cell.column.columnDef.size}px` } : undefined}
                                            className="px-4 py-3.5 text-slate-700 border-r last:border-r-0 border-slate-100 align-middle"
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={finalColumns.length} className="h-32 text-center text-slate-400 font-medium">
                                    Tidak ada data yang ditemukan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Table Footer / Pagination */}
            {table.getPageCount() > 1 && (
                <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div>
                        Menampilkan page {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 border-slate-200"
                            disabled={!table.getCanPreviousPage()}
                            onClick={() => table.setPageIndex(0)}
                        >
                            <ChevronsLeft className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 border-slate-200"
                            disabled={!table.getCanPreviousPage()}
                            onClick={() => table.previousPage()}
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 border-slate-200"
                            disabled={!table.getCanNextPage()}
                            onClick={() => table.nextPage()}
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 border-slate-200"
                            disabled={!table.getCanNextPage()}
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        >
                            <ChevronsRight className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
