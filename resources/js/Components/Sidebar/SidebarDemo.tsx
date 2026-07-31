import React, { useState } from 'react';
import {
    LayoutGrid,
    Users,
    FolderKanban,
    Receipt,
    CreditCard,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { SidebarNavItem } from './types';

/**
 * Navigation configuration matching the mockup image:
 * - DASHBOARD (Active top level item)
 * - ANGGOTA (Expanded accordion with Siswa, Guru, Staff, SPMB, Alumni, Pengkinian Data)
 * - ADMINISTRASI (Collapsed accordion)
 * - KEUANGAN (Collapsed accordion)
 * - KARTU (Collapsed accordion)
 */
export const sidebarNavigationData: SidebarNavItem[] = [
    {
        id: 'dashboard',
        label: 'DASHBOARD',
        icon: LayoutGrid,
        href: '/dashboard',
    },
    {
        id: 'anggota',
        label: 'ANGGOTA',
        icon: Users,
        defaultOpen: true,
        children: [
            { id: 'siswa', label: 'Siswa', href: '/anggota/siswa' },
            { id: 'guru', label: 'Guru', href: '/anggota/guru' },
            { id: 'staff', label: 'Staff', href: '/anggota/staff' },
            {
                id: 'spmb',
                label: 'SPMB',
                children: [
                    { id: 'spmb-pendaftaran', label: 'Pendaftaran', href: '/spmb/pendaftaran' },
                    { id: 'spmb-seleksi', label: 'Hasil Seleksi', href: '/spmb/seleksi' },
                ],
            },
            {
                id: 'alumni',
                label: 'Alumni',
                children: [
                    { id: 'alumni-data', label: 'Data Alumni', href: '/alumni/data' },
                    { id: 'alumni-tracer', label: 'Tracer Study', href: '/alumni/tracer' },
                ],
            },
            { id: 'pengkinian-data', label: 'Pengkinian Data', href: '/anggota/pengkinian-data' },
        ],
    },
    {
        id: 'administrasi',
        label: 'ADMINISTRASI',
        icon: FolderKanban,
        children: [
            { id: 'surat-masuk', label: 'Surat Masuk', href: '/administrasi/surat-masuk' },
            { id: 'surat-keluar', label: 'Surat Keluar', href: '/administrasi/surat-keluar' },
            { id: 'arsip', label: 'Arsip Dokumen', href: '/administrasi/arsip' },
        ],
    },
    {
        id: 'keuangan',
        label: 'KEUANGAN',
        icon: Receipt,
        children: [
            { id: 'tagihan', label: 'Tagihan Siswa', href: '/keuangan/tagihan' },
            { id: 'pembayaran', label: 'Riwayat Pembayaran', href: '/keuangan/pembayaran' },
            { id: 'laporan-keuangan', label: 'Laporan Keuangan', href: '/keuangan/laporan' },
        ],
    },
    {
        id: 'kartu',
        label: 'KARTU',
        icon: CreditCard,
        children: [
            { id: 'kartu-pelajar', label: 'Kartu Pelajar', href: '/kartu/pelajar' },
            { id: 'kartu-pegawai', label: 'Kartu Pegawai', href: '/kartu/pegawai' },
            { id: 'cetak-kartu', label: 'Cetak Massal', href: '/kartu/cetak' },
        ],
    },
];

export const SidebarDemo: React.FC = () => {
    const [activeId, setActiveId] = useState<string>('dashboard');

    return (
        <div className="flex min-h-screen bg-slate-100 p-6 gap-6">
            {/* Sidebar Component */}
            <div className="w-64 rounded-2xl bg-white shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">
                <Sidebar
                    items={sidebarNavigationData}
                    activeId={activeId}
                    onSelect={(item) => {
                        console.log('Selected item:', item);
                        setActiveId(item.id);
                    }}
                    className="border-none w-full flex-1"
                />
            </div>

            {/* Content area preview */}
            <div className="flex-1 rounded-2xl bg-white p-8 shadow-sm border border-slate-200/60 flex flex-col justify-center items-center text-center">
                <h2 className="text-2xl font-bold text-slate-800">Preview Komponen Sidebar</h2>
                <p className="text-slate-500 mt-2 max-w-md">
                    Menu aktif saat ini: <span className="font-semibold text-sky-600">{activeId}</span>
                </p>
                <div className="mt-6 p-4 bg-slate-50 rounded-xl text-left font-mono text-xs text-slate-700 max-w-lg overflow-x-auto">
                    <p className="font-bold text-slate-900 mb-2">// Cara penggunaan di komponen Anda:</p>
                    <pre>{`import { Sidebar } from '@/Components/Sidebar';

<Sidebar
  items={navigationItems}
  activeId="${activeId}"
  onSelect={(item) => setActiveId(item.id)}
/>`}</pre>
                </div>
            </div>
        </div>
    );
};
