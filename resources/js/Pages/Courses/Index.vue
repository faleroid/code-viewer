<script setup>
import { ref } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, useForm, router } from '@inertiajs/vue3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const props = defineProps({
    courses: Array,
});

const showCreateDialog = ref(false);
const editingCourse = ref(null);

const form = useForm({ name: '', code: '' });

const openCreate = () => {
    form.reset();
    form.clearErrors();
    editingCourse.value = null;
    showCreateDialog.value = true;
};

const openEdit = (course) => {
    editingCourse.value = course;
    form.name = course.name;
    form.code = course.code;
    form.clearErrors();
    showCreateDialog.value = true;
};

const submit = () => {
    if (editingCourse.value) {
        form.put(route('courses.update', editingCourse.value.id), {
            onSuccess: () => { showCreateDialog.value = false; },
        });
    } else {
        form.post(route('courses.store'), {
            onSuccess: () => { showCreateDialog.value = false; },
        });
    }
};

const deleteCourse = (course) => {
    if (confirm(`Hapus mata kuliah "${course.name}"?`)) {
        router.delete(route('courses.destroy', course.id));
    }
};
</script>

<template>
    <Head title="Mata Kuliah" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex items-center justify-between">
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">Manajemen Mata Kuliah</h2>
                <Button @click="openCreate">+ Tambah Mata Kuliah</Button>
            </div>
        </template>

        <div class="py-12">
            <div class="max-w-5xl mx-auto sm:px-6 lg:px-8">
                <Card>
                    <CardContent class="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kode</TableHead>
                                    <TableHead>Nama Mata Kuliah</TableHead>
                                    <TableHead>Jumlah Kelas</TableHead>
                                    <TableHead class="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="course in courses" :key="course.id">
                                    <TableCell class="font-mono font-medium">{{ course.code }}</TableCell>
                                    <TableCell>
                                        <Link :href="route('courses.show', course.id)" class="text-blue-600 hover:underline font-medium">
                                            {{ course.name }}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{{ course.lab_classes_count }} kelas</TableCell>
                                    <TableCell class="text-right space-x-2">
                                        <Button size="sm" variant="outline" @click="openEdit(course)">Edit</Button>
                                        <Button size="sm" variant="outline" class="text-red-600 border-red-200 hover:bg-red-50" @click="deleteCourse(course)">Hapus</Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow v-if="courses.length === 0">
                                    <TableCell colspan="4" class="text-center py-8 text-gray-500">Belum ada mata kuliah.</TableCell>
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
                    <DialogTitle>{{ editingCourse ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah' }}</DialogTitle>
                </DialogHeader>
                <form @submit.prevent="submit" class="space-y-4 pt-2">
                    <div>
                        <label class="text-sm font-medium block mb-1">Kode</label>
                        <input v-model="form.code" type="text" placeholder="IF2001" class="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        <p v-if="form.errors.code" class="text-sm text-red-500 mt-1">{{ form.errors.code }}</p>
                    </div>
                    <div>
                        <label class="text-sm font-medium block mb-1">Nama Mata Kuliah</label>
                        <input v-model="form.name" type="text" placeholder="Pemrograman Web" class="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        <p v-if="form.errors.name" class="text-sm text-red-500 mt-1">{{ form.errors.name }}</p>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" @click="showCreateDialog = false">Batal</Button>
                        <Button type="submit" :disabled="form.processing">{{ editingCourse ? 'Simpan' : 'Buat' }}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </AuthenticatedLayout>
</template>
