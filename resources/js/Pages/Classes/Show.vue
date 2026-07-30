<script setup>
import { ref } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, useForm, router } from '@inertiajs/vue3';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Badge } from '@/Components/ui/badge';

const props = defineProps({
    labClass: Object,
    availableStudents: Array,
});

// Module Form
const showModuleDialog = ref(false);
const editingModule = ref(null);
const moduleForm = useForm({ title: '', order: '' });

const openModuleCreate = () => {
    moduleForm.reset();
    editingModule.value = null;
    showModuleDialog.value = true;
};

const openModuleEdit = (mod) => {
    editingModule.value = mod;
    moduleForm.title = mod.title;
    moduleForm.order = mod.order;
    showModuleDialog.value = true;
};

const submitModule = () => {
    if (editingModule.value) {
        moduleForm.put(route('modules.update', editingModule.value.id), {
            onSuccess: () => { showModuleDialog.value = false; },
        });
    } else {
        moduleForm.post(route('modules.store', { lab_class_id: props.labClass.id }), {
            onSuccess: () => { showModuleDialog.value = false; },
        });
    }
};

const deleteModule = (mod) => {
    if (confirm(`Hapus modul "${mod.title}"?`)) {
        router.delete(route('modules.destroy', mod.id));
    }
};

// Assignment Form
const showAssignmentDialog = ref(false);
const editingAssignment = ref(null);
const activeModuleId = ref(null);
const assignmentForm = useForm({
    module_id: '',
    title: '',
    description: '',
    deadline: '',
    grading_method: 'score',
    max_score: 100,
});

const openAssignmentCreate = (moduleId) => {
    assignmentForm.reset();
    assignmentForm.module_id = moduleId;
    editingAssignment.value = null;
    showAssignmentDialog.value = true;
};

const submitAssignment = () => {
    assignmentForm.post(route('assignments.store'), {
        onSuccess: () => { showAssignmentDialog.value = false; },
    });
};

const deleteAssignment = (assign) => {
    if (confirm(`Hapus tugas "${assign.title}"?`)) {
        router.delete(route('assignments.destroy', assign.id));
    }
};

// Student Enrollment
const showEnrollDialog = ref(false);
const enrollForm = useForm({ student_ids: [] });

const submitEnroll = () => {
    enrollForm.post(route('classes.enroll', props.labClass.id), {
        onSuccess: () => {
            showEnrollDialog.value = false;
            enrollForm.reset();
        },
    });
};

const removeStudent = (student) => {
    if (confirm(`Keluarkan ${student.name} dari kelas?`)) {
        router.delete(route('classes.removeStudent', { class: props.labClass.id, student: student.id }));
    }
};
</script>

<template>
    <Head :title="labClass.name" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex items-center justify-between">
                <div>
                    <Link :href="route('courses.show', labClass.course.id)" class="text-sm text-gray-500 hover:underline mb-1 inline-block">&larr; {{ labClass.course.name }}</Link>
                    <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                        Kelas {{ labClass.name }}
                        <Badge variant="outline" class="ml-2 align-middle">{{ labClass.semester }}</Badge>
                    </h2>
                </div>
            </div>
        </template>

        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Main Content: Modules & Assignments -->
                <div class="md:col-span-2 space-y-6">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold text-gray-800">Modul Pembelajaran</h3>
                        <Button @click="openModuleCreate" size="sm">+ Tambah Modul</Button>
                    </div>

                    <Card v-for="(mod, index) in labClass.modules" :key="mod.id">
                        <CardHeader class="bg-gray-50 border-b py-3 px-4 flex flex-row items-center justify-between space-y-0">
                            <CardTitle class="text-base font-semibold">Modul {{ mod.order || index + 1 }}: {{ mod.title }}</CardTitle>
                            <div class="space-x-2">
                                <Button variant="ghost" size="sm" @click="openModuleEdit(mod)">Edit</Button>
                                <Button variant="ghost" size="sm" class="text-red-600 hover:text-red-800 hover:bg-red-50" @click="deleteModule(mod)">Hapus</Button>
                            </div>
                        </CardHeader>
                        <CardContent class="p-4">
                            <div v-if="mod.assignments?.length > 0" class="space-y-3 mb-4">
                                <div v-for="assign in mod.assignments" :key="assign.id" class="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50 transition">
                                    <div>
                                        <Link :href="route('assignments.show', assign.id)" class="font-medium text-blue-600 hover:underline block">
                                            {{ assign.title }}
                                        </Link>
                                        <span class="text-xs text-gray-500">Tenggat: {{ new Date(assign.deadline).toLocaleString() }} • Max: {{ assign.max_score }}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" class="text-red-600 hover:text-red-800" @click="deleteAssignment(assign)">Hapus</Button>
                                </div>
                            </div>
                            <div v-else class="text-sm text-gray-500 italic mb-4">Belum ada tugas di modul ini.</div>
                            
                            <Button variant="outline" size="sm" class="w-full border-dashed" @click="openAssignmentCreate(mod.id)">
                                + Tambah Tugas
                            </Button>
                        </CardContent>
                    </Card>

                    <div v-if="labClass.modules.length === 0" class="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                        <p class="text-gray-500 mb-2">Belum ada modul di kelas ini.</p>
                        <Button @click="openModuleCreate" variant="outline">Buat Modul Pertama</Button>
                    </div>
                </div>

                <!-- Sidebar: Students -->
                <div>
                    <Card class="sticky top-6">
                        <CardHeader class="pb-3 border-b">
                            <div class="flex justify-between items-center">
                                <CardTitle class="text-lg">Daftar Mahasiswa</CardTitle>
                                <Badge>{{ labClass.students?.length || 0 }}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent class="p-0">
                            <div class="max-h-[500px] overflow-y-auto">
                                <div v-for="student in labClass.students" :key="student.id" class="flex justify-between items-center p-3 border-b hover:bg-gray-50">
                                    <div>
                                        <div class="font-medium text-sm">{{ student.name }}</div>
                                        <div class="text-xs text-gray-500">{{ student.nim }} • {{ student.email }}</div>
                                    </div>
                                    <button @click="removeStudent(student)" class="text-gray-400 hover:text-red-600 p-1" title="Keluarkan">
                                        &times;
                                    </button>
                                </div>
                                <div v-if="!labClass.students?.length" class="p-4 text-center text-sm text-gray-500">
                                    Belum ada mahasiswa.
                                </div>
                            </div>
                            <div class="p-3 border-t bg-gray-50">
                                <Button @click="showEnrollDialog = true" class="w-full">Tambahkan Mahasiswa</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>

        <!-- Modals -->
        <!-- Module Dialog -->
        <Dialog v-model:open="showModuleDialog">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{{ editingModule ? 'Edit Modul' : 'Tambah Modul' }}</DialogTitle>
                </DialogHeader>
                <form @submit.prevent="submitModule" class="space-y-4 pt-2">
                    <div>
                        <label class="text-sm font-medium block mb-1">Judul Modul</label>
                        <input v-model="moduleForm.title" type="text" class="w-full rounded-md border px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label class="text-sm font-medium block mb-1">Urutan (Opsional)</label>
                        <input v-model="moduleForm.order" type="number" class="w-full rounded-md border px-3 py-2 text-sm" />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" @click="showModuleDialog = false">Batal</Button>
                        <Button type="submit" :disabled="moduleForm.processing">Simpan</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <!-- Assignment Dialog -->
        <Dialog v-model:open="showAssignmentDialog">
            <DialogContent class="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Tambah Tugas</DialogTitle>
                </DialogHeader>
                <form @submit.prevent="submitAssignment" class="space-y-4 pt-2">
                    <div>
                        <label class="text-sm font-medium block mb-1">Judul Tugas</label>
                        <input v-model="assignmentForm.title" type="text" class="w-full rounded-md border px-3 py-2 text-sm" required />
                    </div>
                    <div>
                        <label class="text-sm font-medium block mb-1">Deskripsi</label>
                        <textarea v-model="assignmentForm.description" rows="3" class="w-full rounded-md border px-3 py-2 text-sm"></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="text-sm font-medium block mb-1">Tenggat Waktu (Deadline)</label>
                            <input v-model="assignmentForm.deadline" type="datetime-local" class="w-full rounded-md border px-3 py-2 text-sm" required />
                        </div>
                        <div>
                            <label class="text-sm font-medium block mb-1">Nilai Maksimal</label>
                            <input v-model="assignmentForm.max_score" type="number" min="1" max="1000" class="w-full rounded-md border px-3 py-2 text-sm" required />
                        </div>
                    </div>
                    <div>
                        <label class="text-sm font-medium block mb-1">Metode Penilaian</label>
                        <select v-model="assignmentForm.grading_method" class="w-full rounded-md border px-3 py-2 text-sm bg-white" required>
                            <option value="score">Skor Langsung (Score)</option>
                            <option value="rubric">Rubrik (Rubric)</option>
                        </select>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" @click="showAssignmentDialog = false">Batal</Button>
                        <Button type="submit" :disabled="assignmentForm.processing">Buat Tugas</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>

        <!-- Enroll Dialog -->
        <Dialog v-model:open="showEnrollDialog">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Tambahkan Mahasiswa</DialogTitle>
                    <DialogDescription>Pilih satu atau lebih mahasiswa untuk dimasukkan ke kelas ini.</DialogDescription>
                </DialogHeader>
                <form @submit.prevent="submitEnroll" class="space-y-4 pt-2">
                    <div class="max-h-[300px] overflow-y-auto border rounded-md p-2">
                        <div v-for="student in availableStudents" :key="student.id" class="flex items-center space-x-2 py-2 border-b last:border-0">
                            <input type="checkbox" :id="'s_'+student.id" :value="student.id" v-model="enrollForm.student_ids" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <label :for="'s_'+student.id" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {{ student.nim }} - {{ student.name }}
                            </label>
                        </div>
                        <div v-if="availableStudents.length === 0" class="text-sm text-gray-500 text-center py-4">
                            Semua mahasiswa sudah terdaftar di kelas ini.
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" @click="showEnrollDialog = false">Batal</Button>
                        <Button type="submit" :disabled="enrollForm.processing || enrollForm.student_ids.length === 0">Tambahkan</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </AuthenticatedLayout>
</template>
