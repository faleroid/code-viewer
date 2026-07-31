import { LayoutGrid, FileCheck, PlusCircle, CheckSquare } from 'lucide-react';
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
            icon: LayoutGrid,
            href: getHref('dashboard', '/dashboard'),
        },
        {
            id: 'submission',
            label: 'SUBMISSION',
            icon: FileCheck,
            defaultOpen: true,
            children: [
                { id: 'buat-tugas', label: 'Buat Tugas', icon: PlusCircle, href: getHref('courses.index', '/courses') },
                { id: 'review', label: 'Review', icon: CheckSquare, href: getHref('submissions.index', '/submissions') },
            ],
        },
    ];
};
