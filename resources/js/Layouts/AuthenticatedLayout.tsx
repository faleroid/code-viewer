import React, { PropsWithChildren, ReactNode, useState, useEffect } from 'react';
import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { Search, Bell, Monitor, Headphones, ChevronDown, GraduationCap, Plus } from 'lucide-react';
import QuickAssignmentModal from '@/Components/QuickAssignmentModal';

const LogoEmblem = () => (
    <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
            <div className="text-md font-semibold text-sky-600">Lab Docs</div>
            <div className="text-xs text-slate-400">Informatics</div>
        </div>
    </div>
);

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const pageProps = usePage().props as any;
    const { auth, flash, courses = [], classes = [], rubricTemplates = [] } = pageProps;
    const user = auth?.user;
    const isAslab = user?.role === 'aslab' || user?.role === 'admin';

    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [showHeaderQuickModal, setShowHeaderQuickModal] = useState(false);
    const [flashMessage, setFlashMessage] = useState<string | null>(null);
    const [showFlash, setShowFlash] = useState(false);

    useEffect(() => {
        const msg = flash?.success || flash?.error;
        if (msg) {
            setFlashMessage(msg);
            setShowFlash(true);
            const timer = setTimeout(() => setShowFlash(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const getInitials = (name?: string) => {
        if (!name) return 'AF';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
            {/* Top Bar Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 h-16 flex items-center shrink-0">
                <div className="w-full flex items-center justify-between">
                    {/* Left Brand / Logo Area (Aligned with Sidebar) */}
                    <div className="w-64 shrink-0 px-6 h-16 flex items-center border-r border-slate-200/80">
                        <Link href={route('dashboard')}>
                            <LogoEmblem />
                        </Link>
                    </div>

                    {/* Middle Section: Page Title & K Badge */}
                    <div className="flex items-center gap-3 px-6 flex-1 min-w-0">
                        <div className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-[11px] font-semibold text-slate-400 select-none bg-slate-50">
                            K
                        </div>
                        <span className="text-sm font-semibold text-slate-800 truncate">
                            Dashboard
                        </span>
                    </div>

                    {/* Right Section: Action Icons & User Dropdown */}
                    <div className="flex items-center gap-3 px-6 shrink-0">
                        {/* Search Shortcut */}
                        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-slate-100/70 text-slate-400 rounded-md text-xs font-mono border border-slate-200/60 cursor-pointer hover:bg-slate-100 transition-colors">
                            <span>Ctrl</span>
                            <span>K</span>
                        </div>

                        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
                            <Search className="w-4 h-4" />
                        </button>

                        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors relative">
                            <Bell className="w-4 h-4" />
                        </button>

                        {/* User Role Pill */}
                        {user?.role && (
                            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 capitalize">
                                {user.role}
                            </span>
                        )}

                        {/* User Profile Avatar with Initials & Dropdown */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button type="button" className="flex items-center gap-1.5 focus:outline-none group">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:ring-2 group-hover:ring-emerald-300 transition-all">
                                        {getInitials(user?.name)}
                                    </div>
                                    <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                                        {user?.name || 'Mahasiswa Test'}
                                    </span>
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>
                                    Profile
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                >
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>
            </header>

            {showFlash && flashMessage && (
                <div className="fixed top-4 right-4 z-50 max-w-sm rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800 shadow-lg transition-all duration-300">
                    {flashMessage}
                </div>
            )}

            <main className="flex-1 flex flex-col">{children}</main>

            {isAslab && (
                <QuickAssignmentModal
                    open={showHeaderQuickModal}
                    onOpenChange={setShowHeaderQuickModal}
                    courses={courses}
                    classes={classes}
                    rubricTemplates={rubricTemplates}
                />
            )}
        </div>
    );
}
