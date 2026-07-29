<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link } from '@inertiajs/vue3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const props = defineProps({
    classes: Array,
    pendingSubmissions: Array
});
</script>

<template>
    <Head title="Dashboard Aslab" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Dashboard Aslab</h2>
        </template>

        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                <!-- Overview Stats -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader class="pb-2">
                            <CardTitle class="text-sm font-medium text-gray-500">Kelas Aktif</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div class="text-3xl font-bold">{{ classes.length }}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader class="pb-2">
                            <CardTitle class="text-sm font-medium text-gray-500">Tugas Menunggu Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div class="text-3xl font-bold text-orange-600">{{ pendingSubmissions.length }}</div>
                        </CardContent>
                    </Card>
                </div>

                <!-- Pending Submissions -->
                <Card>
                    <CardHeader>
                        <CardTitle>Antrean Penilaian</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table v-if="pendingSubmissions.length > 0">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mahasiswa</TableHead>
                                    <TableHead>Tugas</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Waktu Kumpul</TableHead>
                                    <TableHead class="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="sub in pendingSubmissions" :key="sub.id">
                                    <TableCell class="font-medium">{{ sub.user.name }} ({{ sub.user.nim }})</TableCell>
                                    <TableCell>{{ sub.assignment.title }}</TableCell>
                                    <TableCell>
                                        <Badge :variant="sub.is_late ? 'destructive' : 'default'" class="bg-orange-100 text-orange-800 hover:bg-orange-100 border-none">
                                            {{ sub.is_late ? 'Terlambat' : 'Menunggu' }}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{{ new Date(sub.submitted_at).toLocaleString() }}</TableCell>
                                    <TableCell class="text-right">
                                        <!-- Temporarily passing empty data for fileTree to demo the view -->
                                        <Link :href="route('submissions.review', sub.id)">
                                            <Button size="sm">Review Code</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        <div v-else class="text-center py-6 text-gray-500">
                            Tidak ada tugas yang menunggu direview.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
