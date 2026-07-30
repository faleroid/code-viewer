import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';

interface ClassItem {
    id: number;
    name: string;
    semester: string;
    course_id: number;
    course?: { name: string };
    aslab?: { name: string };
    students_count: number;
}

export default function ClassesIndex({ classes = [] }: { classes?: ClassItem[] }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">Daftar Semua Kelas</h2>
            }
        >
            <Head title="Daftar Kelas" />

            <div className="py-12">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mata Kuliah</TableHead>
                                        <TableHead>Nama Kelas</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead>Pengampu</TableHead>
                                        <TableHead>Mahasiswa</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {classes.map((cls) => (
                                        <TableRow key={cls.id}>
                                            <TableCell>
                                                <Link href={route('courses.show', cls.course_id)} className="text-blue-600 hover:underline">
                                                    {cls.course?.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Link href={route('classes.show', cls.id)} className="text-blue-600 hover:underline font-medium">
                                                    {cls.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{cls.semester}</Badge>
                                            </TableCell>
                                            <TableCell>{cls.aslab?.name || '-'}</TableCell>
                                            <TableCell>{cls.students_count}</TableCell>
                                        </TableRow>
                                    ))}
                                    {classes.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">Belum ada kelas.</TableCell>
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
