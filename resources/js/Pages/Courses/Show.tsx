import React, { useState, FormEvent } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';

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

            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
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
                                                <Link href={route('classes.show', cls.id)} className="text-blue-600 hover:underline font-medium">
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
                                className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.semester && <p className="text-sm text-red-500 mt-1">{errors.semester}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Asisten Laboratorium (Pengampu)</label>
                            <select
                                value={data.aslab_id}
                                onChange={(e) => setData('aslab_id', e.target.value)}
                                className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                disabled={editingClass !== null}
                            >
                                <option value="" disabled>Pilih Asisten Laboratorium</option>
                                {aslabs.map((aslab) => (
                                    <option key={aslab.id} value={aslab.id}>
                                        {aslab.name} ({aslab.email})
                                    </option>
                                ))}
                            </select>
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
