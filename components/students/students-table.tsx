'use client'

import { useState } from 'react'
import {
  ColumnDef,
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
import type { StudentRow } from '@/lib/types/student'

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  inactive: 'secondary',
  graduated: 'outline',
  transferred: 'outline',
}

const columns: ColumnDef<StudentRow, any>[] = [
  {
    accessorKey: 'admission_number',
    header: ({ column }: { column: any }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Admission # <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    id: 'full_name',
    accessorFn: (row: StudentRow) => row.profiles?.full_name ?? '',
    header: 'Name',
    cell: ({ row }: { row: any }) => row.original.profiles?.full_name ?? '—',
  },
  {
    id: 'class_section',
    accessorFn: (row: StudentRow) => `${row.sections?.classes?.name ?? ''} ${row.sections?.name ?? ''}`,
    header: 'Class / Section',
    cell: ({ row }: { row: any }) =>
      row.original.sections
        ? `${row.original.sections.classes?.name ?? ''} ${row.original.sections.name}`
        : '—',
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ row }: { row: any }) => <span className="capitalize">{row.original.gender}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: any }) => (
      <Badge variant={statusVariant[row.original.status] ?? 'default'} className="capitalize">
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }: { row: any }) => (
      <Link
        href={`/dashboard/students/${row.original.id}`}
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

export function StudentsTable({ data }: { data: StudentRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

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
        placeholder="Search students..."
        value={globalFilter ?? ''}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
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
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {table.state.pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}