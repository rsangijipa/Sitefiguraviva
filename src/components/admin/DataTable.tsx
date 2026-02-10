"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  SearchX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/Skeleton";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchKey?: keyof T;
  actions?: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
  pageSize?: number;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  isLoading = false,
  searchPlaceholder = "Buscar...",
  searchKey,
  actions,
  onRowClick,
  pageSize = 10,
  emptyMessage = "Nenhum registro encontrado.",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data
  const filteredData = useMemo(() => {
    if (!searchTerm || !searchKey) return data;

    return data.filter((item) => {
      const value = item[searchKey];
      if (typeof value === "string") {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  }, [data, searchTerm, searchKey]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-500">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            size={18}
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-100 rounded-xl text-sm outline-none focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-600 bg-white border border-stone-100 rounded-xl hover:bg-stone-50 transition-colors">
            <Filter size={16} />
            Filtros
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-600 bg-white border border-stone-100 rounded-xl hover:bg-stone-50 transition-colors">
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={() => column.sortable && handleSort(column.key)}
                    className={cn(
                      "px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400 select-none",
                      column.sortable &&
                        "cursor-pointer hover:text-stone-700 transition-colors",
                      column.className,
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {column.sortable &&
                        sortConfig?.key === column.key &&
                        (sortConfig.direction === "asc" ? (
                          <ChevronUp size={12} />
                        ) : (
                          <ChevronDown size={12} />
                        ))}
                    </div>
                  </th>
                ))}
                {actions && (
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-stone-400 text-right">
                    Ações
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4">
                        <Skeleton className="h-4 w-full opacity-50" />
                      </td>
                    ))}
                    {actions && (
                      <td className="px-6 py-4 text-right">
                        <Skeleton className="h-8 w-8 rounded-full ml-auto" />
                      </td>
                    )}
                  </tr>
                ))
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onRowClick?.(item)}
                    className={cn(
                      "group hover:bg-stone-50/50 transition-colors",
                      onRowClick && "cursor-pointer",
                    )}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "px-6 py-4 text-sm text-stone-600",
                          column.className,
                        )}
                      >
                        {column.render
                          ? column.render(item)
                          : (item as any)[column.key]}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-6 py-4 text-right">
                        <div onClick={(e) => e.stopPropagation()}>
                          {actions(item)}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length + (actions ? 1 : 0)}
                    className="px-6 py-20 text-center"
                  >
                    <div className="flex flex-col items-center gap-2 text-stone-400">
                      <SearchX
                        size={40}
                        strokeWidth={1.5}
                        className="opacity-20 mb-2"
                      />
                      <p className="text-sm font-medium">{emptyMessage}</p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="text-primary text-xs font-bold hover:underline mt-2"
                        >
                          Limpar busca
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isLoading && sortedData.length > pageSize && (
          <div className="px-6 py-4 bg-stone-50/30 border-t border-stone-100 flex items-center justify-between">
            <p className="text-xs text-stone-400">
              Mostrando{" "}
              <span className="font-bold text-stone-600">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              a{" "}
              <span className="font-bold text-stone-600">
                {Math.min(currentPage * pageSize, sortedData.length)}
              </span>{" "}
              de{" "}
              <span className="font-bold text-stone-600">
                {sortedData.length}
              </span>{" "}
              registros
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-white rounded-lg border border-transparent hover:border-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex items-center px-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      "w-8 h-8 text-xs font-bold rounded-lg transition-all",
                      currentPage === i + 1
                        ? "bg-primary text-white shadow-md shadow-primary/20"
                        : "text-stone-400 hover:text-stone-700 hover:bg-white",
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-white rounded-lg border border-transparent hover:border-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
