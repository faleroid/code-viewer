import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';

interface Submission {
    id: number;
    submitted_at: string;
    is_late: boolean;
    status: 'pending' | 'reviewing' | 'graded' | 'error';
    user?: { name: string; nim: string };
    grade?: { score: number };
}

interface Assignment {
    id: number;
    title: string;
    description?: string;
    deadline: string;
    max_score: number;
    grading_method: string;
    module: {
        title: string;
        labClass: {
            id: number;
            name: string;
            course: { name: string };
        };
    };
    submissions: Submission[];
}

export default function AssignmentsShow({ assignment }: { assignment: Assignment }) {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const isAslab = user?.role === 'aslab' || user?.role === 'admin';

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'graded':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'reviewing':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'error':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'graded':
                return 'Selesai Dinilai';
            case 'reviewing':
                return 'Sedang Direview';
            case 'error':
                return 'Ekstrak Gagal';
            default:
                return 'Menunggu Review';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        {isAslab ? (
                            <Link href={route('classes.show', assignment.module.labClass.id)} className="text-sm text-gray-500 hover:underline mb-1 inline-block">
                                &larr; Kembali ke Kelas {assignment.module.labClass.name}
                            </Link>
                        ) : (
                            <Link href={route('dashboard')} className="text-sm text-gray-500 hover:underline mb-1 inline-block">
                                &larr; Kembali ke Dashboard
                            </Link>
                        )}
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            {assignment.title}
                        </h2>
                    </div>
                </div>
            }
        >
            <Head title={assignment.title} />

            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Info Tugas */}
                    <Card>
                        <CardHeader className="bg-gray-50 border-b py-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">Informasi Tugas</CardTitle>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Mata Kuliah: {assignment.module.labClass.course.name} • Modul: {assignment.module.title}
                                    </div>
                                </div>
                                <Badge variant="outline" className="text-sm py-1">
                                    Max Score: {assignment.max_score}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="prose max-w-none mb-6">
                                <p className="whitespace-pre-line text-gray-700">{assignment.description || 'Tidak ada deskripsi tugas.'}</p>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div className="bg-red-50 text-red-700 px-3 py-2 rounded-md border border-red-100 inline-flex items-center text-sm font-medium">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Tenggat: {new Date(assignment.deadline).toLocaleString()}
                                </div>
                                <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded-md border border-blue-100 inline-flex items-center text-sm font-medium">
                                    Penilaian: {assignment.grading_method === 'rubric' ? 'Berdasarkan Rubrik' : 'Skor Langsung'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Daftar Submissions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Pengumpulan Tugas (Submissions)</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mahasiswa</TableHead>
                                        <TableHead>Waktu Kumpul</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Nilai</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignment.submissions?.map((sub) => (
                                        <TableRow key={sub.id}>
                                            <TableCell>
                                                <div className="font-medium">{sub.user?.name}</div>
                                                <div className="text-xs text-gray-500">{sub.user?.nim}</div>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(sub.submitted_at).toLocaleString()}
                                                {sub.is_late && <Badge variant="destructive" className="ml-2 text-[10px]">Terlambat</Badge>}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getStatusColor(sub.status)}>
                                                    {getStatusLabel(sub.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-bold">
                                                {sub.grade ? sub.grade.score : '-'} {sub.grade && <span className="text-xs font-normal text-gray-500">/ {assignment.max_score}</span>}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                {isAslab ? (
                                                    sub.status !== 'error' && (
                                                        <Link href={route('submissions.review', sub.id)}>
                                                            <Button size="sm">Review & Nilai</Button>
                                                        </Link>
                                                    )
                                                ) : (
                                                    sub.status === 'graded' && (
                                                        <Link href={route('submissions.feedback', sub.id)}>
                                                            <Button variant="outline" size="sm">Lihat Feedback</Button>
                                                        </Link>
                                                    )
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!assignment.submissions || assignment.submissions.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                Belum ada yang mengumpulkan tugas.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
