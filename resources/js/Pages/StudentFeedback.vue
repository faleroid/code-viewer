<script setup>
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Head, Link } from '@inertiajs/vue3';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const props = defineProps({
    submission: Object,
    grade: Object
});
</script>

<template>
    <Head title="Feedback & Nilai" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">Feedback & Nilai: {{ submission.assignment.title }}</h2>
        </template>

        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                
                <Card v-if="grade">
                    <CardHeader>
                        <CardTitle class="text-2xl font-bold">Total Nilai: <span class="text-blue-600">{{ grade.score }}</span> / 100</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="space-y-4">
                            <div>
                                <h3 class="font-semibold text-gray-700 mb-1">Feedback Umum Asisten:</h3>
                                <div class="bg-gray-50 border border-gray-200 p-4 rounded-md whitespace-pre-line text-sm text-gray-800">
                                    {{ grade.feedback || 'Tidak ada feedback tertulis.' }}
                                </div>
                            </div>
                            
                            <div class="pt-4 border-t border-gray-100">
                                <p class="text-sm text-gray-500">Nilai diberikan pada: {{ new Date(grade.graded_at).toLocaleString() }}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card v-else>
                    <CardContent class="py-10 text-center text-gray-500 flex flex-col items-center">
                        <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h3 class="text-lg font-medium text-gray-900 mb-1">Tugas Belum Dinilai</h3>
                        <p>Asisten laboratorium sedang memeriksa tugas Anda. Silakan cek kembali nanti.</p>
                    </CardContent>
                </Card>

                <div class="flex justify-start">
                    <Link :href="route('dashboard')">
                        <Button variant="outline">Kembali ke Dashboard</Button>
                    </Link>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>
