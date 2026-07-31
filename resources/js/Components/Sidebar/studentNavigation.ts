import { LayoutGrid, ClipboardList, Users } from 'lucide-react';
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
            icon: LayoutGrid,
            href: getHref('dashboard', '/dashboard'),
        },
        {
            id: 'tugas',
            label: 'TUGAS',
            icon: ClipboardList,
            defaultOpen: true,
            children: [
                { id: 'daftar-tugas', label: 'Daftar Tugas', href: getHref('assignments.index', '/assignments') },
                { id: 'riwayat-tugas', label: 'Riwayat', href: getHref('assignments.history', '/assignments/history') },
                { id: 'nilai-tugas', label: 'Nilai', href: getHref('assignments.grades', '/assignments/grades') },
            ],
        },
        {
            id: 'tim',
            label: 'TIM',
            icon: Users,
            defaultOpen: true,
            children: [
                { id: 'daftar-tim', label: 'Daftar Tim', href: getHref('teams.index', '/teams') },
                { id: 'tim-saya', label: 'Tim Saya', href: getHref('teams.my-team', '/teams/my-team') },
            ],
        },
    ];
};
