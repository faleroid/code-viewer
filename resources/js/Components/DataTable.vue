<script setup lang="ts">
import type { ColumnDef, SortingState, ColumnFiltersState } from '@tanstack/vue-table'
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { ref, computed, h } from 'vue'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table'

import { Input } from '@/Components/ui/input'
import { Button } from '@/Components/ui/button'
import Checkbox from '@/Components/Checkbox.vue'
import { Filter, Search, FileSpreadsheet, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  tableTitle?: string
  columns: ColumnDef<any, any>[]
  data: any[]
  searchPlaceholder?: string
  showSelect?: boolean
  showExport?: boolean
  showFilter?: boolean
}>(), {
  tableTitle: 'Data Tabel',
  searchPlaceholder: 'Cari',
  showSelect: true,
  showExport: true,
  showFilter: true,
})

const emit = defineEmits<{
  (e: 'export'): void
  (e: 'filter'): void
}>()

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const globalFilter = ref('')
const rowSelection = ref({})

// Augment columns with selection checkbox if showSelect is true
const finalColumns = computed(() => {
  if (!props.showSelect) return props.columns

  const selectColumn: ColumnDef<any, any> = {
    id: 'select',
    header: ({ table }) => h('div', { class: 'px-1 flex items-center justify-center' }, [
      h(Checkbox, {
        checked: table.getIsAllPageRowsSelected(),
        'onUpdate:checked': (val: boolean) => table.toggleAllPageRowsSelected(!!val),
        class: 'rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4',
      }),
    ]),
    cell: ({ row }) => h('div', { class: 'px-1 flex items-center justify-center' }, [
      h(Checkbox, {
        checked: row.getIsSelected(),
        'onUpdate:checked': (val: boolean) => row.toggleSelected(!!val),
        class: 'rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4',
      }),
    ]),
    enableSorting: false,
    enableHiding: false,
  }

  return [selectColumn, ...props.columns]
})

const table = useVueTable({
  get data() { return props.data },
  get columns() { return finalColumns.value },
  state: {
    get sorting() { return sorting.value },
    get columnFilters() { return columnFilters.value },
    get globalFilter() { return globalFilter.value },
    get rowSelection() { return rowSelection.value },
  },
  onSortingChange: updaterOrValue => {
    sorting.value = typeof updaterOrValue === 'function' ? updaterOrValue(sorting.value) : updaterOrValue
  },
  onColumnFiltersChange: updaterOrValue => {
    columnFilters.value = typeof updaterOrValue === 'function' ? updaterOrValue(columnFilters.value) : updaterOrValue
  },
  onGlobalFilterChange: updaterOrValue => {
    globalFilter.value = typeof updaterOrValue === 'function' ? updaterOrValue(globalFilter.value) : updaterOrValue
  },
  onRowSelectionChange: updaterOrValue => {
    rowSelection.value = typeof updaterOrValue === 'function' ? updaterOrValue(rowSelection.value) : updaterOrValue
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
})
</script>

<template>
  <div class="w-full bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
    <!-- Header Controls -->
    <div class="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
      <h2 class="text-lg font-semibold text-slate-800 tracking-tight">{{ tableTitle }}</h2>
      
      <div class="flex items-center gap-2.5 flex-wrap">
        <!-- Filter Button -->
        <Button 
          v-if="showFilter"
          variant="outline" 
          size="sm" 
          class="h-9 px-3 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-none gap-2 font-normal rounded-lg"
          @click="emit('filter')"
        >
          <Filter class="w-4 h-4 text-slate-500" />
          <span>Filter</span>
        </Button>

        <!-- Search Input -->
        <div class="relative min-w-[180px] sm:min-w-[220px]">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input 
            v-model="globalFilter"
            :placeholder="searchPlaceholder"
            class="h-9 pl-9 pr-3 text-sm bg-slate-50/50 border-slate-200 focus:bg-white focus:border-slate-300 focus-visible:ring-1 focus-visible:ring-slate-400 rounded-lg placeholder:text-slate-400"
          />
        </div>

        <!-- Excel / Export Button -->
        <Button 
          v-if="showExport"
          variant="outline" 
          size="sm" 
          class="h-9 px-3 border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100/70 hover:text-emerald-800 shadow-none gap-1.5 font-medium rounded-lg"
          @click="emit('export')"
        >
          <FileSpreadsheet class="w-4 h-4 text-emerald-600" />
          <span>Excel</span>
        </Button>
      </div>
    </div>

    <!-- Table Container -->
    <div class="relative overflow-x-auto">
      <Table class="w-full text-left text-sm border-collapse">
        <TableHeader class="bg-slate-50/70 border-b border-slate-200/80">
          <TableRow 
            v-for="headerGroup in table.getHeaderGroups()" 
            :key="headerGroup.id"
            class="hover:bg-transparent border-b-slate-200/80"
          >
            <TableHead 
              v-for="header in headerGroup.headers" 
              :key="header.id"
              class="h-11 px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider border-r last:border-r-0 border-slate-200/60 select-none"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody class="divide-y divide-slate-100">
          <template v-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() ? 'selected' : undefined"
              class="hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-b-0 data-[state=selected]:bg-emerald-50/30"
            >
              <TableCell 
                v-for="cell in row.getVisibleCells()" 
                :key="cell.id"
                class="px-4 py-3.5 text-slate-700 border-r last:border-r-0 border-slate-100 align-middle"
              >
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell :colspan="finalColumns.length" class="h-32 text-center text-slate-400 font-medium">
                Tidak ada data yang ditemukan.
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Table Footer / Pagination (if multi-page) -->
    <div 
      v-if="table.getPageCount() > 1" 
      class="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500"
    >
      <div>
        Menampilkan page {{ table.getState().pagination.pageIndex + 1 }} dari {{ table.getPageCount() }}
      </div>
      <div class="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          class="h-7 w-7 border-slate-200"
          :disabled="!table.getCanPreviousPage()"
          @click="table.setPageIndex(0)"
        >
          <ChevronsLeft class="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          class="h-7 w-7 border-slate-200"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
        >
          <ChevronLeft class="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          class="h-7 w-7 border-slate-200"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
        >
          <ChevronRight class="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          class="h-7 w-7 border-slate-200"
          :disabled="!table.getCanNextPage()"
          @click="table.setPageIndex(table.getPageCount() - 1)"
        >
          <ChevronsRight class="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  </div>
</template>
