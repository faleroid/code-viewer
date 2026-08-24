import React, { useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import Title from '@/Components/Title';
import DataTable from '@/Components/DataTable';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb"
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Sidebar } from '@/Components/Sidebar';
import { getStudentSidebarItems } from '@/Components/Sidebar/studentNavigation';
import { ExternalLink, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface HistoryProps {
    submissions?: any[];
}

export default function StudentAssignmentsHistory({ submissions = [] }: HistoryProps) {
    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: 'assignment.title',
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Tugas
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => {
                const sub = row.original;
                return (
                    <div>
                        <div className="font-medium text-slate-800">{sub.assignment?.title || 'Tugas'}</div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'assignment.classes',
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Praktikum
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => {
                const sub = row.original;
                return (
                    <div className="flex items-center justify-center">
                        <Badge className="bg-white hover:bg-white text-slate-700 border border-slate-100 font-semibold">
                            {sub.assignment?.module?.lab_class?.course?.name || sub.course?.name || 'Praktikum Web'}
                        </Badge>
                    </div>
                );
            },
        },
        {
            accessorKey: 'submitted_at',
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Tanggal
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => {
                const sub = row.original;
                if (!sub.submitted_at) return <span className="text-slate-400">-</span>;
                const date = new Date(sub.submitted_at);
                return (
                    <div className="text-sm text-slate-700 font-medium">
                        {date.toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </div>
                );
            },
        },
        {
            accessorKey: 'is_late',
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Tepat Waktu
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => {
                const sub = row.original;
                if (sub.is_late) {
                    return (
                        <div className='flex justify-center'>
                            <Badge className="bg-red-600 hover:bg-red-700 text-white font-semibold">
                                Terlambat
                            </Badge>
                        </div>
                    );
                }
                return (
                    <div className='flex justify-center'>
                        <Badge className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-200 font-semibold">
                            On Time
                        </Badge>
                    </div>
                );
            },
        },
        {
            accessorKey: 'status',
            header: ({ column }) => (
                <div
                    className="flex items-center justify-end gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Status
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => {
                const sub = row.original;
                if (sub.status === 'graded') {
                    return (
                        <div className='flex justify-center'>
                            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                                Sudah Dinilai
                            </Badge>
                        </div>

                    );
                }
                return (
                    <div className='flex justify-center'>
                        <Badge variant="outline" className="text-sky-700 border-sky-200 bg-sky-50 font-semibold">
                            Menunggu Review
                        </Badge>
                    </div>

                );
            },
        },
    ], []);

    return (
        <AuthenticatedLayout>
            <Head title="Riwayat Submission - Mahasiswa" />

            <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50/50">
                {/* Sidebar Mahasiswa */}
                <div className="w-64 shrink-0 hidden lg:block border-r border-slate-200/80 bg-white sticky top-16 h-[calc(100vh-4rem)] self-start">
                    <Sidebar
                        items={getStudentSidebarItems()}
                        activeId="riwayat-tugas"
                        className="w-full h-full border-none rounded-none"
                    />
                </div>

                {/* Sidebar Mobile View */}
                <div className="block lg:hidden w-full px-4 pt-4">
                    <Sidebar
                        items={getStudentSidebarItems()}
                        activeId="riwayat-tugas"
                        className="w-full bg-white border border-slate-200/80 rounded-2xl p-3"
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 p-6 md:p-8 space-y-6 max-w-7xl">
                    <div className="flex justify-between items-center">
                        <Title
                            title="Riwayat Submission"
                            subtitle="Daftar seluruh tugas yang dikumpulkan"
                        />

                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="font-medium text-sky-600">Riwayat Submission</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    {/* DataTable Riwayat Submission */}
                    <DataTable
                        tableTitle="Riwayat Pengumpulan Tugas"
                        columns={columns}
                        data={submissions}
                        searchPlaceholder="Cari tugas atau mata kuliah..."
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
