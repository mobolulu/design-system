import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';

type ColumnFiltersState = Array<{ id: string; value: unknown }>;
type SortingState = Array<{ id: string; desc: boolean }>;
type VisibilityState = Record<string, boolean>;
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableHeader,
  TablePagerButton,
  TableRow,
} from './Table';

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  filterable?: boolean;
  accessor?: (row: T) => string | number;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  pageSize?: number;
  searchPlaceholder?: string;
  searchable?: boolean;
  emptyMessage?: string;
  className?: string;
}

function getCell<T>(row: T, col: DataTableColumn<T>): string | number {
  if (col.accessor) return col.accessor(row);
  const v = (row as Record<string, unknown>)[col.key as string];
  return v == null ? '' : (v as string | number);
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  pageSize = 10,
  searchPlaceholder = 'Search...',
  searchable = true,
  emptyMessage = 'No results found.',
  className,
}: DataTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const filterableCols = columns.filter((c) => c.filterable);

  // Distinct values per filterable column
  const filterOptions = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const col of filterableCols) {
      const vals = Array.from(new Set(data.map((r) => String(getCell(r, col))))).sort();
      map[col.key as string] = vals;
    }
    return map;
  }, [data, filterableCols]);

  // Convert DataTableColumn[] to TanStack ColumnDef[]
  const tanstackColumns = useMemo<ColumnDef<T, any>[]>(
    () =>
      columns.map((col) => ({
        id: col.key as string,
        accessorFn: (row: T) => getCell(row, col),
        header: col.header,
        cell: ({ row }: { row: { original: T } }) => (col.render ? col.render(row.original) : String(getCell(row.original, col))),
        enableSorting: true,
        enableColumnFilter: col.filterable ?? false,
      })),
    [columns],
  );

  const table = useReactTable({
    data,
    columns: tanstackColumns,
    state: {
      globalFilter,
      columnFilters,
      sorting,
      columnVisibility,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
        pageIndex: 0,
      },
    },
  });

  const handleFilterChange = (columnId: string, value: string) => {
    table.getColumn(columnId)?.setFilterValue(value || undefined);
  };

  const currentPage = table.getState().pagination.pageIndex;
  const totalPages = table.getPageCount();
  const filteredRows = table.getFilteredRowModel().rows;
  const pageRows = table.getRowModel().rows;
  const start = currentPage * pageSize;

  const controlClass =
    'h-10 rounded-lg border border-input bg-background text-sm text-foreground transition-colors placeholder:text-muted-foreground hover:border-foreground/30 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20';

  return (
    <div className={cn('w-full', className)}>
      {(searchable || filterableCols.length > 0) && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {searchable && (
            <div className="relative w-full sm:w-72">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder={searchPlaceholder}
                className={cn(controlClass, 'w-full pl-9 pr-3')}
              />
            </div>
          )}
          {filterableCols.map((col) => {
            const columnId = col.key as string;
            const currentValue = (table.getColumn(columnId)?.getFilterValue() as string) ?? '';
            return (
              <select
                key={columnId}
                value={currentValue}
                onChange={(e) => handleFilterChange(columnId, e.target.value)}
                className={cn(controlClass, 'px-3')}
              >
                <option value="">{col.header}: All</option>
                {filterOptions[columnId].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            );
          })}
        </div>
      )}

      <TableContainer>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} plain>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          'group flex items-center gap-1.5',
                          header.column.getCanSort() && 'cursor-pointer select-none hover:text-foreground',
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span>
                            {header.column.getIsSorted() === 'asc' ? (
                              <ChevronUp className="h-3.5 w-3.5 text-foreground" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ChevronDown className="h-3.5 w-3.5 text-foreground" />
                            ) : (
                              <ChevronsUpDown className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-60" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow plain>
                <TableCell colSpan={columns.length} align="center" muted className="py-12">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell key={cell.id} emphasis={index === 0}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TableFooter>
          <span>
            {filteredRows.length === 0
              ? '0 results'
              : `Showing ${start + 1}–${Math.min(start + pageSize, filteredRows.length)} of ${filteredRows.length}`}
          </span>
          <div className="flex items-center gap-2">
            <TablePagerButton onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <ChevronLeft aria-hidden className="h-4 w-4" />
              Prev
            </TablePagerButton>
            <span className="px-1 tabular-nums">
              Page {currentPage + 1} / {totalPages}
            </span>
            <TablePagerButton onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
              <ChevronRight aria-hidden className="h-4 w-4" />
            </TablePagerButton>
          </div>
        </TableFooter>
      </TableContainer>
    </div>
  );
}
