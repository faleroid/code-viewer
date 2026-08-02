import { LayoutDashboard, FolderKanban, FileCode2, History, Award } from 'lucide-react';
import { SidebarNavItem } from './types';

export const getStudentSidebarItems = (): SidebarNavItem[] => {
    const getHref = (routeName: string, fallback: string) => {
        try {
            return typeof route === 'function' ? route(routeName) : fallback;
        } catch {
            return fallback;
        }
    };

    return [
        {
            id: 'dashboard',
            label: 'DASHBOARD',
            icon: LayoutDashboard,
            href: getHref('dashboard', '/dashboard'),
        },
        {
            id: 'tugas',
            label: 'TUGAS',
            icon: FolderKanban,
            defaultOpen: true,
            children: [
                { id: 'daftar-tugas', label: 'Daftar Tugas', icon: FileCode2, href: getHref('assignments.index', '/assignments') },
                { id: 'riwayat-tugas', label: 'Riwayat Submission', icon: History, href: getHref('assignments.history', '/assignments/history') },
                { id: 'nilai-tugas', label: 'Nilai & Feedback', icon: Award, href: getHref('assignments.grades', '/assignments/grades') },
            ],
        },
    ];
};
