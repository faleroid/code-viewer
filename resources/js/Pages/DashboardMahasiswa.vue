<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link } from '@inertiajs/vue3';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { useForm } from '@inertiajs/vue3';
import StatCard from '@/Components/StatCard.vue';
import { ref } from 'vue';
import { BookOpen, Clock, CheckCircle2 } from 'lucide-vue-next';

const props = defineProps({
    classes: Array,
    assignments: Array
});

const isUploadOpen = ref(false);
const activeTask = ref(null);

const form = useForm({
    file: null
});

const openUpload = (task) => {
    activeTask.value = task;
    form.clearErrors();
    form.reset();
    isUploadOpen.value = true;
};

const handleUpload = () => {
    if (activeTask.value) {
        form.post(route('submissions.store', activeTask.value.id), {
            onSuccess: () => {
                isUploadOpen.value = false;
            }
        });
    }
};
</script>

<template>
    <Head title="Dashboard" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>
        </template>

        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                <!-- Overview Stats -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <StatCard 
                        title="Akademik" 
                        :value="classes ? classes.length : 0" 
                        subtitle="Kelas Dikuti" 
                        :icon="BookOpen"
                        variant="blue" 
                    />

                    <StatCard 
                        title="Tugas" 
                        :value="assignments ? assignments.length : 0" 
                        subtitle="Belum Dikerjakan" 
                        :icon="Clock"
                        variant="orange" 
                    />

                    <StatCard 
                        title="Tugas Selesai" 
                        :value="0" 
                        subtitle="Tugas Selesai" 
                        :icon="CheckCircle2"
                        variant="purple" 
                    />
                </div>

                <!-- Active Assignments -->
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Tugas Praktikum</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table v-if="assignments.length > 0">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mata Kuliah - Kelas</TableHead>
                                    <TableHead>Tugas</TableHead>
                                    <TableHead>Batas Waktu</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead class="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="task in assignments" :key="task.id">
                                    <TableCell class="font-medium">
                                        <!-- In a real app we'd load the module->class->course relation -->
                                        Praktikum Web
                                    </TableCell>
                                    <TableCell>
                                        <div class="font-semibold">{{ task.title }}</div>
                                        <div class="text-xs text-gray-500 line-clamp-1">{{ task.description }}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div class="text-sm">{{ new Date(task.deadline).toLocaleDateString() }}</div>
                                        <div class="text-xs text-orange-600 font-medium">
                                            {{ new Date(task.deadline) < new Date() ? 'Berakhir' : 'Aktif' }}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">Belum Kumpul</Badge>
                                    </TableCell>
                                    <TableCell class="text-right">
                                        <Button size="sm" variant="default" @click="openUpload(task)">Kumpulkan</Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        <div v-else class="text-center py-6 text-gray-500">
                            Belum ada tugas praktikum.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>

        <Dialog v-model:open="isUploadOpen">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Kumpulkan Tugas</DialogTitle>
                    <DialogDescription>
                        Unggah file jawaban Anda untuk <strong>{{ activeTask?.title }}</strong> dalam format .zip.
                    </DialogDescription>
                </DialogHeader>
                
                <form @submit.prevent="handleUpload" class="space-y-4 pt-4">
                    <div class="grid w-full items-center gap-1.5">
                        <label class="text-sm font-medium">File ZIP</label>
                        <input 
                            type="file" 
                            accept=".zip" 
                            @input="form.file = $event.target.files[0]"
                            class="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                        />
                        <div v-if="form.errors.file" class="text-sm text-red-500 mt-1">{{ form.errors.file }}</div>
                    </div>
                    
                    <DialogFooter class="sm:justify-end mt-6">
                        <Button type="button" variant="outline" @click="isUploadOpen = false">Batal</Button>
                        <Button type="submit" :disabled="form.processing || !form.file">
                            {{ form.processing ? 'Mengunggah...' : 'Unggah' }}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </AuthenticatedLayout>
</template>
