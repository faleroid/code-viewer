import React, { useState, FormEvent } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { Sidebar } from '@/Components/Sidebar';
import { getAdminSidebarItems } from '@/Components/Sidebar/adminNavigation';
import { ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem } from '@/Components/ui/dropdown-menu';

interface LabClass {
    id: number;
    name: string;
    semester: string;
    aslab_id: number;
    aslab?: { name: string; email: string };
    students_count: number;
}

interface Course {
    id: number;
    code: string;
    name: string;
    lab_classes: LabClass[];
}

export default function CoursesShow({
    course,
    aslabs = [],
}: {
    course: Course;
    aslabs?: Array<{ id: number; name: string; email: string }>;
}) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingClass, setEditingClass] = useState<LabClass | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        course_id: course.id,
        name: '',
        semester: '',
        aslab_id: '' as string | number,
    });

    const openCreate = () => {
        reset();
        clearErrors();
        setData('course_id', course.id);
        setEditingClass(null);
        setShowCreateDialog(true);
    };

    const openEdit = (cls: LabClass) => {
        setEditingClass(cls);
        setData({
            course_id: course.id,
            name: cls.name,
            semester: cls.semester,
            aslab_id: cls.aslab_id,
        });
        clearErrors();
        setShowCreateDialog(true);
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

    const deleteClass = (cls: LabClass) => {
        if (confirm(`Hapus kelas "${cls.name}"?`)) {
            router.delete(route('classes.destroy', cls.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <Link href={route('courses.index')} className="text-sm text-gray-500 hover:underline mb-1 inline-block">
                            &larr; Kembali ke Daftar Mata Kuliah
                        </Link>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            <span className="text-gray-500 font-normal mr-2">{course.code}</span> {course.name}
                        </h2>
                    </div>
                    <Button onClick={openCreate}>+ Tambah Kelas</Button>
                </div>
            }
        >
            <Head title={course.name} />

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
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Kelas</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead>Asisten Laboratorium</TableHead>
                                        <TableHead>Jumlah Mahasiswa</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {course.lab_classes?.map((cls) => (
                                        <TableRow key={cls.id}>
                                            <TableCell>
                                                <Link href={route('classes.show', cls.id)} className="text-sky-600 hover:underline font-medium">
                                                    {cls.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{cls.semester}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {cls.aslab?.name || '-'}
                                            </TableCell>
                                            <TableCell>{cls.students_count} mahasiswa</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="sm" variant="outline" onClick={() => openEdit(cls)}>Edit</Button>
                                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => deleteClass(cls)}>Hapus</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!course.lab_classes || course.lab_classes.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">Belum ada kelas untuk mata kuliah ini.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingClass ? 'Edit Kelas' : 'Tambah Kelas'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4 pt-2">
                        <div>
                            <label className="text-sm font-medium block mb-1">Nama Kelas</label>
                            <input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                type="text"
                                placeholder="Kelas A"
                                className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Semester</label>
                            <input
                                value={data.semester}
                                onChange={(e) => setData('semester', e.target.value)}
                                type="text"
                                placeholder="Ganjil 2024/2025"
                                className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                            {errors.semester && <p className="text-sm text-red-500 mt-1">{errors.semester}</p>}
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
                                            <span className={aslabs.find((a) => a.id === Number(data.aslab_id)) ? 'text-slate-800 font-medium' : 'text-slate-400'}>
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
                            <Button type="submit" disabled={processing}>{editingClass ? 'Simpan' : 'Buat'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
