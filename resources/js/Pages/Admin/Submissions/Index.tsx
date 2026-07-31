import React, { useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import Title from '@/Components/Title';
import DataTable from '@/Components/DataTable';
import { Button } from '@/Components/ui/button';
import { Code2 } from 'lucide-react';
import { Sidebar } from '@/Components/Sidebar';
import { getAdminSidebarItems } from '@/Components/Sidebar/adminNavigation';

interface SubmissionsIndexProps {
    pendingSubmissions?: any[];
}

export default function SubmissionsIndex({
    pendingSubmissions = [],
}: SubmissionsIndexProps) {
    const columns = useMemo<ColumnDef<any>[]>(() => {
        const bgColors = [
            'bg-amber-800 text-white',
            'bg-teal-700 text-white',
            'bg-stone-500 text-white',
            'bg-emerald-600 text-white',
            'bg-sky-600 text-white',
        ];

        return [
            {
                accessorKey: 'user.name',
                header: ({ column }) => (
                    <div
                        className="flex items-center gap-1 cursor-pointer select-none"
                        onClick={() => column.toggleSorting()}
                    >
                        Mahasiswa
                        {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                    </div>
                ),
                cell: ({ row }) => {
                    const sub = row.original;
                    const userName = sub.user?.name || 'Mahasiswa';
                    const userNim = sub.user?.nim || '-';
                    const initials = userName
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();

                    const colorIndex =
                        (userName.length + (userNim ? userNim.length : 0)) % bgColors.length;
                    const colorClass = bgColors[colorIndex];

                    return (
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full ${colorClass} font-semibold text-xs flex items-center justify-center shrink-0 shadow-sm`}>
                                {initials}
                            </div>
                            <div>
                                <div className="font-medium text-slate-800">{userName}</div>
                                <div className="text-xs text-slate-400 font-mono">NIM: {userNim}</div>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'assignment.title',
                header: ({ column }) => (
                    <div
                        className="flex items-center gap-1 cursor-pointer select-none"
                        onClick={() => column.toggleSorting()}
                    >
                        Tugas Praktikum
                        {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                    </div>
                ),
                cell: ({ row }) => {
                    const sub = row.original;
                    return (
                        <div>
                            <div className="font-medium text-slate-700">{sub.assignment?.title || 'Tugas'}</div>
                            <div className="text-xs text-slate-400">{sub.assignment?.course?.name || 'Praktikum'}</div>
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
                        Status Penyerahan
                        {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                    </div>
                ),
                cell: ({ row }) => {
                    const sub = row.original;
                    if (sub.is_late) {
                        return (
                            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 tracking-wide uppercase">
                                TERLAMBAT
                            </span>
                        );
                    }
                    return (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-sky-100 text-sky-700 border border-sky-200 tracking-wide uppercase">
                            MENUNGGU
                        </span>
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
                        Waktu Kumpul
                        {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                    </div>
                ),
                cell: ({ row }) => {
                    const sub = row.original;
                    if (!sub.submitted_at) return <span className="text-slate-400">-</span>;
                    const date = new Date(sub.submitted_at);
                    return (
                        <div className="text-sm text-slate-700">
                            {date.toLocaleString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
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
                        <div className="text-right">
                            <Link href={route('submissions.review', sub.id)}>
                                <Button
                                    size="sm"
                                    className="h-8 px-3 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm gap-1.5"
                                >
                                    <Code2 className="w-3.5 h-3.5" />
                                    Review Code
                                </Button>
                            </Link>
                        </div>
                    );
                },
            },
        ];
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Review Submissions" />

            <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50/50">
                {/* Sidebar Admin */}
                <div className="w-64 shrink-0 hidden lg:block border-r border-slate-200/80 bg-white">
                    <Sidebar
                        items={getAdminSidebarItems()}
                        activeId="review"
                        className="w-full h-full border-none rounded-none"
                    />
                </div>

                {/* Sidebar Mobile View */}
                <div className="block lg:hidden w-full px-4 pt-4">
                    <Sidebar
                        items={getAdminSidebarItems()}
                        activeId="review"
                        className="w-full bg-white border border-slate-200/80 rounded-2xl p-3"
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 p-6 md:p-8 space-y-6 max-w-7xl">
                    <Title title="Review Submission" subtitle="Antrean Penilaian dan Evaluasi Tugas Mahasiswa" />

                    {/* DataTable Antrean Penilaian */}
                    <DataTable 
                        columns={columns} 
                        data={pendingSubmissions || []} 
                        tableTitle="Antrean Penilaian"
                        searchPlaceholder="Cari mahasiswa atau tugas..."
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
