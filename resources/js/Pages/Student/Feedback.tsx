import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import FileTreeViewer from '@/Components/FileTreeViewer';
import CodeViewer from '@/Components/CodeViewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import Title from '@/Components/Title';
import { Sidebar } from '@/Components/Sidebar';
import { getStudentSidebarItems } from '@/Components/Sidebar/studentNavigation';
import { ArrowLeft, Clock, MessageSquare, Award } from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/Components/ui/breadcrumb"


interface StudentFeedbackProps {
    submission: any;
    grade?: any;
    inlineComments?: any[];
}

export default function StudentFeedback({
    submission,
    grade,
    inlineComments = [],
}: StudentFeedbackProps) {
    const [selectedFilePath, setSelectedFilePath] = useState('');
    const [selectedFileContent, setSelectedFileContent] = useState('// Pilih file dari direktori di samping untuk melihat komentar inline\n');
    const [selectedLanguage, setSelectedLanguage] = useState('text');
    const [isLoadingFile, setIsLoadingFile] = useState(false);

    // Build file tree representation if files exist
    const files = submission?.files || [];
    const fileIdMap: Record<string, number> = {};
    files.forEach((f: any) => {
        fileIdMap[f.file_path] = f.id;
    });

    return (
        <AuthenticatedLayout>
            <Head title={`Feedback - ${submission?.assignment?.title || 'Tugas'}`} />

            <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50/50">
                {/* Sidebar Mahasiswa */}
                <div className="w-64 shrink-0 hidden lg:block border-r border-slate-200/80 bg-white">
                    <Sidebar
                        items={getStudentSidebarItems()}
                        activeId="nilai-tugas"
                        className="w-full h-full border-none rounded-none"
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 p-6 md:p-8 space-y-6 max-w-7xl">
                    <div className="flex flex-col justify-start gap-4">
                        <div>
                            <div className='flex justify-between items-center'>
                                <Title
                                    title={`Feedback ${submission?.assignment?.title}`}
                                    subtitle={`${submission?.assignment?.module?.title}`}
                                />
                                <Breadcrumb>
                                    <BreadcrumbList>
                                        <BreadcrumbItem>
                                            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator />
                                        <BreadcrumbItem>
                                            <BreadcrumbLink><Link href={route('assignments.grades')}>Nilai & Feedback</Link></BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator />
                                        <BreadcrumbItem>
                                            <BreadcrumbPage className="font-medium text-sky-600">{`${submission?.assignment?.title}`}</BreadcrumbPage>
                                        </BreadcrumbItem>
                                    </BreadcrumbList>
                                </Breadcrumb>
                            </div>
                        </div>
                    </div>

                    {/* Grade & General Feedback Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-1 shadow-sm border-slate-200/80">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold text-slate-700">Nilai Akhir</CardTitle>
                                    <Award className="w-5 h-5 text-sky-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 text-center">
                                {grade ? (
                                    <div>
                                        <div className="text-4xl font-semibold text-slate-900">
                                            {Math.round(grade.score)} <span className="text-lg text-slate-400 font-normal">/ 100</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-4 text-slate-400">
                                        <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                        <p className="text-xs">Menunggu Review</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2 shadow-sm border-slate-200/80">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold text-slate-700">Catatan Evaluasi Umum</CardTitle>
                                    <MessageSquare className="w-5 h-5 text-slate-400" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                    {grade?.feedback || 'Tidak ada catatan umpan balik khusus dari Asisten Laboratorium.'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Inline Comments Section with Thread Reply */}
                    {inlineComments && inlineComments.length > 0 && (
                        <Card className="shadow-sm border-slate-200/80">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-6">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold text-slate-800">
                                        Diskusi & Komentar Baris Kode ({inlineComments.length})
                                    </CardTitle>
                                    <span className="text-xs text-slate-500">
                                        Klik &quot;Balas&quot; untuk klarifikasi atau diskusi dengan Aslab
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                {inlineComments.map((comment: any) => (
                                    <InlineCommentCard key={comment.id} comment={comment} />
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function InlineCommentCard({ comment }: { comment: any }) {
    const [replyText, setReplyText] = useState('');
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;

        setIsSubmitting(true);
        router.post(
            route('inline-comments.store'),
            {
                submission_file_id: comment.submission_file_id,
                line_number: comment.line_number,
                comment: replyText,
                parent_id: comment.id,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setReplyText('');
                    setShowReplyForm(false);
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    return (
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-3">
            {/* Top-level comment */}
            <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-mono font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                            {comment.submission_file?.file_path || 'File'} — Baris {comment.line_number}
                        </span>
                        <span className="font-medium text-slate-900">{comment.user?.name || 'Aslab'}</span>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 bg-slate-100 text-slate-600">
                            {comment.user?.role || 'aslab'}
                        </Badge>
                    </div>
                    <p className="text-sm text-slate-800 font-sans pt-1 leading-relaxed">{comment.comment}</p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 hover:underline shrink-0"
                >
                    {showReplyForm ? 'Batal' : 'Balas'}
                </button>
            </div>

            {/* Replies Thread */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="pl-4 border-l-2 border-slate-200 space-y-2 mt-2 pt-1">
                    {comment.replies.map((reply: any) => (
                        <div key={reply.id} className="p-2.5 rounded-lg bg-white border border-slate-200/60 text-xs space-y-0.5">
                            <div className="flex items-center justify-between text-slate-500 font-medium">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-slate-800">{reply.user?.name}</span>
                                    <Badge variant="outline" className="text-[9px] py-0 px-1 h-3.5 bg-slate-50">
                                        {reply.user?.role}
                                    </Badge>
                                </div>
                                <span className="text-[10px] text-slate-400">
                                    {reply.created_at ? new Date(reply.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                            </div>
                            <p className="text-slate-700 font-sans pt-0.5">{reply.comment}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Reply Form */}
            {showReplyForm && (
                <form onSubmit={handleSendReply} className="pt-2 space-y-2">
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Tulis balasan atau klarifikasi..."
                        rows={2}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                    />
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowReplyForm(false)}
                            className="h-7 text-xs px-2.5"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isSubmitting || !replyText.trim()}
                            className="h-7 text-xs px-3 bg-sky-600 hover:bg-sky-700 text-white"
                        >
                            {isSubmitting ? 'Mengirim...' : 'Kirim Balasan'}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
