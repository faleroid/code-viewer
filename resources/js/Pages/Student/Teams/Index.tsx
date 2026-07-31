import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Title from '@/Components/Title';
import { Sidebar } from '@/Components/Sidebar';
import { getStudentSidebarItems } from '@/Components/Sidebar/studentNavigation';
import { Users } from 'lucide-react';

export default function TeamsIndex() {
    return (
        <AuthenticatedLayout>
            <Head title="Daftar Tim - Mahasiswa" />

            <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50/50">
                {/* Sidebar Mahasiswa (Desktop) */}
                <div className="w-64 shrink-0 hidden lg:block border-r border-slate-200/80 bg-white">
                    <Sidebar
                        items={getStudentSidebarItems()}
                        activeId="daftar-tim"
                        className="w-full h-full border-none rounded-none"
                    />
                </div>

                {/* Sidebar Mobile View */}
                <div className="block lg:hidden w-full px-4 pt-4">
                    <Sidebar
                        items={getStudentSidebarItems()}
                        activeId="daftar-tim"
                        className="w-full bg-white border border-slate-200/80 rounded-2xl p-3"
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 p-6 md:p-8 space-y-6 max-w-7xl">
                    <Title
                        title="Daftar Tim Kelompok"
                        subtitle="Daftar seluruh tim kelompok praktikum yang terdaftar"
                    />

                    <div className="rounded-2xl bg-white border border-slate-200/80 p-8 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Daftar Tim Kelompok</h3>
                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                            Informasi tim dan pembagian kelompok praktikum kelas Anda akan ditampilkan di sini.
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
