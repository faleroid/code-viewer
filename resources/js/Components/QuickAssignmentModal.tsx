import React, { useState, useEffect, FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem } from '@/Components/ui/dropdown-menu';
import { ChevronDown, Plus, Send, Calendar, Layers, BookOpen } from 'lucide-react';

interface Module {
    id: number;
    title: string;
    course_id?: number;
}

interface Course {
    id: number;
    name: string;
    code: string;
    modules?: Module[];
}

interface LabClass {
    id: number;
    name: string;
    course_id: number;
}

interface RubricTemplate {
    id: number;
    name: string;
}

interface QuickAssignmentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courses?: Course[];
    classes?: LabClass[];
    rubricTemplates?: RubricTemplate[];
}

export const QuickAssignmentModal: React.FC<QuickAssignmentModalProps> = ({
    open,
    onOpenChange,
    courses = [],
    classes = [],
    rubricTemplates = [],
}) => {
    const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
    const [selectedModuleId, setSelectedModuleId] = useState<number | ''>('');

    const availableModules = courses.find((c) => c.id === selectedCourseId)?.modules || [];
    const availableClasses = classes.filter((cls) => cls.course_id === selectedCourseId);

    const form = useForm({
        module_id: '' as number | '',
        title: '',
        description: '',
        deadline: '',
        grading_method: 'score',
        max_score: 100,
        rubric_template_id: '' as number | '',
        publish_classes: [] as number[],
        publish_now: true,
        start_time: '',
    });

    useEffect(() => {
        if (open) {
            form.reset();
            if (courses.length === 1) {
                const cId = courses[0].id;
                setSelectedCourseId(cId);
                const mods = courses[0].modules || [];
                if (mods.length > 0) {
                    setSelectedModuleId(mods[0].id);
                    form.setData('module_id', mods[0].id);
                }
            } else {
                setSelectedCourseId('');
                setSelectedModuleId('');
            }
        }
    }, [open]);

    const handleCourseChange = (courseId: number) => {
        setSelectedCourseId(courseId);
        const mods = courses.find((c) => c.id === courseId)?.modules || [];
        if (mods.length > 0) {
            setSelectedModuleId(mods[0].id);
            form.setData('module_id', mods[0].id);
        } else {
            setSelectedModuleId('');
            form.setData('module_id', '');
        }

        const matchingClassIds = classes.filter((cls) => cls.course_id === courseId).map((cls) => cls.id);
        form.setData((prev) => ({
            ...prev,
            publish_classes: matchingClassIds,
        }));
    };

    const handleModuleChange = (moduleId: number) => {
        setSelectedModuleId(moduleId);
        form.setData('module_id', moduleId);
    };

    const toggleClassSelection = (classId: number) => {
        const current = form.data.publish_classes;
        if (current.includes(classId)) {
            form.setData('publish_classes', current.filter((id) => id !== classId));
        } else {
            form.setData('publish_classes', [...current, classId]);
        }
    };

    const toggleSelectAllClasses = () => {
        const matchingClassIds = availableClasses.map((cls) => cls.id);
        if (form.data.publish_classes.length === matchingClassIds.length) {
            form.setData('publish_classes', []);
        } else {
            form.setData('publish_classes', matchingClassIds);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!form.data.module_id) {
            alert('Silakan pilih modul terlebih dahulu.');
            return;
        }

        form.post(route('assignments.store'), {
            onSuccess: () => {
                onOpenChange(false);
                form.reset();
            },
        });
    };

    const selectedCourse = courses.find((c) => c.id === selectedCourseId);
    const selectedModule = availableModules.find((m) => m.id === selectedModuleId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl bg-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        <span>Tambah Tugas</span>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="flex justify-between gap-4">
                        <div className="w-1/2">
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Mata Kuliah</label>
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full justify-between font-normal text-sm border-slate-300 bg-white h-9"
                                        >
                                            <span className={`truncate ${selectedCourse ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                                                {selectedCourse ? `${selectedCourse.code} - ${selectedCourse.name}` : 'Pilih Mata Kuliah...'}
                                            </span>
                                            <ChevronDown className="w-4 h-4 opacity-50 shrink-0 ml-1" />
                                        </Button>
                                    }
                                />
                                <DropdownMenuContent className="w-[var(--anchor-width)] max-h-60 overflow-y-auto bg-white border border-slate-200 shadow-md p-1 z-[70] pointer-events-auto">
                                    <DropdownMenuGroup>
                                        {courses.map((c) => (
                                            <DropdownMenuItem
                                                key={c.id}
                                                onClick={() => handleCourseChange(c.id)}
                                                className={`cursor-pointer px-3 py-2 text-sm rounded-md transition-colors ${selectedCourseId === c.id
                                                    ? 'bg-sky-50 text-sky-700 font-medium'
                                                    : 'hover:bg-slate-100 text-slate-700'
                                                    }`}
                                            >
                                                {c.code} - {c.name}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="w-1/2">
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Modul Praktikum</label>
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={!selectedCourseId || availableModules.length === 0}
                                            className="w-full justify-between font-normal text-sm border-slate-300 bg-white h-9"
                                        >
                                            <span className={`truncate ${selectedModule ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                                                {selectedModule ? selectedModule.title : (!selectedCourseId ? 'Pilih Mata Kuliah...' : (availableModules.length === 0 ? 'Tidak ada modul' : 'Pilih Modul...'))}
                                            </span>
                                            <ChevronDown className="w-4 h-4 opacity-50 shrink-0 ml-1" />
                                        </Button>
                                    }
                                />
                                <DropdownMenuContent className="w-[var(--anchor-width)] max-h-60 overflow-y-auto bg-white border border-slate-200 shadow-md p-1 z-[70] pointer-events-auto">
                                    <DropdownMenuGroup>
                                        {availableModules.map((m) => (
                                            <DropdownMenuItem
                                                key={m.id}
                                                onClick={() => handleModuleChange(m.id)}
                                                className={`cursor-pointer px-3 py-2 text-sm rounded-md transition-colors ${selectedModuleId === m.id
                                                    ? 'bg-sky-50 text-sky-700 font-medium'
                                                    : 'hover:bg-slate-100 text-slate-700'
                                                    }`}
                                            >
                                                {m.title}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div>
                        <input
                            type="text"
                            value={form.data.title}
                            onChange={(e) => form.setData('title', e.target.value)}
                            placeholder="Judul Tugas"
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <textarea
                            value={form.data.description}
                            onChange={(e) => form.setData('description', e.target.value)}
                            rows={2}
                            placeholder="Deskripsi..."
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Tenggat Waktu</label>
                            <input
                                type="datetime-local"
                                value={form.data.deadline}
                                onChange={(e) => form.setData('deadline', e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Nilai Maksimal</label>
                            <input
                                type="number"
                                min="1"
                                max="1000"
                                value={form.data.max_score}
                                onChange={(e) => form.setData('max_score', parseInt(e.target.value, 10) || 100)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    {selectedCourseId && availableClasses.length > 0 && (
                        <div className="border border-sky-200 bg-sky-50/50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-sky-900">Kelas Target</label>
                                <button
                                    type="button"
                                    onClick={toggleSelectAllClasses}
                                    className="text-xs text-sky-600 hover:underline font-medium"
                                >
                                    {form.data.publish_classes.length === availableClasses.length ? 'Batal Semua' : 'Pilih Semua'}
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                {availableClasses.map((cls) => (
                                    <label key={cls.id} className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded border border-slate-200 text-sm cursor-pointer hover:bg-slate-50">
                                        <input
                                            type="checkbox"
                                            checked={form.data.publish_classes.includes(cls.id)}
                                            onChange={() => toggleClassSelection(cls.id)}
                                            className="rounded border-gray-300 text-sky-500 focus:ring-transparent h-4 w-4"
                                        />
                                        <span className="truncate font-medium text-slate-700">{cls.name}</span>
                                    </label>
                                ))}
                            </div>
                            {form.data.publish_classes.length > 0 && (
                                <div className="pt-2 border-t border-sky-100 flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={form.data.publish_now}
                                            onChange={(e) => form.setData('publish_now', e.target.checked)}
                                            className="rounded border-gray-300 text-sky-500 focus:ring-transparent h-4 w-4"
                                        />
                                        <span className="font-medium text-slate-800">Rilis Sekarang saat dibuat</span>
                                    </label>

                                    {!form.data.publish_now && (
                                        <input
                                            type="datetime-local"
                                            value={form.data.start_time}
                                            onChange={(e) => form.setData('start_time', e.target.value)}
                                            placeholder="Waktu Buka"
                                            className="rounded-md border border-slate-300 px-2.5 py-1 text-sm focus:ring-1 focus:ring-sky-500"
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="outline" size="sm" className='text-red-500 border-red-500 hover:text-red-500' onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit" size="sm" disabled={form.processing} className="w-full bg-sky-600 hover:bg-sky-700 text-white gap-1.5">
                            Buat Tugas
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default QuickAssignmentModal;
