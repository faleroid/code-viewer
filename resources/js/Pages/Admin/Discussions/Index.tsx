import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import Title from '@/Components/Title';
import DataTable from '@/Components/DataTable';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Sidebar } from '@/Components/Sidebar';
import { getAdminSidebarItems } from '@/Components/Sidebar/adminNavigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { MessageSquareText, Clock, CheckCircle2, MessageSquare, ExternalLink, Send, UserCheck, AlertCircle } from 'lucide-react';

interface ReplyItem {
    id: number;
    comment: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        role: string;
    };
}

interface DiscussionThread {
    id: number;
    line_number: number;
    comment: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        role: string;
    };
    submission_file_id: number;
    file_path: string;
    submission_id: number;
    student_name: string;
    student_nim: string;
    assignment_title: string;
    class_name: string;
    course_name: string;
    replies_count: number;
    status: 'no_replies' | 'pending_aslab' | 'answered';
    replies: ReplyItem[];
}

export default function AdminDiscussionsIndex({ discussions = [] }: { discussions?: DiscussionThread[] }) {
    const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'answered'>('all');
    const [activeThread, setActiveThread] = useState<DiscussionThread | null>(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate stats
    const stats = useMemo(() => {
        const total = discussions.length;
        const pending = discussions.filter((d) => d.status === 'pending_aslab').length;
        const answered = discussions.filter((d) => d.status === 'answered').length;
        return { total, pending, answered };
    }, [discussions]);

    // Filtered discussions
    const filteredDiscussions = useMemo(() => {
        if (selectedTab === 'pending') {
            return discussions.filter((d) => d.status === 'pending_aslab');
        }
        if (selectedTab === 'answered') {
            return discussions.filter((d) => d.status === 'answered');
        }
        return discussions;
    }, [discussions, selectedTab]);

    const openThreadModal = (thread: DiscussionThread) => {
        setActiveThread(thread);
        setReplyText('');
    };

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeThread || !replyText.trim()) return;

        setIsSubmitting(true);
        router.post(
            route('inline-comments.store'),
            {
                submission_file_id: activeThread.submission_file_id,
                line_number: activeThread.line_number,
                comment: replyText,
                parent_id: activeThread.id,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setReplyText('');
                    setIsSubmitting(false);
                    // Update current active thread local replies visually if needed
                    setActiveThread((prev) => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            status: 'answered',
                            replies_count: prev.replies_count + 1,
                            replies: [
                                ...prev.replies,
                                {
                                    id: Date.now(),
                                    comment: replyText,
                                    created_at: new Date().toISOString(),
                                    user: { id: 0, name: 'Anda (Aslab)', role: 'aslab' },
                                },
                            ],
                        };
                    });
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    const columns = useMemo<ColumnDef<DiscussionThread>[]>(() => [
        {
            accessorKey: 'student_name',
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Mahasiswa & Tugas
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => (
                <div className="space-y-0.5 py-1">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span>{row.original.student_name}</span>
                        <span className="text-xs text-slate-400 font-mono">({row.original.student_nim})</span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                        {row.original.course_name} — {row.original.class_name} • <span className="text-sky-600 font-semibold">{row.original.assignment_title}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'file_path',
            header: 'Berkas Kode & Baris',
            cell: ({ row }) => (
                <div className="space-y-1">
                    <Badge variant="outline" className="font-mono text-[11px] bg-slate-100 text-slate-800 border-slate-200">
                        {row.original.file_path} : Baris {row.original.line_number}
                    </Badge>
                    <p className="text-xs text-slate-600 line-clamp-1 italic max-w-xs">
                        &quot;{row.original.comment}&quot;
                    </p>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status Thread',
            cell: ({ row }) => {
                const status = row.original.status;
                if (status === 'pending_aslab') {
                    return (
                        <Badge className="bg-amber-500 text-white font-medium text-[11px] gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Perlu Balasan Aslab
                        </Badge>
                    );
                }
                if (status === 'answered') {
                    return (
                        <Badge className="bg-emerald-600 text-white font-medium text-[11px] gap-1">
                            <UserCheck className="w-3 h-3" />
                            Sudah Dibalas
                        </Badge>
                    );
                }
                return (
                    <Badge variant="outline" className="text-slate-500 text-[11px]">
                        Belum Ada Balasan ({row.original.replies_count})
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Aksi</div>,
            cell: ({ row }) => {
                const thread = row.original;
                return (
                    <div className="text-right space-x-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5 text-xs border-sky-200 text-sky-700 hover:bg-sky-50 gap-1.5"
                            onClick={() => openThreadModal(thread)}
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Tanggapi</span>
                        </Button>
                        <Link href={route('submissions.review', thread.submission_id)}>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2 text-xs border-slate-200 text-slate-600 hover:bg-slate-50"
                                title="Buka di Workspace Review"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                        </Link>
                    </div>
                );
            },
        },
    ], []);

    return (
        <AuthenticatedLayout>
            <Head title="Pusat Diskusi Kode - Admin" />

            <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50/50">
                {/* Sidebar Admin */}
                <div className="w-64 shrink-0 hidden lg:block border-r border-slate-200/80 bg-white">
                    <Sidebar
                        items={getAdminSidebarItems()}
                        activeId="discussions"
                        className="w-full h-full border-none rounded-none"
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 p-6 md:p-8 space-y-6 max-w-7xl">
                    <Title
                        title="Pusat Diskusi Kode"
                        subtitle="Pantau dan tanggapi diskusi/pertanyaan mahasiswa dari seluruh kelas dalam satu tempat"
                    />

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="border-slate-200/80 shadow-xs">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Diskusi</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                                </div>
                                <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                                    <MessageSquareText className="w-5 h-5" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200/80 shadow-xs">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Perlu Balasan Aslab</p>
                                    <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
                                </div>
                                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                    <Clock className="w-5 h-5" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200/80 shadow-xs">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sudah Ditanggapi</p>
                                    <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.answered}</p>
                                </div>
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                        <button
                            onClick={() => setSelectedTab('all')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                                selectedTab === 'all'
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            Semua ({stats.total})
                        </button>
                        <button
                            onClick={() => setSelectedTab('pending')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                                selectedTab === 'pending'
                                    ? 'bg-amber-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            Perlu Balasan ({stats.pending})
                        </button>
                        <button
                            onClick={() => setSelectedTab('answered')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                                selectedTab === 'answered'
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            Sudah Ditanggapi ({stats.answered})
                        </button>
                    </div>

                    {/* DataTable */}
                    <DataTable
                        tableTitle="Daftar Thread Diskusi Kode"
                        columns={columns}
                        data={filteredDiscussions}
                        searchPlaceholder="Cari berdasarkan nama mahasiswa, berkas, atau tugas..."
                    />
                </div>
            </div>

            {/* Dialog Modal Reply Thread */}
            <Dialog open={Boolean(activeThread)} onOpenChange={(open) => !open && setActiveThread(null)}>
                {activeThread && (
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-between text-base">
                                <span>Thread Diskusi Kode</span>
                                <Badge variant="outline" className="font-mono text-xs">
                                    {activeThread.file_path} : Line {activeThread.line_number}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                {activeThread.student_name} ({activeThread.student_nim}) • {activeThread.course_name} ({activeThread.assignment_title})
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto custom-scrollbar px-1">
                            {/* Original Comment */}
                            <div className="p-3 rounded-xl bg-slate-100/80 border border-slate-200 text-xs space-y-1">
                                <div className="flex items-center justify-between text-slate-500 font-medium">
                                    <span className="font-semibold text-slate-800">{activeThread.user?.name} (Komentar Awal)</span>
                                    <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-white">
                                        {activeThread.user?.role}
                                    </Badge>
                                </div>
                                <p className="text-slate-800 font-sans pt-1 leading-relaxed">{activeThread.comment}</p>
                            </div>

                            {/* Replies List */}
                            {activeThread.replies && activeThread.replies.length > 0 && (
                                <div className="space-y-2.5 pl-3 border-l-2 border-slate-200">
                                    {activeThread.replies.map((reply) => (
                                        <div
                                            key={reply.id}
                                            className={`p-3 rounded-xl text-xs space-y-1 ${
                                                reply.user?.role === 'aslab'
                                                    ? 'bg-sky-50/80 border border-sky-200/70 ml-2'
                                                    : 'bg-white border border-slate-200'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between text-slate-500 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-semibold text-slate-900">{reply.user?.name}</span>
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-[9px] py-0 px-1 h-3.5 ${
                                                            reply.user?.role === 'aslab'
                                                                ? 'bg-sky-100 text-sky-800 border-sky-300'
                                                                : 'bg-slate-100'
                                                        }`}
                                                    >
                                                        {reply.user?.role}
                                                    </Badge>
                                                </div>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(reply.created_at).toLocaleString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-slate-800 font-sans pt-0.5 leading-relaxed">{reply.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reply Form */}
                        <form onSubmit={handleSendReply} className="space-y-3 pt-2 border-t border-slate-100">
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Tulis balasan atau penjelasan teknis untuk mahasiswa..."
                                rows={3}
                                className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                required
                            />

                            <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
                                <Link href={route('submissions.review', activeThread.submission_id)}>
                                    <Button type="button" variant="outline" size="sm" className="text-xs text-slate-600 gap-1.5">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        <span>Buka Workspace Review</span>
                                    </Button>
                                </Link>

                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => setActiveThread(null)}>
                                        Tutup
                                    </Button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={isSubmitting || !replyText.trim()}
                                        className="bg-sky-600 hover:bg-sky-700 text-white gap-1.5"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        <span>{isSubmitting ? 'Mengirim...' : 'Kirim Balasan'}</span>
                                    </Button>
                                </div>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                )}
            </Dialog>
        </AuthenticatedLayout>
    );
}
