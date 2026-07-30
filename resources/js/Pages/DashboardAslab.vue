<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link } from '@inertiajs/vue3';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import StatCard from '@/Components/StatCard.vue';
import { BookOpen, Clock, CheckCircle2 } from 'lucide-vue-next';

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
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <StatCard 
                        title="Akademik" 
                        :value="classes ? classes.length : 0" 
                        subtitle="Kelas Aktif" 
                        :icon="BookOpen"
                        variant="blue" 
                    />

                    <StatCard 
                        title="Penilaian" 
                        :value="pendingSubmissions ? pendingSubmissions.length : 0" 
                        subtitle="Menunggu Review" 
                        :icon="Clock"
                        variant="orange" 
                    />

                    <StatCard 
                        title="Riwayat" 
                        :value="0" 
                        subtitle="Tugas Dinilai" 
                        :icon="CheckCircle2"
                        variant="green" 
                    />
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
