import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Clock } from 'lucide-react';

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
            name: string;
            course: { name: string };
        };
    };
    submissions?: Submission[];
}

export default function StudentAssignmentShow({ assignment }: { assignment: Assignment }) {
    const { auth } = usePage().props as any;
    const isStudent = auth.user?.role === 'mahasiswa';

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <span className="text-sm text-gray-500 block mb-1">
                        {assignment.module?.labClass?.course?.name} / Modul: {assignment.module?.title}
                    </span>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        {assignment.title}
                    </h2>
                </div>
            }
        >
            <Head title={assignment.title} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Detail Tugas */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl font-bold">{assignment.title}</CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Modul: {assignment.module?.title}
                                    </p>
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
                                    <Clock className="h-4 w-4 mr-2" />
                                    Tenggat: {new Date(assignment.deadline).toLocaleString()}
                                </div>
                                <div className="bg-sky-50 text-sky-700 px-3 py-2 rounded-md border border-sky-100 inline-flex items-center text-sm font-medium">
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
                                        {!isStudent && <TableHead>Mahasiswa</TableHead>}
                                        <TableHead>Waktu Kumpul</TableHead>
                                        <TableHead>Status Keterlambatan</TableHead>
                                        <TableHead>Status Penilaian</TableHead>
                                        <TableHead>Nilai</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignment.submissions?.map((sub) => (
                                        <TableRow key={sub.id}>
                                            {!isStudent && (
                                                <TableCell className="font-medium">
                                                    {sub.user?.name}
                                                    <span className="text-xs text-gray-400 block">{sub.user?.nim}</span>
                                                </TableCell>
                                            )}
                                            <TableCell>{new Date(sub.submitted_at).toLocaleString()}</TableCell>
                                            <TableCell>
                                                {sub.is_late ? (
                                                    <Badge variant="destructive">Terlambat</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">Tepat Waktu</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={sub.status === 'graded' ? 'default' : 'secondary'}>
                                                    {sub.status === 'graded' ? 'Sudah Dinilai' : 'Menunggu Review'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-bold">
                                                {sub.grade ? `${sub.grade.score} / ${assignment.max_score}` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                {!isStudent ? (
                                                    <Link href={route('submissions.review', sub.id)}>
                                                        <Button size="sm">Review Code</Button>
                                                    </Link>
                                                ) : (
                                                    <Link href={route('submissions.feedback', sub.id)}>
                                                        <Button size="sm" variant="outline">Lihat Feedback</Button>
                                                    </Link>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!assignment.submissions || assignment.submissions.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={isStudent ? 5 : 6} className="text-center py-8 text-gray-500">
                                                Belum ada pengumpulan tugas.
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
