import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Clock } from 'lucide-react';

interface StudentFeedbackProps {
    submission: any;
    grade?: any;
}

export default function StudentFeedback({
    submission,
    grade,
}: StudentFeedbackProps) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Feedback & Nilai: {submission?.assignment?.title}
                </h2>
            }
        >
            <Head title="Feedback & Nilai" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {grade ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold">
                                    Total Nilai: <span className="text-sky-600">{grade.score}</span> / 100
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-700 mb-1">
                                            Feedback Umum Asisten:
                                        </h3>
                                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-md whitespace-pre-line text-sm text-gray-800">
                                            {grade.feedback || 'Tidak ada feedback tertulis.'}
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100">
                                        <p className="text-sm text-gray-500">
                                            Nilai diberikan pada: {grade.graded_at ? new Date(grade.graded_at).toLocaleString() : '-'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="py-10 text-center text-gray-500 flex flex-col items-center">
                                <Clock className="w-16 h-16 text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">
                                    Tugas Belum Dinilai
                                </h3>
                                <p>
                                    Asisten laboratorium sedang memeriksa tugas Anda. Silakan cek kembali nanti.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
