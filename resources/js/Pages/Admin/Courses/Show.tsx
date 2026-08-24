import React, { useState, useMemo, FormEvent } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import DataTable from '@/Components/DataTable';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { Sidebar } from '@/Components/Sidebar';
import { getAdminSidebarItems } from '@/Components/Sidebar/adminNavigation';
import { ChevronDown, Plus, SquarePen, Trash2 } from 'lucide-react';
import Title from '@/Components/Title';
import ClassCard from '@/Components/ClassCard';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem } from '@/Components/ui/dropdown-menu';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb"

interface LabClass {
    id: number;
    name: string;
    semester: string;
    aslab_id: number;
    aslab?: { name: string; email: string };
    students_count: number;
}

interface Module {
    id: number;
    title: string;
    description?: string;
    order?: number;
}

interface Course {
    id: number;
    code: string;
    name: string;
    lab_classes: LabClass[];
    modules: Module[];
}

export default function CoursesShow({
    course,
    aslabs = [],
}: {
    course: Course;
    aslabs?: Array<{ id: number; name: string; email: string }>;
}) {
    // Class Dialog State
    const [showClassDialog, setShowClassDialog] = useState(false);
    const [editingClass, setEditingClass] = useState<LabClass | null>(null);

    const classForm = useForm({
        course_id: course.id,
        name: '',
        semester: '',
        aslab_id: '' as string | number,
    });

    const openClassEdit = (cls: LabClass) => {
        setEditingClass(cls);
        classForm.setData({
            course_id: course.id,
            name: cls.name,
            semester: cls.semester,
            aslab_id: cls.aslab_id,
        });
        classForm.clearErrors();
        setShowClassDialog(true);
    };

    const submitClass = (e: FormEvent) => {
        e.preventDefault();
        if (editingClass) {
            classForm.put(route('classes.update', editingClass.id), {
                onSuccess: () => setShowClassDialog(false),
            });
        } else {
            classForm.post(route('classes.store'), {
                onSuccess: () => setShowClassDialog(false),
            });
        }
    };

    const deleteClass = (cls: LabClass) => {
        if (confirm(`Hapus kelas "${cls.name}"?`)) {
            router.delete(route('classes.destroy', cls.id));
        }
    };

    // Module Dialog State
    const [showModuleDialog, setShowModuleDialog] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);

    const moduleForm = useForm({
        course_id: course.id,
        title: '',
        description: '',
        order: '' as string | number,
    });

    const openModuleCreate = () => {
        moduleForm.reset();
        moduleForm.clearErrors();
        moduleForm.setData({
            course_id: course.id,
            title: '',
            description: '',
            order: (course.modules?.length || 0) + 1,
        });
        setEditingModule(null);
        setShowModuleDialog(true);
    };

    const openModuleEdit = (mod: Module) => {
        setEditingModule(mod);
        moduleForm.setData({
            course_id: course.id,
            title: mod.title,
            description: mod.description || '',
            order: mod.order || 1,
        });
        moduleForm.clearErrors();
        setShowModuleDialog(true);
    };

    const submitModule = (e: FormEvent) => {
        e.preventDefault();
        if (editingModule) {
            moduleForm.put(route('modules.update', editingModule.id), {
                onSuccess: () => setShowModuleDialog(false),
            });
        } else {
            moduleForm.post(route('modules.store'), {
                onSuccess: () => setShowModuleDialog(false),
            });
        }
    };

    const deleteModule = (mod: Module) => {
        if (confirm(`Hapus modul "${mod.title}"?`)) {
            router.delete(route('modules.destroy', mod.id));
        }
    };

    const moduleColumns = useMemo<ColumnDef<Module>[]>(() => [
        {
            accessorKey: 'order',
            size: 80,
            header: ({ column }) => (
                <div
                    className="flex items-center justify-center gap-1 cursor-pointer select-none text-center"
                    onClick={() => column.toggleSorting()}
                >
                    Urutan
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row, table }) => {
                const idx = table.getRowModel().rows.indexOf(row);
                return (
                    <div className="text-center font-medium text-slate-600">
                        Modul {row.original.order || idx + 1}
                    </div>
                );
            },
        },
        {
            accessorKey: 'title',
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Judul Modul
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => (
                <span className="font-normal text-slate-800">
                    {row.original.title}
                </span>
            ),
        },
        {
            accessorKey: 'description',
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Deskripsi
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => (
                <span className="text-slate-600 text-sm max-w-xs truncate block">
                    {row.original.description || '-'}
                </span>
            ),
        },
        {
            id: 'edit_action',
            size: 50,
            header: () => <div></div>,
            cell: ({ row }) => {
                const mod = row.original;
                return (
                    <div className="flex items-center justify-center">
                        <Button
                            variant="ghost"
                            className="p-0 h-auto border-none shadow-none hover:bg-transparent"
                            onClick={() => openModuleEdit(mod)}
                        >
                            <SquarePen className="text-slate-500 w-4 h-4" />
                        </Button>
                    </div>
                );
            },
        },
        {
            id: 'delete_action',
            size: 50,
            header: () => <div></div>,
            cell: ({ row }) => {
                const mod = row.original;
                return (
                    <div className="flex items-center justify-center">
                        <Button
                            variant="ghost"
                            className="p-0 h-auto border-none shadow-none hover:bg-transparent"
                            onClick={() => deleteModule(mod)}
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
            <Head title={course.name} />

            <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50/50">
                {/* Sidebar Admin */}
                <div className="w-64 shrink-0 hidden lg:block border-r border-slate-200/80 bg-white sticky top-16 h-[calc(100vh-4rem)] self-start">
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
                <div className="flex-1 min-w-0 p-6 md:p-8 space-y-8 max-w-7xl">

                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink><Link href={route('courses.index')}>Mata Kuliah</Link></BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-medium text-sky-600">{`${course.name}`}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div>
                        <div className='flex justify-between items-center'>
                            <Title
                                title={`${course.code} - ${course.name}`}
                                subtitle={`Data dan Informasi Mata Kuliah ${course.name}`}
                            />
                            <div className="flex items-center gap-2">
                                <Button size="sm" onClick={openModuleCreate} className="bg-sky-500 hover:bg-sky-600 text-white gap-1.5 shadow-sm">
                                    <Plus className="w-4 h-4" />
                                    <span>Tambah Modul</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Section: Kelas Praktikum (Lab Classes) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">Kelas Terkait ({course.lab_classes.length})</h3>
                        </div>

                        {(!course.lab_classes || course.lab_classes.length === 0) ? (
                            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
                                Belum ada kelas praktikum yang terdaftar.
                            </div>
                        ) : (
                            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-thin scrollbar-thumb-slate-200 snap-x">
                                {course.lab_classes.map((cls) => (
                                    <div key={cls.id} className="w-[300px] sm:w-[340px] shrink-0 snap-start">
                                        <ClassCard
                                            labClass={cls}
                                            onEdit={openClassEdit}
                                            onDelete={deleteClass}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Section: Silabus / Modul Praktikum */}
                    <DataTable
                        tableTitle="Modul Praktikum"
                        columns={moduleColumns}
                        data={course.modules || []}
                        searchPlaceholder="Cari modul praktikum..."
                        showExport={false}
                    />
                </div>
            </div>

            {/* Create/Edit Class Dialog */}
            <Dialog open={showClassDialog} onOpenChange={setShowClassDialog}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle>{editingClass ? 'Edit Kelas' : 'Tambah Kelas'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitClass} className="space-y-4 pt-2">
                        <div>
                            <label className="text-sm font-medium block mb-1">Nama Kelas</label>
                            <input
                                value={classForm.data.name}
                                onChange={(e) => classForm.setData('name', e.target.value)}
                                type="text"
                                placeholder="Kelas A"
                                className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                            {classForm.errors.name && <p className="text-sm text-red-500 mt-1">{classForm.errors.name}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Semester</label>
                            <input
                                value={classForm.data.semester}
                                onChange={(e) => classForm.setData('semester', e.target.value)}
                                type="text"
                                placeholder="Ganjil 2024/2025"
                                className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                            {classForm.errors.semester && <p className="text-sm text-red-500 mt-1">{classForm.errors.semester}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Asisten Laboratorium (Pengampu)</label>
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    disabled={editingClass !== null}
                                    render={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full justify-between font-normal border-slate-200 text-left bg-white"
                                            disabled={editingClass !== null}
                                        >
                                            <span className={aslabs.find((a) => a.id === Number(classForm.data.aslab_id)) ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                                                {aslabs.find((a) => a.id === Number(classForm.data.aslab_id))
                                                    ? `${aslabs.find((a) => a.id === Number(classForm.data.aslab_id))?.name} (${aslabs.find((a) => a.id === Number(classForm.data.aslab_id))?.email})`
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
                                                onClick={() => classForm.setData('aslab_id', aslab.id)}
                                                className={`cursor-pointer px-3 py-2 text-sm rounded-md transition-colors ${Number(classForm.data.aslab_id) === aslab.id
                                                    ? 'bg-sky-50 text-sky-700 font-medium'
                                                    : 'hover:bg-slate-100 text-slate-700'
                                                    }`}
                                            >
                                                {aslab.name} ({aslab.email})
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {classForm.errors.aslab_id && <p className="text-sm text-red-500 mt-1">{classForm.errors.aslab_id}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowClassDialog(false)}>Batal</Button>
                            <Button type="submit" disabled={classForm.processing}>{editingClass ? 'Simpan' : 'Buat'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Create/Edit Module Dialog */}
            <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle>{editingModule ? 'Edit Modul Praktikum' : 'Tambah Modul Praktikum'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitModule} className="space-y-4 pt-2">
                        <div>
                            <label className="text-sm font-medium block mb-1">Judul Modul</label>
                            <input
                                value={moduleForm.data.title}
                                onChange={(e) => moduleForm.setData('title', e.target.value)}
                                type="text"
                                placeholder="Modul 1: Pengenalan HTML & CSS"
                                className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                            {moduleForm.errors.title && <p className="text-sm text-red-500 mt-1">{moduleForm.errors.title}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Urutan Modul</label>
                            <input
                                value={moduleForm.data.order}
                                onChange={(e) => moduleForm.setData('order', e.target.value)}
                                type="number"
                                min="1"
                                placeholder="1"
                                className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                            {moduleForm.errors.order && <p className="text-sm text-red-500 mt-1">{moduleForm.errors.order}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Deskripsi Modul (Opsional)</label>
                            <textarea
                                value={moduleForm.data.description}
                                onChange={(e) => moduleForm.setData('description', e.target.value)}
                                rows={3}
                                placeholder="Membahas struktur dasar dokumen HTML dan styling CSS layout..."
                                className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                            {moduleForm.errors.description && <p className="text-sm text-red-500 mt-1">{moduleForm.errors.description}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowModuleDialog(false)}>Batal</Button>
                            <Button type="submit" disabled={moduleForm.processing}>{editingModule ? 'Simpan' : 'Buat'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}

