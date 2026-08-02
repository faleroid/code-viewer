import { LayoutDashboard, GraduationCap, BookOpen, Layers, Inbox, FileCheck, MessageSquareText, Sliders, FileSpreadsheet } from 'lucide-react';
import { SidebarNavItem } from './types';

export const getAdminSidebarItems = (): SidebarNavItem[] => {
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
            id: 'akademik',
            label: 'AKADEMIK',
            icon: GraduationCap,
            defaultOpen: true,
            children: [
                { id: 'mata-kuliah', label: 'Mata Kuliah', icon: BookOpen, href: getHref('courses.index', '/courses') },
                { id: 'daftar-kelas', label: 'Daftar Kelas', icon: Layers, href: getHref('classes.index', '/classes') },
            ],
        },
        {
            id: 'submission',
            label: 'SUBMISSION',
            icon: Inbox,
            defaultOpen: true,
            children: [
                { id: 'review', label: 'Antrean Review', icon: FileCheck, href: getHref('submissions.index', '/submissions') },
                { id: 'discussions', label: 'Pusat Diskusi', icon: MessageSquareText, href: getHref('discussions.index', '/discussions') },
            ],
        },
        {
            id: 'manajemen',
            label: 'MANAJEMEN',
            icon: Sliders,
            defaultOpen: true,
            children: [
                { id: 'template-rubrik', label: 'Template Rubrik', icon: FileSpreadsheet, href: getHref('rubric-templates.index', '/rubric-templates') },
            ],
        },
    ];
};
