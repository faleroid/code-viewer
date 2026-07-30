import React, { useState, FormEvent } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import Title from '@/Components/Title';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';

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

    return (
        <AuthenticatedLayout>
            <Head title="Mata Kuliah" />

            <div className="px-12 pb-12">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <Title title="Manajemen Mata Kuliah" subtitle="Rangkuman dan Informasi Praktikum" />
                        <Button onClick={openCreate}>+ Tambah Mata Kuliah</Button>
                    </div>
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kode</TableHead>
                                        <TableHead>Nama Mata Kuliah</TableHead>
                                        <TableHead>Jumlah Kelas</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {courses.map((course) => (
                                        <TableRow key={course.id}>
                                            <TableCell className="font-mono font-medium">{course.code}</TableCell>
                                            <TableCell>
                                                <Link href={route('courses.show', course.id)} className="text-blue-600 hover:underline font-medium">
                                                    {course.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{course.lab_classes_count} kelas</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="sm" variant="outline" onClick={() => openEdit(course)}>Edit</Button>
                                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => deleteCourse(course)}>Hapus</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {courses.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">Belum ada mata kuliah.</TableCell>
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
                        <DialogTitle>{editingCourse ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4 pt-2">
                        <div>
                            <label className="text-sm font-medium block mb-1">Kode</label>
                            <input
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                type="text"
                                placeholder="IF2001"
                                className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.code && <p className="text-sm text-red-500 mt-1">{errors.code}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Nama Mata Kuliah</label>
                            <input
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                type="text"
                                placeholder="Pemrograman Web"
                                className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>Batal</Button>
                            <Button type="submit" disabled={processing}>{editingCourse ? 'Simpan' : 'Buat'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
