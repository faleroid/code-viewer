import React, { useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import StatCard from '@/Components/StatCard';
import Title from '@/Components/Title';
import DataTable from '@/Components/DataTable';
import { Button } from '@/Components/ui/button';
import { BookOpen, Clock, CheckCircle2, Code2 } from 'lucide-react';

interface DashboardAslabProps {
    classes?: any[];
    pendingSubmissions?: any[];
}

export default function DashboardAslab({
    classes = [],
    pendingSubmissions = [],
}: DashboardAslabProps) {
    const columns = useMemo<ColumnDef<any>[]>(() => {
        const bgColors = [
            'bg-amber-800 text-white',
            'bg-teal-700 text-white',
            'bg-stone-500 text-white',
            'bg-emerald-600 text-white',
            'bg-blue-600 text-white',
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
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 tracking-wide uppercase">
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
            <Head title="Dashboard Aslab" />

            <div className="px-6 md:px-12 py-6 pb-12">
                <Title title="Dashboard Asisten" subtitle="Rangkuman dan Informasi Praktikum" />

                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <StatCard 
                            title="Akademik" 
                            value={classes ? classes.length : 0} 
                            subtitle="Kelas Aktif" 
                            icon={BookOpen}
                            variant="blue" 
                        />

                        <StatCard 
                            title="Penilaian" 
                            value={pendingSubmissions ? pendingSubmissions.length : 0} 
                            subtitle="Menunggu Review" 
                            icon={Clock}
                            variant="orange" 
                        />

                        <StatCard 
                            title="Riwayat" 
                            value={0} 
                            subtitle="Tugas Dinilai" 
                            icon={CheckCircle2}
                            variant="green" 
                        />
                    </div>

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
