import React, { useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import Title from '@/Components/Title';
import DataTable from '@/Components/DataTable';
import StatCardGrid from '@/Components/StatCardGrid';
import { Button } from '@/Components/ui/button';
import { Sidebar } from '@/Components/Sidebar';
import { getStudentSidebarItems } from '@/Components/Sidebar/studentNavigation';
import { Award, ExternalLink, CheckCircle2, TrendingUp } from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb"
import StatCardHexagon from '@/Components/StatCardHexagon';


interface GradesProps {
    submissions?: any[];
}

export default function StudentAssignmentsGrades({ submissions = [] }: GradesProps) {
    const gradedSubmissions = useMemo(() => {
        return submissions.filter((sub) => sub.status === 'graded' && sub.grade);
    }, [submissions]);

    const averageScore = useMemo(() => {
        if (gradedSubmissions.length === 0) return 0;
        const total = gradedSubmissions.reduce((sum, sub) => sum + (sub.grade?.score || 0), 0);
        return Math.round((total / gradedSubmissions.length) * 10) / 10;
    }, [gradedSubmissions]);

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
            accessorKey: 'course',
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Modul
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => {
                const sub = row.original;
                return (
                    <div className="text-sm font-medium">
                        {sub.assignment?.module?.title || '-'}
                    </div>
                );
            },
        },
        {
            accessorKey: 'grade.score',
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Nilai
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => {
                const sub = row.original;
                const score = sub.grade?.score || 0;

                return (
                    <div className="flex items-center justify-center gap-3">
                        <p className="font-medium text-slate-900">{Math.round(score)}</p>
                    </div>
                );
            },
        },
        {
            accessorKey: 'grade.graded_at',
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Tanggal Dinilai
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => {
                const sub = row.original;
                if (!sub.grade?.graded_at) return <span className="text-slate-400">-</span>;
                const date = new Date(sub.grade.graded_at);
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
            id: 'actions',
            header: () => <div className="text-right">Aksi</div>,
            cell: ({ row }) => {
                const sub = row.original;
                return (
                    <div className="text-center">
                        <Link href={route('submissions.feedback', sub.id)}>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 text-xs border-slate-200 hover:bg-slate-50 gap-1.5 font-medium"
                            >
                                <span>Lihat Feedback</span>
                                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                            </Button>
                        </Link>
                    </div>
                );
            },
        },
    ], []);

    return (
        <AuthenticatedLayout>
            <Head title="Nilai & Feedback - Mahasiswa" />

            <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50/50">
                {/* Sidebar Mahasiswa */}
                <div className="w-64 shrink-0 hidden lg:block border-r border-slate-200/80 bg-white">
                    <Sidebar
                        items={getStudentSidebarItems()}
                        activeId="nilai-tugas"
                        className="w-full h-full border-none rounded-none"
                    />
                </div>

                {/* Sidebar Mobile View */}
                <div className="block lg:hidden w-full px-4 pt-4">
                    <Sidebar
                        items={getStudentSidebarItems()}
                        activeId="nilai-tugas"
                        className="w-full bg-white border border-slate-200/80 rounded-2xl p-3"
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 p-6 md:p-8 space-y-6 max-w-7xl">
                    <div className='flex justify-between items-center'>
                        <Title
                            title="Nilai & Feedback"
                            subtitle="Rekapitulasi nilai dan catatan evaluasi tugas"
                        />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="font-medium text-sky-600">Nilai & Feedback</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <StatCardGrid
                            value={averageScore}
                            subtitle="Rata-rata Nilai"
                            icon={TrendingUp}
                            variant="sky"
                        />

                        <StatCardGrid
                            value={gradedSubmissions.length}
                            subtitle="Tugas Sudah Dinilai"
                            icon={CheckCircle2}
                            variant="green"
                        />

                        <StatCardGrid
                            value={gradedSubmissions.filter(s => (s.grade?.score || 0) >= 80).length}
                            subtitle="Tugas Berpredikat A/B+"
                            icon={Award}
                            variant="purple"
                        />
                    </div>

                    {/* DataTable Rekap Nilai */}
                    <DataTable
                        tableTitle="Rekapitulasi Nilai Tugas"
                        columns={columns}
                        data={gradedSubmissions}
                        searchPlaceholder="Cari tugas atau modul..."
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
