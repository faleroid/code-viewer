import React, { useState, useMemo, FormEvent } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/Components/ui/button';
import Title from '@/Components/Title';
import DataTable from '@/Components/DataTable';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Sidebar } from '@/Components/Sidebar';
import { getAdminSidebarItems } from '@/Components/Sidebar/adminNavigation';
import { Plus } from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb"

interface Course {
    id: number;
    code: string;
    name: string;
    lab_classes_count: number;
}

export default function CoursesIndex({ courses = [] }: { courses?: Course[] }) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        code: '',
    });

    const openCreate = () => {
        reset();
        clearErrors();
        setEditingCourse(null);
        setShowCreateDialog(true);
    };

    const openEdit = (course: Course) => {
        setEditingCourse(course);
        setData({
            name: course.name,
            code: course.code,
        });
        clearErrors();
        setShowCreateDialog(true);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (editingCourse) {
            put(route('courses.update', editingCourse.id), {
                onSuccess: () => setShowCreateDialog(false),
            });
        } else {
            post(route('courses.store'), {
                onSuccess: () => setShowCreateDialog(false),
            });
        }
    };

    const deleteCourse = (course: Course) => {
        if (confirm(`Hapus mata kuliah "${course.name}"?`)) {
            router.delete(route('courses.destroy', course.id));
        }
    };

    const columns = useMemo<ColumnDef<Course>[]>(() => [
        {
            accessorKey: 'code',
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Kode
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => (
                <span className="font-medium text-slate-800">
                    {row.original.code}
                </span>
            ),
        },
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Mata Kuliah
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => (
                <Link
                    href={route('courses.show', row.original.id)}
                    className="text-sky-600 hover:text-sky-700 hover:underline font-medium"
                >
                    {row.original.name}
                </Link>
            ),
        },
        {
            accessorKey: 'lab_classes_count',
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Jumlah Kelas
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => (
                <span className="text-slate-700">
                    {row.original.lab_classes_count} kelas
                </span>
            ),
        },
        {
            id: 'actions',
            header: () => <div></div>,
            cell: ({ row }) => {
                const course = row.original;
                return (
                    <div className="flex space-x-2 justify-center">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-slate-200 hover:bg-slate-50"
                            onClick={() => openEdit(course)}
                        >
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => deleteCourse(course)}
                        >
                            Hapus
                        </Button>
                    </div>
                );
            },
        },
    ], []);

    return (
        <AuthenticatedLayout>
            <Head title="Mata Kuliah - Admin" />

            <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50/50">
                {/* Sidebar Admin */}
                <div className="w-64 shrink-0 hidden lg:block border-r border-slate-200/80 bg-white">
                    <Sidebar
                        items={getAdminSidebarItems()}
                        activeId="mata-kuliah"
                        className="w-full h-full border-none rounded-none"
                    />
                </div>

                {/* Sidebar Mobile View */}
                <div className="block lg:hidden w-full px-4 pt-4">
                    <Sidebar
                        items={getAdminSidebarItems()}
                        activeId="mata-kuliah"
                        className="w-full bg-white border border-slate-200/80 rounded-2xl p-3"
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 p-6 md:p-8 space-y-6 max-w-7xl">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />

                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-medium text-sky-600">Mata Kuliah</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <Title title="Manajemen Mata Kuliah" subtitle="Kelola Mata Kuliah & Tugas Praktikum" />


                        <Button onClick={openCreate} className="bg-sky-600 hover:bg-sky-700 text-white gap-1.5 shadow-sm self-start sm:self-auto">
                            <Plus className="w-4 h-4" />
                            <span>Tambah Mata Kuliah</span>
                        </Button>
                    </div>

                    {/* DataTable Mata Kuliah */}
                    <DataTable
                        tableTitle="Daftar Mata Kuliah"
                        columns={columns}
                        data={courses}
                        searchPlaceholder="Cari kode atau nama mata kuliah..."
                    />
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingCourse ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4 pt-2">
                        <div>
                            <label className="text-sm font-medium block mb-1 text-slate-700">Kode</label>
                            <input
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                type="text"
                                placeholder="IF2001"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                            {errors.code && <p className="text-sm text-red-500 mt-1">{errors.code}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1 text-slate-700">Nama Mata Kuliah</label>
                            <input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                type="text"
                                placeholder="Pemrograman Web"
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>Batal</Button>
                            <Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white" disabled={processing}>
                                {editingCourse ? 'Simpan' : 'Buat'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
