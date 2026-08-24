import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import StatCard from '@/Components/StatCardHexagon';
import Title from '@/Components/Title';
import { BookOpen, Clock, CheckCircle2, ArrowRight, ClipboardList } from 'lucide-react';
import { Sidebar } from '@/Components/Sidebar';
import { getStudentSidebarItems } from '@/Components/Sidebar/studentNavigation';
import { Highlighter } from "@/Components/ui/highlighter"

interface StudentDashboardProps {
    classes?: any[];
    assignments?: any[];
    completedCount?: number;
}

export default function StudentDashboard({
    classes = [],
    assignments = [],
    completedCount = 0,
}: StudentDashboardProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Student Dashboard" />

            <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50/50">
                {/* Sidebar Mahasiswa */}
                <div className="w-64 shrink-0 hidden lg:block border-r border-slate-200/80 bg-white sticky top-16 h-[calc(100vh-4rem)] self-start">
                    <Sidebar
                        items={getStudentSidebarItems()}
                        activeId="dashboard"
                        className="w-full h-full border-none rounded-none"
                    />
                </div>

                {/* Sidebar Mobile View */}
                <div className="block lg:hidden w-full px-4 pt-4">
                    <Sidebar
                        items={getStudentSidebarItems()}
                        activeId="dashboard"
                        className="w-full bg-white border border-slate-200/80 rounded-2xl p-3"
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 p-6 md:p-8 space-y-6 max-w-7xl">
                    <Title
                        title="Dashboard Mahasiswa"
                        subtitle="Rangkuman Data dan Informasi Praktikum"
                    />

                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <StatCard
                            title="Akademik"
                            value={classes ? classes.length : 0}
                            subtitle="Kelas Dikuti"
                            icon={BookOpen}
                            variant="sky"
                        />

                        <StatCard
                            title="Tugas Aktif"
                            value={assignments ? assignments.length : 0}
                            subtitle="Tugas Praktikum"
                            icon={Clock}
                            variant="orange"
                        />

                        <StatCard
                            title="Tugas Selesai"
                            value={completedCount}
                            subtitle="Sudah Dikumpulkan"
                            icon={CheckCircle2}
                            variant="purple"
                        />
                    </div>

                    {/* Quick Access Card to Assignments */}
                    <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                                <ClipboardList className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-slate-800">Daftar Tugas Praktikum</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Tabel data tugas praktikum sekarang dapat diakses secara khusus melalui menu Daftar Tugas.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/assignments"
                            className="inline-flex items-center gap-2 px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors shrink-0"
                        >
                            <span>Buka Daftar Tugas</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
