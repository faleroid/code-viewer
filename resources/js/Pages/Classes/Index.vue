<script setup>
import { ref } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link } from '@inertiajs/vue3';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

defineProps({
    classes: Array,
});
</script>

<template>
    <Head title="Daftar Kelas" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Daftar Semua Kelas</h2>
        </template>

        <div class="py-12">
            <div class="max-w-6xl mx-auto sm:px-6 lg:px-8">
                <Card>
                    <CardContent class="p-0">
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
                                <TableRow v-for="cls in classes" :key="cls.id">
                                    <TableCell>
                                        <Link :href="route('courses.show', cls.course_id)" class="text-blue-600 hover:underline">
                                            {{ cls.course?.name }}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link :href="route('classes.show', cls.id)" class="text-blue-600 hover:underline font-medium">
                                            {{ cls.name }}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{{ cls.semester }}</Badge>
                                    </TableCell>
                                    <TableCell>{{ cls.aslab?.name || '-' }}</TableCell>
                                    <TableCell>{{ cls.students_count }}</TableCell>
                                </TableRow>
                                <TableRow v-if="classes.length === 0">
                                    <TableCell colspan="5" class="text-center py-8 text-gray-500">Belum ada kelas.</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
