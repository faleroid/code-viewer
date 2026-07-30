<script setup lang="ts">
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue'
import { Head } from '@inertiajs/vue3'
import { ref, h } from 'vue'
import { useForm } from '@inertiajs/vue3'
import type { ColumnDef } from '@tanstack/vue-table'
import StatCard from '@/Components/StatCard.vue'
import Title from '@/Components/Title.vue'
import DataTable from '@/Components/DataTable.vue'
import { Button } from '@/Components/ui/button'
import { route } from 'ziggy-js'
import { Badge } from '@/Components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog'
import { BookOpen, Clock, CheckCircle2, FileUp } from 'lucide-vue-next'

const props = defineProps<{
  classes?: any[]
  assignments?: any[]
}>()

const isUploadOpen = ref(false)
const activeTask = ref<any>(null)

const form = useForm({
  file: null as File | null,
})

const openUpload = (task: any) => {
  activeTask.value = task
  form.clearErrors()
  form.reset()
  isUploadOpen.value = true
}

const handleUpload = () => {
  if (activeTask.value) {
    form.post(route('submissions.store', activeTask.value.id), {
      onSuccess: () => {
        isUploadOpen.value = false
      },
    })
  }
}

// Columns design following mockup matching table schema
const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => h('div', { class: 'flex items-center gap-1 cursor-pointer select-none', onClick: () => column.toggleSorting() }, [
      'Tugas / Mata Kuliah',
      column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕',
    ]),
    cell: ({ row }) => {
      const task = row.original
      const initials = (task.title || 'TG').slice(0, 2).toUpperCase()
      return h('div', { class: 'flex items-center gap-3' }, [
        h('div', { class: 'w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center shrink-0 border border-slate-300' }, initials),
        h('div', [
          h('div', { class: 'font-medium text-slate-800' }, task.title),
          h('div', { class: 'text-xs text-slate-500 line-clamp-1' }, task.description || 'Praktikum Web'),
        ]),
      ])
    },
  },
  {
    accessorKey: 'course',
    header: ({ column }) => h('div', { class: 'flex items-center gap-1 cursor-pointer select-none', onClick: () => column.toggleSorting() }, [
      'Kelas',
      column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕',
    ]),
    cell: ({ row }) => {
      const task = row.original
      return h('span', { class: 'px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100' }, task.course?.name || 'Praktikum Web')
    },
  },
  {
    accessorKey: 'deadline',
    header: ({ column }) => h('div', { class: 'flex items-center gap-1 cursor-pointer select-none', onClick: () => column.toggleSorting() }, [
      'Batas Waktu',
      column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕',
    ]),
    cell: ({ row }) => {
      const task = row.original
      if (!task.deadline) return h('span', { class: 'text-slate-400' }, '-')
      const deadline = new Date(task.deadline)
      return h('div', { class: 'text-sm text-slate-700 font-medium' }, deadline.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }))
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => h('div', { class: 'flex items-center gap-1 cursor-pointer select-none', onClick: () => column.toggleSorting() }, [
      'Status',
      column.getIsSorted() ? (column.getIsSorted() === 'asc' ? ' ↑' : ' ↓') : ' ↕',
    ]),
    cell: ({ row }) => {
      const task = row.original
      const deadline = task.deadline ? new Date(task.deadline) : null
      const isExpired = deadline ? deadline < new Date() : false
      
      if (isExpired) {
        return h('span', { class: 'px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-700 uppercase tracking-wide border border-amber-200' }, 'BERAKHIR')
      }
      return h('span', { class: 'px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-700 uppercase tracking-wide border border-blue-200' }, 'AKTIF')
    },
  },
  {
    id: 'actions',
    header: () => h('div', { class: 'text-right' }, 'Aksi'),
    cell: ({ row }) => {
      const task = row.original
      return h('div', { class: 'text-right' }, [
        h(Button, {
          size: 'sm',
          class: 'h-8 px-3 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm gap-1.5',
          onClick: () => openUpload(task),
        }, () => [
          h(FileUp, { class: 'w-3.5 h-3.5' }),
          'Kumpulkan',
        ]),
      ])
    },
  },
]
</script>

<template>
  <Head title="Dashboard Mahasiswa" />

  <AuthenticatedLayout>
    <div class="px-6 md:px-12 py-6">
      <Title title="Dashboard Mahasiswa" subtitle="Rangkuman dan Informasi Praktikum" />

      <div class="max-w-7xl mx-auto space-y-6">
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

        <!-- DataTable Tugas Praktikum -->
        <DataTable 
          :columns="columns" 
          :data="assignments || []" 
          tableTitle="Data Tugas Praktikum"
          searchPlaceholder="Cari tugas..."
        />
      </div>

      <!-- Upload Modal -->
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
              <label class="text-sm font-medium text-slate-700">File ZIP</label>
              <input 
                type="file" 
                accept=".zip" 
                @change="e => form.file = (e.target as HTMLInputElement).files?.[0] || null"
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
    </div>
  </AuthenticatedLayout>
</template>
