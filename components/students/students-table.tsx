'use client'

import { useState, useMemo } from 'react'
import {
  flexRender,
  useTable,
  stockFeatures,
  tableFeatures,
  createSortedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  SortingState,
  PaginationState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { TableEmptyState } from '@/components/ui/table-empty-state'
import Link from 'next/link'
import {
  ArrowUpDown,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckSquare,
  Square,
  ArrowRight,
} from 'lucide-react'
import type { StudentRow } from '@/lib/types/student'

const features = tableFeatures({
  ...stockFeatures,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
})

export function StudentsTable({ data }: { data: StudentRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Filter data by status if chosen
  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return data
    return data.filter((s) => s.status === statusFilter)
  }, [data, statusFilter])

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredData.length && filteredData.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredData.map((s) => s.id)))
    }
  }

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  const columns: any[] = useMemo(
    () => [
      {
        id: 'select',
        header: () => (
          <button
            type="button"
            onClick={toggleSelectAll}
            className="flex items-center text-muted-foreground hover:text-foreground"
            aria-label="Select all"
          >
            {selectedIds.size > 0 && selectedIds.size === filteredData.length ? (
              <CheckSquare className="h-4 w-4 text-primary" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </button>
        ),
        cell: ({ row }: { row: any }) => {
          const isSelected = selectedIds.has(row.original.id)
          return (
            <button
              type="button"
              onClick={() => toggleSelectRow(row.original.id)}
              className="flex items-center text-muted-foreground hover:text-foreground"
              aria-label={`Select student ${row.original.admission_number}`}
            >
              {isSelected ? (
                <CheckSquare className="h-4 w-4 text-primary" />
              ) : (
                <Square className="h-4 w-4" />
              )}
            </button>
          )
        },
      },
      {
        accessorKey: 'admission_number',
        header: ({ column }: { column: any }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 text-xs font-semibold"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>Admission #</span>
            <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        ),
        cell: ({ row }: { row: any }) => (
          <span className="font-mono text-xs font-semibold tracking-tight tabular-nums text-foreground">
            {row.original.admission_number}
          </span>
        ),
      },
      {
        id: 'full_name',
        accessorFn: (row: StudentRow) => row.profiles?.full_name ?? '',
        header: 'Student Name',
        cell: ({ row }: { row: any }) => (
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">
              {row.original.profiles?.full_name ?? '—'}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.original.profiles?.email ?? 'No email on record'}
            </span>
          </div>
        ),
      },
      {
        id: 'class_section',
        accessorFn: (row: StudentRow) =>
          `${row.sections?.classes?.name ?? ''} ${row.sections?.name ?? ''}`,
        header: 'Class / Section',
        cell: ({ row }: { row: any }) => (
          <span className="font-medium text-foreground">
            {row.original.sections
              ? `${row.original.sections.classes?.name ?? ''} — ${row.original.sections.name}`
              : 'Unassigned'}
          </span>
        ),
      },
      {
        accessorKey: 'gender',
        header: 'Gender',
        cell: ({ row }: { row: any }) => (
          <span className="capitalize text-muted-foreground">{row.original.gender}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }: { row: any }) => (
          <StatusBadge status={row.original.status} />
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }: { row: any }) => (
          <div className="flex justify-end">
            <Link
              href={`/dashboard/students/${row.original.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline hover:opacity-85"
            >
              <span>View Profile</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ),
      },
    ],
    [selectedIds, filteredData]
  )

  // @ts-ignore
  const table = useTable({
    features,
    data: filteredData as any,
    columns: columns as any,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
  })

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or admission #..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-10 pl-9 pr-8 bg-card"
            />
            {globalFilter && (
              <button
                type="button"
                onClick={() => setGlobalFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter by status */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-lg border border-input bg-card px-3 text-xs font-medium text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
            <option value="transferred">Transferred</option>
          </select>

          <span className="text-xs text-muted-foreground tabular-nums">
            {filteredData.length} total
          </span>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs animate-in fade-in-50">
          <span className="font-medium text-foreground">
            <span className="font-semibold text-primary tabular-nums">{selectedIds.size}</span> student{selectedIds.size === 1 ? '' : 's'} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const selectedRows = data.filter((s) => selectedIds.has(s.id))
                const json = JSON.stringify(selectedRows, null, 2)
                const blob = new Blob([json], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `students-export-${new Date().toISOString().slice(0, 10)}.json`
                a.click()
              }}
              className="h-8 gap-1.5 bg-card text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Selected</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds(new Set())}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Table Data Container */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup: any) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header: any) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row: any) => {
              const isSelected = selectedIds.has(row.original.id)
              return (
                <TableRow
                  key={row.id}
                  data-state={isSelected ? 'selected' : undefined}
                  className="hover:bg-muted/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell: any) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="p-0">
                <TableEmptyState
                  title="No students found"
                  description={
                    globalFilter || statusFilter !== 'all'
                      ? 'No student records matched the current search criteria or status filter.'
                      : 'There are currently no students registered in the system.'
                  }
                  isFiltered={Boolean(globalFilter || statusFilter !== 'all')}
                  onClearFilters={() => {
                    setGlobalFilter('')
                    setStatusFilter('all')
                  }}
                  actionLabel="Add Student"
                  actionHref="/dashboard/students/new"
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination Footer */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Show</span>
          <select
            value={pagination.pageSize}
            onChange={(e) => {
              setPagination((prev) => ({
                ...prev,
                pageSize: Number(e.target.value),
                pageIndex: 0,
              }))
            }}
            className="h-8 rounded-md border border-input bg-card px-2 text-xs font-medium text-foreground outline-none"
          >
            {[10, 20, 30, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
          <span>
            per page · Page {pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 gap-1 text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 gap-1 text-xs"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
