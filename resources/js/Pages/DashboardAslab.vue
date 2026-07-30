<script setup lang="ts">
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import { Head, Link } from '@inertiajs/vue3'
import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import StatCard from '@/Components/StatCard.vue'
import { route } from 'ziggy-js'
import Title from '@/Components/Title.vue'
import DataTable from '@/Components/DataTable.vue'
import { Button } from '@/Components/ui/button'
import { BookOpen, Clock, CheckCircle2, Code2 } from 'lucide-vue-next'

const props = defineProps<{
  classes?: any[]
  pendingSubmissions?: any[]
}>()

// Column setup according to the reference UI
const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'user.name',
    header: ({ column }) => h('div', { class: 'flex items-center gap-1 cursor-pointer select-none', onClick: () => column.toggleSorting() }, [
      'Mahasiswa',
      column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕',
    ]),
    cell: ({ row }) => {
      const sub = row.original
      const userName = sub.user?.name || 'Mahasiswa'
      const userNim = sub.user?.nim || '-'
      const initials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()

      // Color mapping for avatar initials based on name length
      const bgColors = ['bg-amber-800 text-white', 'bg-teal-700 text-white', 'bg-stone-500 text-white', 'bg-emerald-600 text-white', 'bg-blue-600 text-white']
      const colorIndex = (userName.length + (userNim ? userNim.length : 0)) % bgColors.length
      const colorClass = bgColors[colorIndex]

      return h('div', { class: 'flex items-center gap-3' }, [
        h('div', { class: `w-9 h-9 rounded-full ${colorClass} font-semibold text-xs flex items-center justify-center shrink-0 shadow-sm` }, initials),
        h('div', [
          h('div', { class: 'font-medium text-slate-800' }, userName),
          h('div', { class: 'text-xs text-slate-400 font-mono' }, `NIM: ${userNim}`),
        ]),
      ])
    },
  },
  {
    accessorKey: 'assignment.title',
    header: ({ column }) => h('div', { class: 'flex items-center gap-1 cursor-pointer select-none', onClick: () => column.toggleSorting() }, [
      'Tugas Praktikum',
      column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕',
    ]),
    cell: ({ row }) => {
      const sub = row.original
      return h('div', [
        h('div', { class: 'font-medium text-slate-700' }, sub.assignment?.title || 'Tugas'),
        h('div', { class: 'text-xs text-slate-400' }, sub.assignment?.course?.name || 'Praktikum'),
      ])
    },
  },
  {
    accessorKey: 'is_late',
    header: ({ column }) => h('div', { class: 'flex items-center gap-1 cursor-pointer select-none', onClick: () => column.toggleSorting() }, [
      'Status Penyerahan',
      column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕',
    ]),
    cell: ({ row }) => {
      const sub = row.original
      if (sub.is_late) {
        return h('span', { class: 'px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 tracking-wide uppercase' }, 'TERLAMBAT')
      }
      return h('span', { class: 'px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 tracking-wide uppercase' }, 'MENUNGGU')
    },
  },
  {
    accessorKey: 'submitted_at',
    header: ({ column }) => h('div', { class: 'flex items-center gap-1 cursor-pointer select-none', onClick: () => column.toggleSorting() }, [
      'Waktu Kumpul',
      column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕',
    ]),
    cell: ({ row }) => {
      const sub = row.original
      if (!sub.submitted_at) return h('span', { class: 'text-slate-400' }, '-')
      const date = new Date(sub.submitted_at)
      return h('div', { class: 'text-sm text-slate-700' }, date.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }))
    },
  },
  {
    id: 'actions',
    header: () => h('div', { class: 'text-right' }, 'Aksi'),
    cell: ({ row }) => {
      const sub = row.original
      return h('div', { class: 'text-right' }, [
        h(Link, { href: route('submissions.review', sub.id) }, () => [
          h(Button, {
            size: 'sm',
            class: 'h-8 px-3 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm gap-1.5',
          }, () => [
            h(Code2, { class: 'w-3.5 h-3.5' }),
            'Review Code',
          ]),
        ]),
      ])
    },
  },
]
</script>

<template>
  <Head title="Dashboard Aslab" />

  <AuthenticatedLayout>
    <div class="px-6 md:px-12 py-6 pb-12">
      <Title title="Dashboard Asisten" subtitle="Rangkuman dan Informasi Praktikum" />

      <div class="max-w-7xl mx-auto space-y-6">
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

        <!-- DataTable Antrean Penilaian -->
        <DataTable 
          :columns="columns" 
          :data="pendingSubmissions || []" 
          tableTitle="Antrean Penilaian"
          searchPlaceholder="Cari mahasiswa atau tugas..."
        />
      </div>
    </div>
  </AuthenticatedLayout>
</template>
