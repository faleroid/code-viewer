import React, { useState, FormEvent } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import StatCard from '@/Components/StatCardHexagon';
import Title from '@/Components/Title';
import { BookOpen, Clock, CheckCircle2, ArrowRight, CheckSquare, Plus, Calendar, Play, Layers, Sparkles } from 'lucide-react';
import { Sidebar } from '@/Components/Sidebar';
import { getAdminSidebarItems } from '@/Components/Sidebar/adminNavigation';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import QuickAssignmentModal from '@/Components/QuickAssignmentModal';

interface AdminDashboardProps {
    classes?: any[];
    allClasses?: any[];
    courses?: any[];
    rubricTemplates?: any[];
    pendingSubmissions?: any[];
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

export default function AdminDashboard({
    classes = [],
    allClasses = [],
    courses = [],
    rubricTemplates = [],
    pendingSubmissions = [],
}: AdminDashboardProps) {
    const [showQuickModal, setShowQuickModal] = useState(false);
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{ classId: number; className: string; assignment: any } | null>(null);

    const scheduleForm = useForm({
        is_published: false,
        start_time: '',
        deadline: '',
    });

    const openScheduleModal = (cls: any, assign: any) => {
        setSelectedItem({ classId: cls.id, className: cls.name, assignment: assign });
        const currentSched = assign.class_schedules?.[0] || assign.classSchedules?.[0];
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
        if (selectedItem) {
            scheduleForm.post(route('classes.assignments.schedule', { class: selectedItem.classId, assignment: selectedItem.assignment.id }), {
                onSuccess: () => setShowScheduleDialog(false),
            });
        }
    };

    const handleInstantRelease = (clsId: number, assignId: number, title: string, className: string) => {
        if (confirm(`Rilis tugas "${title}" sekarang untuk kelas ${className}? Mahasiswa di kelas ini akan langsung dapat melihat dan mengerjakan tugas.`)) {
            router.post(route('classes.assignments.instant-release', { class: clsId, assignment: assignId }));
        }
    };

    const handleDisableAssignment = (clsId: number, assignId: number, title: string, className: string) => {
        if (confirm(`Nonaktifkan tugas "${title}" untuk kelas ${className}? Mahasiswa tidak akan dapat mengakses tugas ini lagi.`)) {
            router.post(route('classes.assignments.schedule', { class: clsId, assignment: assignId }), {
                is_published: false,
            });
        }
    };

    // Flatten all assignments across classes for quick control table/grid
    const allClassAssignments: Array<{
        classId: number;
        className: string;
        courseName: string;
        moduleTitle: string;
        assignment: any;
        schedule: any;
        isPublished: boolean;
        isFutureSchedule: boolean;
        isStarted: boolean;
        startDate: Date | null;
    }> = [];

    classes.forEach((cls) => {
        if (cls.course && cls.course.modules) {
            cls.course.modules.forEach((mod: any) => {
                if (mod.assignments) {
                    mod.assignments.forEach((assign: any) => {
                        const sched = assign.class_schedules?.[0] || assign.classSchedules?.[0];
                        const isPublished = Boolean(sched?.is_published);
                        const startTime = sched?.start_time;
                        const startDate = startTime ? new Date(typeof startTime === 'string' ? startTime.replace(' ', 'T') : startTime) : null;
                        const isFutureSchedule = Boolean(isPublished && startDate && !isNaN(startDate.getTime()) && startDate > new Date());
                        const isStarted = Boolean(isPublished && !isFutureSchedule);

                        allClassAssignments.push({
                            classId: cls.id,
                            className: cls.name,
                            courseName: cls.course?.name || '-',
                            moduleTitle: mod.title,
                            assignment: assign,
                            schedule: sched,
                            isPublished,
                            isFutureSchedule,
                            isStarted,
                            startDate,
                        });
                    });
                }
            });
        }
    });

    return (
        <AuthenticatedLayout>
            <Head title="Admin Dashboard" />

            <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50/50">
                {/* Sidebar Admin */}
                <div className="w-64 shrink-0 hidden lg:block border-r border-slate-200/80 bg-white sticky top-16 h-[calc(100vh-4rem)] self-start">
                    <Sidebar
                        items={getAdminSidebarItems()}
                        activeId="dashboard"
                        className="w-full h-full border-none rounded-none"
                    />
                </div>

                {/* Sidebar Mobile View */}
                <div className="block lg:hidden w-full px-4 pt-4">
                    <Sidebar
                        items={getAdminSidebarItems()}
                        activeId="dashboard"
                        className="w-full bg-white border border-slate-200/80 rounded-2xl p-3"
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 p-6 md:p-8 space-y-6 max-w-7xl">
                    <Title title="Dashboard Asisten" subtitle="Pusat Kendali Praktikum & Manajemen Tugas" />


                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <StatCard
                            title="Akademik"
                            value={classes ? classes.length : 0}
                            subtitle="Kelas Aktif"
                            icon={BookOpen}
                            variant="sky"
                        />

                        <StatCard
                            title="Penilaian"
                            value={pendingSubmissions ? pendingSubmissions.length : 0}
                            subtitle="Menunggu Review"
                            icon={Clock}
                            variant="orange"
                        />

                        <StatCard
                            title="Tugas Dikelola"
                            value={allClassAssignments.length}
                            subtitle="Total Tugas Kelas"
                            icon={CheckCircle2}
                            variant="green"
                        />
                    </div>

                    {/* Quick Access Card to Submissions Review */}
                    <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                                <CheckSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-800">Antrean Review Submission</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Lihat cepat submission yang belum dinilai
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('submissions.index')}
                            className="inline-flex items-center gap-2 px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-md shadow-xs transition-colors shrink-0"
                        >
                            <span>Lihat Submission</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Quick Assignment Control Center */}
                    <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                    <Layers className="w-5 h-5 text-sky-600" />
                                    Kelola Tugas
                                </h3>
                            </div>
                        </div>

                        {allClassAssignments.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {allClassAssignments.map((item, idx) => (
                                    <div key={`${item.classId}-${item.assignment.id}-${idx}`} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-sky-200 hover:shadow-xs transition space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="font-semibold text-sky-600">
                                                    Kelas {item.className}
                                                </div>
                                                <h4 className="font-semibold text-slate-800 text-sm mt-0.5">
                                                    {item.assignment.title}
                                                </h4>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    Modul {item.moduleTitle}
                                                </div>
                                            </div>
                                            <div>
                                                {item.isPublished ? (
                                                    item.isFutureSchedule ? (
                                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[11px]">
                                                            Dimulai {formatDateWIB(item.startDate)}
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] hover:bg-emerald-50 font-normal">
                                                            Aktif
                                                        </Badge>
                                                    )
                                                ) : (
                                                    <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200 text-[11px]">
                                                        Draft
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-0.5 pt-1 border-t border-slate-100">
                                            <span>Tenggat: <strong>{formatDateWIB(item.schedule?.deadline || item.assignment.deadline)}</strong></span>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                            {item.isStarted ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="w-full border-red-500 hover:bg-white hover:text-red-600 text-red-600 text-xs font-semibold h-8 px-2.5 shadow-xs"
                                                    onClick={() => handleDisableAssignment(item.classId, item.assignment.id, item.assignment.title, item.className)}
                                                    title="Nonaktifkan Tugas untuk Kelas Ini"
                                                >
                                                    <span>Nonaktifkan Tugas</span>
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="w-full bg-sky-500 hover:bg-sky-600 text-white text-xs h-8 px-2.5 gap-1.5 shadow-xs"
                                                        onClick={() => handleInstantRelease(item.classId, item.assignment.id, item.assignment.title, item.className)}
                                                        title="Rilis Tugas Sekarang untuk Kelas Ini"
                                                    >
                                                        <Play className="w-3.5 h-3.5 fill-white" />
                                                        <span>Mulai Sekarang</span>
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="border-sky-500 hover:bg-white hover:text-sky-600 text-sky-600 text-xs font-semibold h-8 px-2.5 gap-1.5 shadow-xs">
                                                        <Link href={route('classes.show', item.classId)} className="text-xs text-sky-600 shrink-0 ml-auto font-medium">
                                                            Detail
                                                        </Link>
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl">
                                <p className="text-slate-500 text-xs mb-3">Belum ada tugas di kelas yang Anda ampu.</p>
                                <Button
                                    onClick={() => setShowQuickModal(true)}
                                    className="bg-sky-500 hover:bg-sky-600 text-white text-xs"
                                >
                                    Buat Tugas Pertama
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Assignment Modal */}
            <QuickAssignmentModal
                open={showQuickModal}
                onOpenChange={setShowQuickModal}
                courses={courses}
                classes={allClasses.length > 0 ? allClasses : classes}
                rubricTemplates={rubricTemplates}
            />

            {/* Schedule Dialog */}
            <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                        <DialogTitle>Atur Jadwal Rilis Tugas</DialogTitle>
                        <DialogDescription>
                            Pengaturan jadwal rilis dan tenggat waktu khusus untuk kelas {selectedItem?.className}.
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
                                id="is_published_chk_dash"
                                checked={scheduleForm.data.is_published}
                                onChange={(e) => scheduleForm.setData('is_published', e.target.checked)}
                                className="rounded border-gray-300 text-sky-600 focus:ring-transparent h-4 w-4"
                            />
                            <label htmlFor="is_published_chk_dash" className="outline-none text-sm font-medium leading-none cursor-pointer text-slate-800">
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
