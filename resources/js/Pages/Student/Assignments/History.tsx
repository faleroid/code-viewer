import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Title from '@/Components/Title';
import { Sidebar } from '@/Components/Sidebar';
import { getStudentSidebarItems } from '@/Components/Sidebar/studentNavigation';
import { CheckCircle2 } from 'lucide-react';

export default function AssignmentsHistory() {
    return (
        <AuthenticatedLayout>
            <Head title="Riwayat Tugas - Mahasiswa" />

            <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50/50">
                {/* Sidebar Mahasiswa (Desktop) */}
                <div className="w-64 shrink-0 hidden lg:block border-r border-slate-200/80 bg-white">
                    <Sidebar
                        items={getStudentSidebarItems()}
                        activeId="riwayat-tugas"
                        className="w-full h-full border-none rounded-none"
                    />
                </div>

                {/* Sidebar Mobile View */}
                <div className="block lg:hidden w-full px-4 pt-4">
                    <Sidebar
                        items={getStudentSidebarItems()}
                        activeId="riwayat-tugas"
                        className="w-full bg-white border border-slate-200/80 rounded-2xl p-3"
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 p-6 md:p-8 space-y-6 max-w-7xl">
                    <Title
                        title="Riwayat Tugas"
                        subtitle="Daftar seluruh tugas yang telah Anda kumpulkan sebelumnya"
                    />

                    <div className="rounded-2xl bg-white border border-slate-200/80 p-8 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Riwayat Pengumpulan Kosong</h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                            Belum ada riwayat tugas yang selesai dikumpulkan. Tugas yang Anda kirimkan akan muncul di sini.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
