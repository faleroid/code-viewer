import React, { useState, FormEvent } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { Sidebar } from '@/Components/Sidebar';
import { getAdminSidebarItems } from '@/Components/Sidebar/adminNavigation';

interface Student {
    id: number;
    name: string;
    nim: string;
    email: string;
}

interface Assignment {
    id: number;
    title: string;
    deadline: string;
    max_score: number;
}

interface Module {
    id: number;
    title: string;
    order?: number;
    assignments?: Assignment[];
}

interface LabClass {
    id: number;
    name: string;
    semester: string;
    course: { id: number; name: string };
    modules?: Module[];
    students?: Student[];
}

export default function ClassesShow({
    labClass,
    availableStudents = [],
}: {
    labClass: LabClass;
    availableStudents?: Student[];
}) {
    // Module Form State
    const [showModuleDialog, setShowModuleDialog] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const moduleForm = useForm({ title: '', order: '' as string | number });

    const openModuleCreate = () => {
        moduleForm.reset();
        setEditingModule(null);
        setShowModuleDialog(true);
    };

    const openModuleEdit = (mod: Module) => {
        setEditingModule(mod);
        moduleForm.setData({
            title: mod.title,
            order: mod.order ?? '',
        });
        setShowModuleDialog(true);
    };

    const submitModule = (e: FormEvent) => {
        e.preventDefault();
        if (editingModule) {
            moduleForm.put(route('modules.update', editingModule.id), {
                onSuccess: () => setShowModuleDialog(false),
            });
        } else {
            moduleForm.post(route('modules.store', { lab_class_id: labClass.id }), {
                onSuccess: () => setShowModuleDialog(false),
            });
        }
    };

    const deleteModule = (mod: Module) => {
        if (confirm(`Hapus modul "${mod.title}"?`)) {
            router.delete(route('modules.destroy', mod.id));
        }
    };

    // Assignment Form State
    const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
    const assignmentForm = useForm({
        module_id: '' as string | number,
        title: '',
        description: '',
        deadline: '',
        grading_method: 'score',
        max_score: 100,
    });

    const openAssignmentCreate = (moduleId: number) => {
        assignmentForm.reset();
        assignmentForm.setData('module_id', moduleId);
        setShowAssignmentDialog(true);
    };

    const submitAssignment = (e: FormEvent) => {
        e.preventDefault();
        assignmentForm.post(route('assignments.store'), {
            onSuccess: () => setShowAssignmentDialog(false),
        });
    };

    const deleteAssignment = (assign: Assignment) => {
        if (confirm(`Hapus tugas "${assign.title}"?`)) {
            router.delete(route('assignments.destroy', assign.id));
        }
    };

    // Student Enrollment State
    const [showEnrollDialog, setShowEnrollDialog] = useState(false);
    const enrollForm = useForm<{ student_ids: number[] }>({ student_ids: [] });

    const submitEnroll = (e: FormEvent) => {
        e.preventDefault();
        enrollForm.post(route('classes.enroll', labClass.id), {
            onSuccess: () => {
                setShowEnrollDialog(false);
                enrollForm.reset();
            },
        });
    };

    const removeStudent = (student: Student) => {
        if (confirm(`Keluarkan ${student.name} dari kelas?`)) {
            router.delete(route('classes.removeStudent', { class: labClass.id, student: student.id }));
        }
    };

    const toggleStudentSelection = (studentId: number) => {
        const current = enrollForm.data.student_ids;
        if (current.includes(studentId)) {
            enrollForm.setData('student_ids', current.filter((id) => id !== studentId));
        } else {
            enrollForm.setData('student_ids', [...current, studentId]);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <Link href={route('courses.show', labClass.course.id)} className="text-sm text-gray-500 hover:underline mb-1 inline-block">
                            &larr; {labClass.course.name}
                        </Link>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Kelas {labClass.name}
                            <Badge variant="outline" className="ml-2 align-middle">{labClass.semester}</Badge>
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title={labClass.name} />

            <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50/50">
                {/* Sidebar Admin */}
                <div className="w-64 shrink-0 hidden lg:block border-r border-slate-200/80 bg-white">
                    <Sidebar
                        items={getAdminSidebarItems()}
                        activeId="buat-tugas"
                        className="w-full h-full border-none rounded-none"
                    />
                </div>

                {/* Sidebar Mobile View */}
                <div className="block lg:hidden w-full px-4 pt-4">
                    <Sidebar
                        items={getAdminSidebarItems()}
                        activeId="buat-tugas"
                        className="w-full bg-white border border-slate-200/80 rounded-2xl p-3"
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 p-6 md:p-8 space-y-6 max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Content: Modules & Assignments */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-800">Modul Pembelajaran</h3>
                            <Button onClick={openModuleCreate} size="sm">+ Tambah Modul</Button>
                        </div>

                        {labClass.modules?.map((mod, index) => (
                            <Card key={mod.id}>
                                <CardHeader className="bg-gray-50 border-b py-3 px-4 flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-base font-semibold">
                                        Modul {mod.order || index + 1}: {mod.title}
                                    </CardTitle>
                                    <div className="space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => openModuleEdit(mod)}>Edit</Button>
                                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800 hover:bg-red-50" onClick={() => deleteModule(mod)}>Hapus</Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    {mod.assignments && mod.assignments.length > 0 ? (
                                        <div className="space-y-3 mb-4">
                                            {mod.assignments.map((assign) => (
                                                <div key={assign.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50 transition">
                                                    <div>
                                                        <Link href={route('assignments.show', assign.id)} className="font-medium text-sky-600 hover:underline block">
                                                            {assign.title}
                                                        </Link>
                                                        <span className="text-xs text-gray-500">Tenggat: {new Date(assign.deadline).toLocaleString()} • Max: {assign.max_score}</span>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800" onClick={() => deleteAssignment(assign)}>Hapus</Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500 italic mb-4">Belum ada tugas di modul ini.</div>
                                    )}

                                    <Button variant="outline" size="sm" className="w-full border-dashed" onClick={() => openAssignmentCreate(mod.id)}>
                                        + Tambah Tugas
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}

                        {(!labClass.modules || labClass.modules.length === 0) && (
                            <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500 mb-2">Belum ada modul di kelas ini.</p>
                                <Button onClick={openModuleCreate} variant="outline">Buat Modul Pertama</Button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Students */}
                    <div>
                        <Card className="sticky top-6">
                            <CardHeader className="pb-3 border-b">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">Daftar Mahasiswa</CardTitle>
                                    <Badge>{labClass.students?.length || 0}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-[500px] overflow-y-auto">
                                    {labClass.students?.map((student) => (
                                        <div key={student.id} className="flex justify-between items-center p-3 border-b hover:bg-gray-50">
                                            <div>
                                                <div className="font-medium text-sm">{student.name}</div>
                                                <div className="text-xs text-gray-500">{student.nim} • {student.email}</div>
                                            </div>
                                            <button onClick={() => removeStudent(student)} className="text-gray-400 hover:text-red-600 p-1" title="Keluarkan">
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                    {(!labClass.students || labClass.students.length === 0) && (
                                        <div className="p-4 text-center text-sm text-gray-500">
                                            Belum ada mahasiswa.
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 border-t bg-gray-50">
                                    <Button onClick={() => setShowEnrollDialog(true)} className="w-full">Tambahkan Mahasiswa</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Module Dialog */}
            <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingModule ? 'Edit Modul' : 'Tambah Modul'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitModule} className="space-y-4 pt-2">
                        <div>
                            <label className="text-sm font-medium block mb-1">Judul Modul</label>
                            <input
                                value={moduleForm.data.title}
                                onChange={(e) => moduleForm.setData('title', e.target.value)}
                                type="text"
                                className="w-full rounded-md border px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Urutan (Opsional)</label>
                            <input
                                value={moduleForm.data.order}
                                onChange={(e) => moduleForm.setData('order', e.target.value)}
                                type="number"
                                className="w-full rounded-md border px-3 py-2 text-sm"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowModuleDialog(false)}>Batal</Button>
                            <Button type="submit" disabled={moduleForm.processing}>Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Assignment Dialog */}
            <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Tambah Tugas</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitAssignment} className="space-y-4 pt-2">
                        <div>
                            <label className="text-sm font-medium block mb-1">Judul Tugas</label>
                            <input
                                value={assignmentForm.data.title}
                                onChange={(e) => assignmentForm.setData('title', e.target.value)}
                                type="text"
                                className="w-full rounded-md border px-3 py-2 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Deskripsi</label>
                            <textarea
                                value={assignmentForm.data.description}
                                onChange={(e) => assignmentForm.setData('description', e.target.value)}
                                rows={3}
                                className="w-full rounded-md border px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium block mb-1">Tenggat Waktu (Deadline)</label>
                                <input
                                    value={assignmentForm.data.deadline}
                                    onChange={(e) => assignmentForm.setData('deadline', e.target.value)}
                                    type="datetime-local"
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1">Nilai Maksimal</label>
                                <input
                                    value={assignmentForm.data.max_score}
                                    onChange={(e) => assignmentForm.setData('max_score', parseInt(e.target.value, 10) || 100)}
                                    type="number"
                                    min="1"
                                    max="1000"
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium block mb-1">Metode Penilaian</label>
                            <select
                                value={assignmentForm.data.grading_method}
                                onChange={(e) => assignmentForm.setData('grading_method', e.target.value)}
                                className="w-full rounded-md border px-3 py-2 text-sm bg-white"
                                required
                            >
                                <option value="score">Skor Langsung (Score)</option>
                                <option value="rubric">Rubrik (Rubric)</option>
                            </select>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowAssignmentDialog(false)}>Batal</Button>
                            <Button type="submit" disabled={assignmentForm.processing}>Buat Tugas</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Enroll Dialog */}
            <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambahkan Mahasiswa</DialogTitle>
                        <DialogDescription>Pilih satu atau lebih mahasiswa untuk dimasukkan ke kelas ini.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitEnroll} className="space-y-4 pt-2">
                        <div className="max-h-[300px] overflow-y-auto border rounded-md p-2">
                            {availableStudents.map((student) => (
                                <div key={student.id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                                    <input
                                        type="checkbox"
                                        id={`s_${student.id}`}
                                        checked={enrollForm.data.student_ids.includes(student.id)}
                                        onChange={() => toggleStudentSelection(student.id)}
                                        className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                                    />
                                    <label htmlFor={`s_${student.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                        {student.nim} - {student.name}
                                    </label>
                                </div>
                            ))}
                            {availableStudents.length === 0 && (
                                <div className="text-sm text-gray-500 text-center py-4">
                                    Semua mahasiswa sudah terdaftar di kelas ini.
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowEnrollDialog(false)}>Batal</Button>
                            <Button type="submit" disabled={enrollForm.processing || enrollForm.data.student_ids.length === 0}>Tambahkan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
