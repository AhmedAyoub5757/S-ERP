'use client'

import { useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowUpDown } from 'lucide-react'
import type { TeacherRow } from '@/lib/types/teacher'

const columns: any[] = [
  {
    accessorKey: 'employee_number',
    header: ({ column }: { column: any }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Employee # <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    id: 'full_name',
    accessorFn: (row: TeacherRow) => row.profiles?.full_name ?? '',
    header: 'Name',
    cell: ({ row }: { row: any }) => row.original.profiles?.full_name ?? '—',
  },
  {
    id: 'email',
    accessorFn: (row: TeacherRow) => row.profiles?.email ?? '',
    header: 'Email',
    cell: ({ row }: { row: any }) => row.original.profiles?.email ?? '—',
  },
  {
    accessorKey: 'qualification',
    header: 'Qualification',
    cell: ({ row }: { row: any }) => row.original.qualification ?? '—',
  },
  {
    id: 'status',
    accessorFn: (row: TeacherRow) => row.profiles?.status ?? '',
    header: 'Status',
    cell: ({ row }: { row: any }) => (
      <Badge variant={row.original.profiles?.status === 'active' ? 'default' : 'secondary'} className="capitalize">
        {row.original.profiles?.status}
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }: { row: any }) => (
      <Link
        href={`/dashboard/teachers/${row.original.id}`}
        className="text-sm font-medium text-primary hover:underline"
      >
        View
      </Link>
    ),
  },
]

const features = tableFeatures({
  ...stockFeatures,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
})

export function TeachersTable({ data }: { data: TeacherRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })

  // @ts-ignore
  const table = useTable({
    features,
    data: data as any,
    columns: columns as any,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
  })

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search teachers..."
        value={globalFilter ?? ''}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />
      <div key={table.state.pagination.pageIndex} className="pagination-enter rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: any) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header: any) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row: any) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell: any) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No teachers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {table.state.pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </Button>
      </div>
    </div>
  )
}