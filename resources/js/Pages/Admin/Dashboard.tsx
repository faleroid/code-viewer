import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import StatCard from '@/Components/StatCard';
import Title from '@/Components/Title';
import { BookOpen, Clock, CheckCircle2, ArrowRight, CheckSquare } from 'lucide-react';
import { Sidebar } from '@/Components/Sidebar';
import { getAdminSidebarItems } from '@/Components/Sidebar/adminNavigation';

interface AdminDashboardProps {
    classes?: any[];
    pendingSubmissions?: any[];
}

export default function AdminDashboard({
    classes = [],
    pendingSubmissions = [],
}: AdminDashboardProps) {
    return (
        <AuthenticatedLayout>
            <Head title="Admin Dashboard" />

            <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50/50">
                {/* Sidebar Admin */}
                <div className="w-64 shrink-0 hidden lg:block border-r border-slate-200/80 bg-white">
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
                    <Title title="Dashboard Asisten" subtitle="Rangkuman dan Informasi Praktikum" />

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
                            title="Riwayat" 
                            value={0} 
                            subtitle="Tugas Dinilai" 
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
                                    Tabel data antrean penilaian tugas mahasiswa dapat diakses secara khusus melalui menu Review di bawah SUBMISSION.
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('submissions.index')}
                            className="inline-flex items-center gap-2 px-4 py-3 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors shrink-0"
                        >
                            <span>Buka Antrean Review</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
