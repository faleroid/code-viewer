import React, { useState, FormEvent } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import Title from '@/Components/Title';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';
import { Sidebar } from '@/Components/Sidebar';
import { getAdminSidebarItems } from '@/Components/Sidebar/adminNavigation';
import { ChevronDown, Calendar, Play, UsersIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem } from '@/Components/ui/dropdown-menu';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb"

interface Student {
    id: number;
    name: string;
    nim: string;
    email: string;
}

interface ClassSchedule {
    id?: number;
    lab_class_id?: number;
    assignment_id?: number;
    start_time?: string | null;
    deadline?: string | null;
    is_published?: boolean;
}

interface Assignment {
    id: number;
    title: string;
    description?: string;
    deadline: string;
    max_score: number;
    class_schedules?: ClassSchedule[];
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
    aslab_id?: number;
    aslab?: { id?: number; name?: string; email?: string } | null;
    course: { id: number; name: string; modules?: Module[] };
    students?: Student[];
}

const formatDateWIB = (dateInput?: string | Date | null) => {
    if (!dateInput) return '-';
    const date = typeof dateInput === 'string' ? new Date(dateInput.replace(' ', 'T')) : dateInput;
    if (isNaN(date.getTime())) return '-';
    const formatted = new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Jakarta',
    }).format(date);
    return `${formatted.replace(/\./g, ':')} WIB`;
};

const getInitials = (name: string) => {
    if (!name) return 'P';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
};

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

    // Assignment Class Schedule State
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [selectedAssignmentForSchedule, setSelectedAssignmentForSchedule] = useState<Assignment | null>(null);

    const scheduleForm = useForm({
        is_published: false,
        start_time: '',
        deadline: '',
    });

    const openScheduleModal = (assign: Assignment) => {
        setSelectedAssignmentForSchedule(assign);
        const currentSched = assign.class_schedules?.[0];
        scheduleForm.setData({
            is_published: currentSched?.is_published ?? false,
            start_time: currentSched?.start_time ? new Date(currentSched.start_time).toISOString().slice(0, 16) : '',
            deadline: currentSched?.deadline ? new Date(currentSched.deadline).toISOString().slice(0, 16) : (assign.deadline ? new Date(assign.deadline).toISOString().slice(0, 16) : ''),
        });
        scheduleForm.clearErrors();
        setShowScheduleDialog(true);
    };

    const submitSchedule = (e: FormEvent) => {
        e.preventDefault();
        if (selectedAssignmentForSchedule) {
            scheduleForm.post(route('classes.assignments.schedule', { class: labClass.id, assignment: selectedAssignmentForSchedule.id }), {
                onSuccess: () => setShowScheduleDialog(false),
            });
        }
    };

    const handleInstantRelease = (assign: Assignment) => {
        if (confirm(`Rilis tugas "${assign.title}" sekarang untuk kelas ${labClass.name}? Mahasiswa di kelas ini akan langsung dapat melihat dan mengerjakan tugas.`)) {
            router.post(route('classes.assignments.instant-release', { class: labClass.id, assignment: assign.id }));
        }
    };

    const handleDisableAssignment = (assign: Assignment) => {
        if (confirm(`Nonaktifkan tugas "${assign.title}" untuk kelas ${labClass.name}? Mahasiswa tidak akan dapat mengakses tugas ini lagi.`)) {
            router.post(route('classes.assignments.schedule', { class: labClass.id, assignment: assign.id }), {
                is_published: false,
            });
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
        <AuthenticatedLayout>
            <Head title={`Kelas ${labClass.name}`} />

            <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50/50">
                {/* Sidebar Admin */}
                <div className="w-64 shrink-0 hidden lg:block border-r border-slate-200/80 bg-white sticky top-16 h-[calc(100vh-4rem)] self-start">
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
                                <BreadcrumbLink><Link href={route('classes.index')}>Daftar Kelas</Link></BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink><Link href={route('courses.show', labClass.course?.id)}>{labClass.course?.name}</Link></BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-medium text-sky-600">Kelas {`${labClass.name}`}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Main Content: Modules & Assignments */}
                        <div className="md:col-span-2 space-y-6">
                            <Title
                                title={`${labClass.course?.name} - Kelas ${labClass.name}`}
                                subtitle={labClass.aslab ? `Asisten: ${labClass.aslab?.name}` : 'Belum ada Asisten'}
                            />

                            {labClass.course?.modules?.map((mod, index) => (
                                <Card key={mod.id}>
                                    <CardHeader className="bg-gray-50 border-b py-3 px-4 flex flex-row items-center justify-between space-y-0">
                                        <CardTitle className="text-base font-semibold">
                                            Modul {mod.order || index + 1}: {mod.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        {mod.assignments && mod.assignments.length > 0 ? (
                                            <div className="space-y-3 mb-4">
                                                {mod.assignments.map((assign) => {
                                                    const sched = assign.class_schedules?.[0];
                                                    const isPublished = sched?.is_published;
                                                    const startTime = sched?.start_time;
                                                    const startDate = startTime ? new Date(typeof startTime === 'string' ? startTime.replace(' ', 'T') : startTime) : null;
                                                    const isFutureSchedule = Boolean(isPublished && startDate && !isNaN(startDate.getTime()) && startDate > new Date());
                                                    const isStarted = Boolean(isPublished && !isFutureSchedule);

                                                    return (
                                                        <div key={assign.id} className="p-3 border rounded-md hover:bg-slate-50/80 transition space-y-2 bg-white">
                                                            <div className="flex flex-col justify-between gap-6">
                                                                <div>
                                                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                                                        <Link href={route('assignments.show', assign.id)} className="font-semibold text-slate-800 hover:text-sky-600 hover:underline">
                                                                            {assign.title}
                                                                        </Link>
                                                                        {isPublished ? (
                                                                            isFutureSchedule ? (
                                                                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[11px] gap-1">
                                                                                    Dimulai {formatDateWIB(startDate)}
                                                                                </Badge>
                                                                            ) : (
                                                                                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] gap-1 hover:bg-emerald-50 font-normal">
                                                                                    Aktif
                                                                                </Badge>
                                                                            )
                                                                        ) : (
                                                                            <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 text-[11px] gap-1">
                                                                                Draft
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                                                                        <span>Tenggat: <strong>{formatDateWIB(sched?.deadline || assign.deadline)}</strong></span>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                                                                    {isStarted ? (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="w-full border-red-500 hover:bg-white hover:text-red-600 text-red-600 text-xs font-semibold h-8 px-2.5 gap-1.5 shadow-xs"
                                                                            onClick={() => handleDisableAssignment(assign)}
                                                                            title="Nonaktifkan Tugas untuk Kelas Ini"
                                                                        >
                                                                            <span>Nonaktifkan Tugas</span>
                                                                        </Button>
                                                                    ) : (
                                                                        <>
                                                                            <Button
                                                                                size="sm"
                                                                                className="w-full bg-sky-500 hover:bg-sky-600 text-white text-xs h-8 px-2.5 gap-1.5 shadow-xs"
                                                                                onClick={() => handleInstantRelease(assign)}
                                                                                title="Rilis Tugas Sekarang untuk Kelas Ini"
                                                                            >
                                                                                <Play className="w-3.5 h-3.5 fill-white" />
                                                                                <span>Mulai Sekarang</span>
                                                                            </Button>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="text-xs h-8 px-2.5 gap-1.5 text-slate-700 border-slate-200 hover:bg-slate-50"
                                                                                onClick={() => openScheduleModal(assign)}
                                                                            >
                                                                                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                                                                <span>Jadwalkan</span>
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-500 italic mb-4">Belum ada tugas di modul ini untuk kelas ini.</div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}

                            {(!labClass.course?.modules || labClass.course.modules.length === 0) && (
                                <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                                    <p className="text-gray-500 mb-2">Belum ada modul praktikum di silabus mata kuliah ini.</p>
                                    <Link href={route('courses.show', labClass.course?.id)}>
                                        <Button variant="outline">Tambah Modul ke Mata Kuliah</Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Sidebar: Students */}
                        <div>
                            <Card className="sticky top-6">
                                <CardHeader className="pb-3 px-4 border-b">
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-2 items-center">
                                            <UsersIcon className="w-4 h-4" />
                                            <CardTitle className="text-md font-semibold">Praktikan</CardTitle>
                                        </div>
                                        <Badge className='bg-sky-500 hover:'>{labClass.students?.length || 0}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="max-h-[500px] overflow-y-auto">
                                        {labClass.students?.map((student) => (
                                            <div key={student.id} className="flex justify-between items-center p-3 border-b hover:bg-gray-50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-semibold text-xs flex items-center justify-center shrink-0 border border-sky-200 uppercase">
                                                        {getInitials(student.name)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm">{student.name}</div>
                                                        <div className="text-xs text-gray-500">{student.nim}</div>
                                                    </div>
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
                                        <Button onClick={() => setShowEnrollDialog(true)} className="w-full bg-white hover:bg-white border text-sm font-medium border-sky-600 text-sky-600" >Tambah Praktikan</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>


            {/* Enroll Dialog */}
            <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah Praktikan</DialogTitle>
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
                                        className="rounded border-gray-300 text-sky-500 focus:ring-transparent"
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
                            <Button type="submit" className='bg-sky-500 hover:bg-sky-600' disabled={enrollForm.processing || enrollForm.data.student_ids.length === 0}>Tambahkan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Schedule & Release Dialog */}
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle>Atur Jadwal Rilis Tugas</DialogTitle>
                        <DialogDescription>
                            Pengaturan jadwal rilis dan tenggat waktu khusus untuk kelas {labClass.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitSchedule} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium block mb-1">Waktu Mulai</label>
                            <input
                                value={scheduleForm.data.start_time}
                                onChange={(e) => scheduleForm.setData('start_time', e.target.value)}
                                type="datetime-local"
                                className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500"
                            />
                            <p className="text-xs text-slate-500 mt-1">Biarkan kosong jika ingin dibuka langsung saat dipublikasikan.</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium block mb-1">Tenggat Waktu</label>
                            <input
                                value={scheduleForm.data.deadline}
                                onChange={(e) => scheduleForm.setData('deadline', e.target.value)}
                                type="datetime-local"
                                className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="is_published_chk"
                                checked={scheduleForm.data.is_published}
                                onChange={(e) => scheduleForm.setData('is_published', e.target.checked)}
                                className="rounded border-gray-300 text-sky-600 focus:ring-transparent h-4 w-4"
                            />
                            <label htmlFor="is_published_chk" className="outline-none text-sm font-medium leading-none cursor-pointer text-slate-800">
                                Publikasikan
                            </label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowScheduleDialog(false)}>Batal</Button>
                            <Button type="submit" disabled={scheduleForm.processing} className="bg-sky-600 hover:bg-sky-700 text-white">Simpan Jadwal</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
