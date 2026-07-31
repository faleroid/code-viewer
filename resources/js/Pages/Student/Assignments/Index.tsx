import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import Title from '@/Components/Title';
import DataTable from '@/Components/DataTable';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { FileUp } from 'lucide-react';
import { Sidebar } from '@/Components/Sidebar';
import { getStudentSidebarItems } from '@/Components/Sidebar/studentNavigation';

interface AssignmentsIndexProps {
    classes?: any[];
    assignments?: any[];
}

export default function StudentAssignmentsIndex({
    classes = [],
    assignments = [],
}: AssignmentsIndexProps) {
    const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
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
                    Tugas
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => {
                const task = row.original;
                return (
                    <div className="font-medium text-slate-800">{task.title}</div>
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
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 text-sky-600 border border-sky-100">
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
                        })} WIB
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
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-sky-100 text-sky-700 uppercase tracking-wide border border-sky-200">
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
                    <div className="text-center">
                        <Button
                            size="sm"
                            className="h-8 px-3 text-xs bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-sm gap-1.5"
                            onClick={() => openUpload(task)}
                        >
                            <FileUp className="w-3.5 h-3.5" />
                            Submit
                        </Button>
                    </div>
                );
            },
        },
    ], []);

    return (
        <AuthenticatedLayout>
            <Head title="Daftar Tugas - Mahasiswa" />

            <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50/50">
                {/* Sidebar Mahasiswa */}
                <div className="w-64 shrink-0 hidden lg:block border-r border-slate-200/80 bg-white">
                    <Sidebar
                        items={getStudentSidebarItems()}
                        activeId="daftar-tugas"
                        className="w-full h-full border-none rounded-none"
                    />
                </div>

                {/* Sidebar Mobile View */}
                <div className="block lg:hidden w-full px-4 pt-4">
                    <Sidebar
                        items={getStudentSidebarItems()}
                        activeId="daftar-tugas"
                        className="w-full bg-white border border-slate-200/80 rounded-2xl p-3"
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 p-6 md:p-8 space-y-6 max-w-7xl">
                    <Title
                        title="Daftar Tugas Praktikum"
                        subtitle="Kelola dan kumpulkan tugas praktikum Anda"
                    />

                    {/* DataTable Tugas Praktikum */}
                    <DataTable
                        columns={columns}
                        data={assignments || []}
                        tableTitle="Data Tugas Praktikum"
                        searchPlaceholder="Cari tugas..."
                    />
                </div>
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
        </AuthenticatedLayout>
    );
}
