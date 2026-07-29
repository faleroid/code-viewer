<script setup>
import { ref } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, useForm, router } from '@inertiajs/vue3';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const props = defineProps({
    course: Object,
    aslabs: Array,
});

const showCreateDialog = ref(false);
const editingClass = ref(null);

const form = useForm({
    course_id: props.course.id,
    name: '',
    semester: '',
    aslab_id: '',
});

const openCreate = () => {
    form.reset();
    form.clearErrors();
    form.course_id = props.course.id;
    editingClass.value = null;
    showCreateDialog.value = true;
};

const openEdit = (cls) => {
    editingClass.value = cls;
    form.name = cls.name;
    form.semester = cls.semester;
    form.aslab_id = cls.aslab_id;
    form.course_id = props.course.id;
    form.clearErrors();
    showCreateDialog.value = true;
};

const submit = () => {
    if (editingClass.value) {
        form.put(route('classes.update', editingClass.value.id), {
            onSuccess: () => { showCreateDialog.value = false; },
        });
    } else {
        form.post(route('classes.store'), {
            onSuccess: () => { showCreateDialog.value = false; },
        });
    }
};

const deleteClass = (cls) => {
    if (confirm(`Hapus kelas "${cls.name}"?`)) {
        router.delete(route('classes.destroy', cls.id));
    }
};
</script>

<template>
    <Head :title="course.name" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex items-center justify-between">
                <div>
                    <Link :href="route('courses.index')" class="text-sm text-gray-500 hover:underline mb-1 inline-block">&larr; Kembali ke Daftar Mata Kuliah</Link>
                    <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                        <span class="text-gray-500 font-normal mr-2">{{ course.code }}</span> {{ course.name }}
                    </h2>
                </div>
                <Button @click="openCreate">+ Tambah Kelas</Button>
            </div>
        </template>

        <div class="py-12">
            <div class="max-w-6xl mx-auto sm:px-6 lg:px-8">
                <Card>
                    <CardContent class="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Kelas</TableHead>
                                    <TableHead>Semester</TableHead>
                                    <TableHead>Asisten Laboratorium</TableHead>
                                    <TableHead>Jumlah Mahasiswa</TableHead>
                                    <TableHead class="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="cls in course.lab_classes" :key="cls.id">
                                    <TableCell>
                                        <Link :href="route('classes.show', cls.id)" class="text-blue-600 hover:underline font-medium">
                                            {{ cls.name }}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{{ cls.semester }}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {{ cls.aslab?.name || '-' }}
                                    </TableCell>
                                    <TableCell>{{ cls.students_count }} mahasiswa</TableCell>
                                    <TableCell class="text-right space-x-2">
                                        <Button size="sm" variant="outline" @click="openEdit(cls)">Edit</Button>
                                        <Button size="sm" variant="outline" class="text-red-600 border-red-200 hover:bg-red-50" @click="deleteClass(cls)">Hapus</Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow v-if="course.lab_classes.length === 0">
                                    <TableCell colspan="5" class="text-center py-8 text-gray-500">Belum ada kelas untuk mata kuliah ini.</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>

        <!-- Create/Edit Dialog -->
        <Dialog v-model:open="showCreateDialog">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{{ editingClass ? 'Edit Kelas' : 'Tambah Kelas' }}</DialogTitle>
                </DialogHeader>
                <form @submit.prevent="submit" class="space-y-4 pt-2">
                    <div>
                        <label class="text-sm font-medium block mb-1">Nama Kelas</label>
                        <input v-model="form.name" type="text" placeholder="Kelas A" class="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        <p v-if="form.errors.name" class="text-sm text-red-500 mt-1">{{ form.errors.name }}</p>
                    </div>
                    <div>
                        <label class="text-sm font-medium block mb-1">Semester</label>
                        <input v-model="form.semester" type="text" placeholder="Ganjil 2024/2025" class="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        <p v-if="form.errors.semester" class="text-sm text-red-500 mt-1">{{ form.errors.semester }}</p>
                    </div>
                    <div>
                        <label class="text-sm font-medium block mb-1">Asisten Laboratorium (Pengampu)</label>
                        <select v-model="form.aslab_id" class="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" :disabled="editingClass !== null">
                            <option value="" disabled>Pilih Asisten Laboratorium</option>
                            <option v-for="aslab in aslabs" :key="aslab.id" :value="aslab.id">
                                {{ aslab.name }} ({{ aslab.email }})
                            </option>
                        </select>
                        <p v-if="form.errors.aslab_id" class="text-sm text-red-500 mt-1">{{ form.errors.aslab_id }}</p>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" @click="showCreateDialog = false">Batal</Button>
                        <Button type="submit" :disabled="form.processing">{{ editingClass ? 'Simpan' : 'Buat' }}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </AuthenticatedLayout>
</template>
