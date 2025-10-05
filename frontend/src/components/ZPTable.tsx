'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key?: keyof T | string;
  accessorKey?: keyof T | string;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  cell?: (props: { row: T; value: any }) => React.ReactNode;
}

interface ZPTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T) => void;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

export function ZPTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  className,
  onRowClick,
  sortBy,
  sortDirection,
  onSort,
}: ZPTableProps<T>) {
  // Ensure data is always an array to prevent map errors
  const safeData = Array.isArray(data) ? data : [];

  const handleSort = (column: Column<T>) => {
    if (column.sortable && onSort) {
      onSort((column.key || column.accessorKey) as string);
    }
  };

  if (loading) {
    return (
      <div className='w-full'>
        <div className='animate-pulse'>
          <div className='h-10 bg-gray-200 rounded mb-4'></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='h-8 bg-gray-100 rounded mb-2'></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full overflow-auto', className)}>
      <table className='w-full border-collapse'>
        <thead>
          <tr className='border-b border-gray-200 bg-gray-50'>
            {columns.map((column, index) => (
              <th
                key={column.key || column.accessorKey || index}
                className={cn(
                  'px-4 py-3 text-left text-sm font-medium text-gray-700',
                  column.sortable && 'cursor-pointer hover:bg-gray-100',
                  column.className
                )}
                onClick={() => handleSort(column)}
              >
                <div className='flex items-center space-x-1'>
                  <span>{column.header}</span>
                  {column.sortable && (
                    <span className='text-gray-400'>
                      {sortBy === (column.key || column.accessorKey) ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className='px-4 py-8 text-center text-gray-500'>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            safeData.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  'border-b border-gray-100 hover:bg-gray-50',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column, colIndex) => {
                  const accessorKey = column.accessorKey || column.key;
                  const value = accessorKey ? row[accessorKey as keyof T] : null;
                  
                  return (
                    <td
                      key={column.key || column.accessorKey || colIndex}
                      className={cn('px-4 py-3 text-sm text-gray-900', column.className)}
                    >
                      {column.cell
                        ? column.cell({ row, value })
                        : column.render
                        ? column.render(value, row)
                        : value}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
