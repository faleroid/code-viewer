import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Eye, Users, UserCheck, ArrowUpRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

export interface LabClass {
    id: number;
    name: string;
    semester: string;
    aslab_id: number;
    aslab?: { name: string; email: string };
    students_count: number;
}

interface ClassCardProps {
    labClass: LabClass;
    onEdit?: (labClass: LabClass) => void;
    onDelete?: (labClass: LabClass) => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
    labClass,
    onEdit,
    onDelete,
}) => {
    return (
        <Card>
            <CardHeader className="px-6 pb-0 relative z-10">
                <div className="flex items-start justify-between gap-3">
                    <Link
                        href={route('classes.show', labClass.id)}
                        className="text-base font-semibold text-sky-600 hover:underline line-clamp-1"
                    >
                        {labClass.name}
                    </Link>
                    <Badge variant="outline" className="text-xs font-normal text-slate-600 bg-slate-50/80 border-slate-200">
                        {labClass.semester}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex justify-between items-center px-6 py-4 text-sm text-slate-600">
                <div className="flex items-center gap-2 text-slate-600">
                    <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">
                        <strong className="font-medium text-slate-700"></strong> {labClass.aslab?.name || '-'}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                        <strong className="font-medium text-slate-700"></strong> {labClass.students_count || 0} Mahasiswa
                    </span>
                </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-slate-300 pt-2 px-6 pb-2 relative z-10">
                <Link href={route('classes.show', labClass.id)} className="flex items-center gap-1 text-sm text-sky-600 hover:underline">
                    <ArrowUpRight className="w-4 h-4" />
                    Lihat Kelas
                </Link>
            </CardFooter>
        </Card>
    );
};

export default ClassCard;
