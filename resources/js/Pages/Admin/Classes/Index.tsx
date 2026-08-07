import React, { useState, useMemo, FormEvent } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import Title from '@/Components/Title';
import DataTable from '@/Components/DataTable';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Sidebar } from '@/Components/Sidebar';
import { getAdminSidebarItems } from '@/Components/Sidebar/adminNavigation';
import { Plus, ChevronDown, UserIcon, LaptopMinimal, SquarePen, Trash2, Eye } from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"

interface CourseOption {
    id: number;
    name: string;
    code: string;
}

interface AslabOption {
    id: number;
    name: string;
    email: string;
}

interface ClassItem {
    id: number;
    name: string;
    semester: string;
    course_id: number;
    aslab_id?: number;
    course?: { name: string };
    aslab?: { name: string };
    students_count: number;
}

export default function ClassesIndex({
    classes = [],
    courses = [],
    aslabs = [],
}: {
    classes?: ClassItem[];
    courses?: CourseOption[];
    aslabs?: AslabOption[];
}) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        course_id: '' as string | number,
        name: '',
        semester: '',
        aslab_id: '' as string | number,
    });

    const openCreate = () => {
        reset();
        clearErrors();
        setData({
            course_id: courses[0]?.id || '',
            name: '',
            semester: '',
            aslab_id: '',
        });
        setEditingClass(null);
        setShowCreateDialog(true);
    };

    const openEdit = (cls: ClassItem) => {
        setEditingClass(cls);
        setData({
            course_id: cls.course_id,
            name: cls.name,
            semester: cls.semester,
            aslab_id: cls.aslab_id || '',
        });
        clearErrors();
        setShowCreateDialog(true);
    };

    const openClassDetail = (cls: ClassItem) => {
        router.get(route('classes.show', cls.id));
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (editingClass) {
            put(route('classes.update', editingClass.id), {
                onSuccess: () => setShowCreateDialog(false),
            });
        } else {
            post(route('classes.store'), {
                onSuccess: () => setShowCreateDialog(false),
            });
        }
    };

    const deleteClass = (cls: ClassItem) => {
        if (confirm(`Hapus kelas "${cls.name}"?`)) {
            router.delete(route('classes.destroy', cls.id));
        }
    };

    const columns = useMemo<ColumnDef<ClassItem>[]>(() => [
        {
            accessorKey: 'course.name',
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
                <Link href={route('courses.show', row.original.course_id)} className="text-sky-600 hover:underline font-medium">
                    {row.original.course?.name || '-'}
                </Link>
            ),
        },
        {
            accessorKey: 'name',
            size: 100,
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Kelas
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => (
                <Link href={route('classes.show', row.original.id)} className="flex justify-center text-sky-600 hover:underline font-semibold">
                    {row.original.name}
                </Link>
            ),
        },
        {
            accessorKey: 'semester',
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Semester
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => (
                <Badge variant="outline" className="font-normal">{row.original.semester}</Badge>
            ),
        },
        {
            accessorKey: 'aslab.name',
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Pengampu
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => row.original.aslab?.name || '-',
        },
        {
            accessorKey: 'students_count',
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Praktikan
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => `${row.original.students_count} praktikan`,
        },
        {
            accessorKey: 'show_action',
            size: 50,
            header: () => <div></div>,
            cell: ({ row }) => {
                const cls = row.original;
                return (
                    <div className="flex items-center justify-center">
                        <Button
                            variant="ghost"
                            className="p-0 h-auto border-none shadow-none hover:bg-transparent"
                            onClick={() => openClassDetail(cls)}
                        >
                            <Eye className="text-slate-500 w-4 h-4" />
                        </Button>
                    </div>
                );
            },
        },
        {
            accessorKey: 'edit_action',
            size: 50,
            header: () => <div></div>,
            cell: ({ row }) => {
                const cls = row.original;
                return (
                    <div className="flex items-center justify-center">
                        <Button
                            variant="ghost"
                            className="p-0 h-auto border-none shadow-none hover:bg-transparent"
                            onClick={() => openEdit(cls)}
                        >
                            <SquarePen className="text-slate-500 w-4 h-4" />
                        </Button>
                    </div>
                );
            },
        },
        {
            accessorKey: 'delete_action',
            size: 50,
            header: () => <div></div>,
            cell: ({ row }) => {
                const cls = row.original;
                return (
                    <div className="flex items-center justify-center">
                        <Button
                            variant="ghost"
                            className="p-0 h-auto border-none shadow-none hover:bg-transparent"
                            onClick={() => deleteClass(cls)}
                        >
                            <Trash2 className="text-slate-500 w-4 h-4" />
                        </Button>
                    </div>
                );
            },
        },
    ], []);

    return (
        <AuthenticatedLayout>
            <Head title="Daftar Kelas - Admin" />

            <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50/50">
                {/* Sidebar Admin */}
                <div className="w-64 shrink-0 hidden lg:block border-r border-slate-200/80 bg-white">
                    <Sidebar
                        items={getAdminSidebarItems()}
                        activeId="daftar-kelas"
                        className="w-full h-full border-none rounded-none"
                    />
                </div>

                {/* Sidebar Mobile View */}
                <div className="block lg:hidden w-full px-4 pt-4">
                    <Sidebar
                        items={getAdminSidebarItems()}
                        activeId="daftar-kelas"
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
                                <BreadcrumbPage className="font-medium text-sky-600">Daftar Kelas</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <Title title="Daftar Seluruh Kelas" subtitle="Ringkasan dan Informasi Kelas Praktikum" />

                        <Button onClick={openCreate} className="bg-sky-500 hover:bg-sky-600 text-white gap-1.5 shadow-sm self-start sm:self-auto">
                            <Plus className="w-4 h-4" />
                            <span>Tambah Kelas</span>
                        </Button>
                    </div>

                    <DataTable
                        tableTitle="Data Kelas Praktikum"
                        columns={columns}
                        data={classes}
                        searchPlaceholder="Cari kelas, mata kuliah, atau aslab..."
                    />
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingClass ? 'Edit Kelas' : 'Tambah Kelas Praktikum'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4 pt-2">
                        <div>
                            <label className="text-sm font-medium block mb-1">Mata Kuliah</label>
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full justify-between font-normal border-slate-200 text-left bg-white"
                                        >
                                            <span className={courses.find((c) => c.id === Number(data.course_id)) ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                                                {courses.find((c) => c.id === Number(data.course_id))
                                                    ? `${courses.find((c) => c.id === Number(data.course_id))?.code} - ${courses.find((c) => c.id === Number(data.course_id))?.name}`
                                                    : 'Pilih Mata Kuliah'}
                                            </span>
                                            <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                                        </Button>
                                    }
                                />
                                <DropdownMenuContent className="w-[var(--anchor-width)] max-h-60 overflow-y-auto bg-white border border-slate-200 shadow-md p-1 z-[60] pointer-events-auto">
                                    <DropdownMenuGroup>
                                        {courses.map((course) => (
                                            <DropdownMenuItem
                                                key={course.id}
                                                onClick={() => setData('course_id', course.id)}
                                                className={`cursor-pointer px-3 py-2 text-sm rounded-md transition-colors ${Number(data.course_id) === course.id
                                                    ? 'bg-sky-50 text-sky-700 font-medium'
                                                    : 'hover:bg-slate-100 text-slate-700'
                                                    }`}
                                            >
                                                <LaptopMinimal />
                                                {course.code} - {course.name}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {errors.course_id && <p className="text-sm text-red-500 mt-1">{errors.course_id}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium block mb-1">Nama Kelas</label>
                            <input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                type="text"
                                placeholder="Contoh: Kelas A"
                                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium block mb-1">Semester</label>
                            <input
                                value={data.semester}
                                onChange={(e) => setData('semester', e.target.value)}
                                type="text"
                                placeholder="Contoh: Ganjil 2024/2025"
                                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                            {errors.semester && <p className="text-sm text-red-500 mt-1">{errors.semester}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-medium block mb-1">Asisten Laboratorium</label>
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full justify-between font-normal border-slate-200 text-left bg-white"
                                        >
                                            <span className={aslabs.find((a) => a.id === Number(data.aslab_id)) ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                                                <UserIcon className="inline-block w-4 h-3 mr-2" />
                                                {aslabs.find((a) => a.id === Number(data.aslab_id))
                                                    ? `${aslabs.find((a) => a.id === Number(data.aslab_id))?.name} (${aslabs.find((a) => a.id === Number(data.aslab_id))?.email})`
                                                    : 'Pilih Asisten Laboratorium'}
                                            </span>
                                            <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                                        </Button>
                                    }
                                />
                                <DropdownMenuContent className="w-[var(--anchor-width)] max-h-60 overflow-y-auto bg-white border border-slate-200 shadow-md p-1 z-[60] pointer-events-auto">
                                    <DropdownMenuGroup>
                                        {aslabs.map((aslab) => (
                                            <DropdownMenuItem
                                                key={aslab.id}
                                                onClick={() => setData('aslab_id', aslab.id)}
                                                className={`cursor-pointer px-3 py-2 text-sm rounded-md transition-colors ${Number(data.aslab_id) === aslab.id
                                                    ? 'bg-sky-50 text-sky-700 font-medium'
                                                    : 'hover:bg-slate-100 text-slate-700'
                                                    }`}
                                            >
                                                <UserIcon></UserIcon>
                                                {aslab.name} ({aslab.email})
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {errors.aslab_id && <p className="text-sm text-red-500 mt-1">{errors.aslab_id}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>Batal</Button>
                            <Button type="submit" className="bg-sky-600 hover:bg-sky-700 text-white" disabled={processing}>
                                {editingClass ? 'Simpan Perubahan' : 'Buat Kelas'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
