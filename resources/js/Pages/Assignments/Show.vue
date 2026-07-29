<script setup>
import { computed } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link, usePage } from '@inertiajs/vue3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const props = defineProps({
    assignment: Object,
});

const page = usePage();
const user = computed(() => page.props.auth.user);
const isAslab = computed(() => user.value.role === 'aslab' || user.value.role === 'admin');

const getStatusColor = (status) => {
    switch (status) {
        case 'graded': return 'bg-green-100 text-green-800 border-green-200';
        case 'reviewing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'error': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'graded': return 'Selesai Dinilai';
        case 'reviewing': return 'Sedang Direview';
        case 'error': return 'Ekstrak Gagal';
        default: return 'Menunggu Review';
    }
};
</script>

<template>
    <Head :title="assignment.title" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex items-center justify-between">
                <div>
                    <Link v-if="isAslab" :href="route('classes.show', assignment.module.labClass.id)" class="text-sm text-gray-500 hover:underline mb-1 inline-block">&larr; Kembali ke Kelas {{ assignment.module.labClass.name }}</Link>
                    <Link v-else :href="route('dashboard')" class="text-sm text-gray-500 hover:underline mb-1 inline-block">&larr; Kembali ke Dashboard</Link>
                    <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                        {{ assignment.title }}
                    </h2>
                </div>
            </div>
        </template>

        <div class="py-12">
            <div class="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-6">
                <!-- Info Tugas -->
                <Card>
                    <CardHeader class="bg-gray-50 border-b py-4">
                        <div class="flex justify-between items-start">
                            <div>
                                <CardTitle class="text-lg">Informasi Tugas</CardTitle>
                                <div class="text-sm text-gray-500 mt-1">
                                    Mata Kuliah: {{ assignment.module.labClass.course.name }} • 
                                    Modul: {{ assignment.module.title }}
                                </div>
                            </div>
                            <Badge variant="outline" class="text-sm py-1">
                                Max Score: {{ assignment.max_score }}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent class="p-6">
                        <div class="prose max-w-none mb-6">
                            <p class="whitespace-pre-line text-gray-700">{{ assignment.description || 'Tidak ada deskripsi tugas.' }}</p>
                        </div>
                        <div class="flex gap-4 items-center">
                            <div class="bg-red-50 text-red-700 px-3 py-2 rounded-md border border-red-100 inline-flex items-center text-sm font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Tenggat: {{ new Date(assignment.deadline).toLocaleString() }}
                            </div>
                            <div class="bg-blue-50 text-blue-700 px-3 py-2 rounded-md border border-blue-100 inline-flex items-center text-sm font-medium">
                                Penilaian: {{ assignment.grading_method === 'rubric' ? 'Berdasarkan Rubrik' : 'Skor Langsung' }}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <!-- Daftar Submissions -->
                <Card>
                    <CardHeader>
                        <CardTitle class="text-lg">Pengumpulan Tugas (Submissions)</CardTitle>
                    </CardHeader>
                    <CardContent class="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mahasiswa</TableHead>
                                    <TableHead>Waktu Kumpul</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Nilai</TableHead>
                                    <TableHead class="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="sub in assignment.submissions" :key="sub.id">
                                    <TableCell>
                                        <div class="font-medium">{{ sub.user?.name }}</div>
                                        <div class="text-xs text-gray-500">{{ sub.user?.nim }}</div>
                                    </TableCell>
                                    <TableCell>
                                        {{ new Date(sub.submitted_at).toLocaleString() }}
                                        <Badge v-if="sub.is_late" variant="destructive" class="ml-2 text-[10px]">Terlambat</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" :class="getStatusColor(sub.status)">
                                            {{ getStatusLabel(sub.status) }}
                                        </Badge>
                                    </TableCell>
                                    <TableCell class="font-bold">
                                        {{ sub.grade ? sub.grade.score : '-' }} <span v-if="sub.grade" class="text-xs font-normal text-gray-500">/ {{ assignment.max_score }}</span>
                                    </TableCell>
                                    <TableCell class="text-right space-x-2">
                                        <template v-if="isAslab">
                                            <Button v-if="sub.status !== 'error'" as="a" :href="route('submissions.review', sub.id)" size="sm">
                                                Review & Nilai
                                            </Button>
                                        </template>
                                        <template v-else>
                                            <Button v-if="sub.status === 'graded'" as="a" :href="route('submissions.feedback', sub.id)" variant="outline" size="sm">
                                                Lihat Feedback
                                            </Button>
                                        </template>
                                    </TableCell>
                                </TableRow>
                                <TableRow v-if="assignment.submissions.length === 0">
                                    <TableCell colspan="5" class="text-center py-8 text-gray-500">
                                        Belum ada yang mengumpulkan tugas.
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
