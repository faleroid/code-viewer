import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import StatCard from '@/Components/StatCard';
import Title from '@/Components/Title';
import DataTable from '@/Components/DataTable';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { BookOpen, Clock, CheckCircle2, FileUp } from 'lucide-react';

interface DashboardMahasiswaProps {
    classes?: any[];
    assignments?: any[];
}

export default function DashboardMahasiswa({
    classes = [],
    assignments = [],
}: DashboardMahasiswaProps) {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [activeTask, setActiveTask] = useState<any>(null);

    const { data, setData, post, processing, errors, clearErrors, reset } = useForm({
        file: null as File | null,
    });

    const openUpload = (task: any) => {
        setActiveTask(task);
        clearErrors();
        reset();
        setIsUploadOpen(true);
    };

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTask) {
            post(route('submissions.store', activeTask.id), {
                onSuccess: () => {
                    setIsUploadOpen(false);
                },
            });
        }
    };

    const columns = useMemo<ColumnDef<any>[]>(() => [
        {
            accessorKey: 'title',
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Tugas / Mata Kuliah
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => {
                const task = row.original;
                const initials = (task.title || 'TG').slice(0, 2).toUpperCase();
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center shrink-0 border border-slate-300">
                            {initials}
                        </div>
                        <div>
                            <div className="font-medium text-slate-800">{task.title}</div>
                            <div className="text-xs text-slate-500 line-clamp-1">{task.description || 'Praktikum Web'}</div>
                        </div>
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
                    Kelas
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => {
                const task = row.original;
                return (
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                        {task.course?.name || 'Praktikum Web'}
                    </span>
                );
            },
        },
        {
            accessorKey: 'deadline',
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Batas Waktu
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => {
                const task = row.original;
                if (!task.deadline) return <span className="text-slate-400">-</span>;
                const deadline = new Date(task.deadline);
                return (
                    <div className="text-sm text-slate-700 font-medium">
                        {deadline.toLocaleDateString('id-ID', {
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
            accessorKey: 'status',
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Status
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => {
                const task = row.original;
                const deadline = task.deadline ? new Date(task.deadline) : null;
                const isExpired = deadline ? deadline < new Date() : false;

                if (isExpired) {
                    return (
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-700 uppercase tracking-wide border border-amber-200">
                            BERAKHIR
                        </span>
                    );
                }
                return (
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-700 uppercase tracking-wide border border-blue-200">
                        AKTIF
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Aksi</div>,
            cell: ({ row }) => {
                const task = row.original;
                return (
                    <div className="text-right">
                        <Button
                            size="sm"
                            className="h-8 px-3 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm gap-1.5"
                            onClick={() => openUpload(task)}
                        >
                            <FileUp className="w-3.5 h-3.5" />
                            Kumpulkan
                        </Button>
                    </div>
                );
            },
        },
    ], []);

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard Mahasiswa" />

            <div className="px-6 md:px-12 py-6">
                <Title title="Dashboard Mahasiswa" subtitle="Rangkuman dan Informasi Praktikum" />

                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <StatCard 
                            title="Akademik" 
                            value={classes ? classes.length : 0} 
                            subtitle="Kelas Dikuti" 
                            icon={BookOpen}
                            variant="blue" 
                        />

                        <StatCard 
                            title="Tugas" 
                            value={assignments ? assignments.length : 0} 
                            subtitle="Belum Dikerjakan" 
                            icon={Clock}
                            variant="orange" 
                        />

                        <StatCard 
                            title="Tugas Selesai" 
                            value={0} 
                            subtitle="Tugas Selesai" 
                            icon={CheckCircle2}
                            variant="purple" 
                        />
                    </div>

                    {/* DataTable Tugas Praktikum */}
                    <DataTable 
                        columns={columns} 
                        data={assignments || []} 
                        tableTitle="Data Tugas Praktikum"
                        searchPlaceholder="Cari tugas..."
                    />
                </div>

                {/* Upload Modal */}
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Kumpulkan Tugas</DialogTitle>
                            <DialogDescription>
                                Unggah file jawaban Anda untuk <strong>{activeTask?.title}</strong> dalam format .zip.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={handleUpload} className="space-y-4 pt-4">
                            <div className="grid w-full items-center gap-1.5">
                                <label className="text-sm font-medium text-slate-700">File ZIP</label>
                                <input 
                                    type="file" 
                                    accept=".zip" 
                                    onChange={(e) => setData('file', e.target.files?.[0] || null)}
                                    className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                                />
                                {errors.file && (
                                    <div className="text-sm text-red-500 mt-1">{errors.file}</div>
                                )}
                            </div>
                            
                            <DialogFooter className="sm:justify-end mt-6">
                                <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing || !data.file}>
                                    {processing ? 'Mengunggah...' : 'Unggah'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>   
            </div>
        </AuthenticatedLayout>
    );
}
