import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import Title from '@/Components/Title';
import DataTable from '@/Components/DataTable';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Sidebar } from '@/Components/Sidebar';
import { getAdminSidebarItems } from '@/Components/Sidebar/adminNavigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Plus, Trash2, Edit, FileSpreadsheet } from 'lucide-react';

interface RubricComponentItem {
    id?: number;
    name: string;
    weight: number;
}

interface RubricTemplateItem {
    id: number;
    name: string;
    components: RubricComponentItem[];
}

export default function RubricTemplatesIndex({ templates = [] }: { templates?: RubricTemplateItem[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<RubricTemplateItem | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        components: [{ name: '', weight: 100 }] as RubricComponentItem[],
    });

    const openCreateDialog = () => {
        setEditingTemplate(null);
        clearErrors();
        reset();
        setData({
            name: '',
            components: [{ name: 'Logika & Algoritma', weight: 40 }, { name: 'Fungsionalitas Kode', weight: 40 }, { name: 'Struktur & Kerapihan', weight: 20 }],
        });
        setIsOpen(true);
    };

    const openEditDialog = (template: RubricTemplateItem) => {
        setEditingTemplate(template);
        clearErrors();
        setData({
            name: template.name,
            components: template.components.map(c => ({ name: c.name, weight: c.weight })),
        });
        setIsOpen(true);
    };

    const addComponent = () => {
        setData('components', [...data.components, { name: '', weight: 0 }]);
    };

    const removeComponent = (index: number) => {
        if (data.components.length <= 1) return;
        const newComps = [...data.components];
        newComps.splice(index, 1);
        setData('components', newComps);
    };

    const updateComponent = (index: number, field: 'name' | 'weight', value: any) => {
        const newComps = [...data.components];
        newComps[index] = { ...newComps[index], [field]: value };
        setData('components', newComps);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTemplate) {
            put(route('rubric-templates.update', editingTemplate.id), {
                onSuccess: () => setIsOpen(false),
            });
        } else {
            post(route('rubric-templates.store'), {
                onSuccess: () => setIsOpen(false),
            });
        }
    };

    const handleDelete = (template: RubricTemplateItem) => {
        if (confirm(`Apakah Anda yakin ingin menghapus template "${template.name}"?`)) {
            destroy(route('rubric-templates.destroy', template.id));
        }
    };

    const totalWeight = useMemo(() => {
        return data.components.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
    }, [data.components]);

    const columns = useMemo<ColumnDef<RubricTemplateItem>[]>(() => [
        {
            accessorKey: 'name',
            header: ({ column }) => (
                <div
                    className="flex items-center gap-1 cursor-pointer select-none"
                    onClick={() => column.toggleSorting()}
                >
                    Nama Template Rubrik
                    {column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕'}
                </div>
            ),
            cell: ({ row }) => (
                <div className="font-semibold text-slate-800 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-sky-600" />
                    <span>{row.original.name}</span>
                </div>
            ),
        },
        {
            accessorKey: 'components',
            header: 'Komponen Penilaian',
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1.5 py-1">
                    {row.original.components?.map((c, i) => (
                        <Badge key={i} variant="outline" className="bg-slate-50 text-slate-700 font-medium">
                            {c.name} ({c.weight}%)
                        </Badge>
                    ))}
                </div>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Aksi</div>,
            cell: ({ row }) => {
                const template = row.original;
                return (
                    <div className="text-right space-x-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-xs border-slate-200"
                            onClick={() => openEditDialog(template)}
                        >
                            <Edit className="w-3.5 h-3.5 text-slate-600" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-xs border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(template)}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                );
            },
        },
    ], []);

    return (
        <AuthenticatedLayout>
            <Head title="Template Rubrik - Admin" />

            <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50/50">
                {/* Sidebar Admin */}
                <div className="w-64 shrink-0 hidden lg:block border-r border-slate-200/80 bg-white sticky top-16 h-[calc(100vh-4rem)] self-start">
                    <Sidebar
                        items={getAdminSidebarItems()}
                        activeId="template-rubrik"
                        className="w-full h-full border-none rounded-none"
                    />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0 p-6 md:p-8 space-y-6 max-w-7xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <Title
                            title="Template Rubrik Penilaian"
                            subtitle="Kelola standar dan kriteria komponen penilaian reusable"
                        />
                        <Button
                            onClick={openCreateDialog}
                            className="bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-sm gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Buat Template Baru</span>
                        </Button>
                    </div>

                    <DataTable
                        tableTitle="Daftar Template Rubrik"
                        columns={columns}
                        data={templates}
                        searchPlaceholder="Cari template rubrik..."
                    />
                </div>
            </div>

            {/* Dialog Create / Edit Rubric Template */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingTemplate ? 'Edit Template Rubrik' : 'Buat Template Rubrik'}</DialogTitle>
                        <DialogDescription>
                            Tentukan nama dan komponen bobot penilaian rubrik.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Nama Template</label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="misal: Rubrik Pemrograman Web"
                                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                required
                            />
                            {errors.name && <div className="text-xs text-red-500">{errors.name}</div>}
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700">Komponen Penilaian</label>
                                <span className={`text-xs font-semibold ${totalWeight === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    Total Bobot: {totalWeight}% {totalWeight !== 100 && '(disarankan 100%)'}
                                </span>
                            </div>

                            {data.components.map((comp, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={comp.name}
                                        onChange={(e) => updateComponent(idx, 'name', e.target.value)}
                                        placeholder="Nama Komponen"
                                        className="flex-1 h-9 rounded-md border border-slate-300 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-400"
                                        required
                                    />
                                    <div className="w-24 flex items-center gap-1">
                                        <input
                                            type="number"
                                            value={comp.weight}
                                            onChange={(e) => updateComponent(idx, 'weight', Number(e.target.value))}
                                            placeholder="Bobot"
                                            min="0"
                                            max="100"
                                            className="w-full h-9 rounded-md border border-slate-300 px-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-slate-400"
                                            required
                                        />
                                        <span className="text-xs text-slate-500 font-medium">%</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeComponent(idx)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30"
                                        disabled={data.components.length <= 1}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addComponent}
                                className="w-full h-8 text-xs border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 gap-1.5"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Komponen</span>
                            </Button>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-sky-600 hover:bg-sky-700">
                                {processing ? 'Menyimpan...' : 'Simpan Template'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
