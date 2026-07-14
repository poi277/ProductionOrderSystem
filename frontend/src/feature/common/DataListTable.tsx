import ListCheckbox from "./ListCheckbox";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

export type DataListColumn<TRow> = {
  align?: "left" | "center" | "right";
  cellClassName?: string;
  header: string;
  key: string;
  render: (row: TRow) => ReactNode;
};

type DataListTableProps<TRow> = {
  columns: DataListColumn<TRow>[];
  rows: TRow[];
  checkboxHeader?: string;
  emptyMessage?: string;
  selectedRowId?: string | number | null;
  checkedRowIds?: Array<string | number>;
  getRowId: (row: TRow) => string | number;
  onBlankClick?: () => void;
  onCheckboxChange?: (row: TRow) => void;
  onRowClick?: (row: TRow) => void;
};

export default function DataListTable<TRow>({
  columns,
  rows,
  checkboxHeader,
  emptyMessage,
  selectedRowId,
  checkedRowIds,
  getRowId,
  onBlankClick,
  onCheckboxChange,
  onRowClick,
}: DataListTableProps<TRow>) {
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const pageRows = useMemo(
    () => rows.slice((activePage - 1) * pageSize, activePage * pageSize),
    [activePage, rows],
  );
  const pageRowIds = pageRows.map(getRowId);
  const checkedIds = checkedRowIds ?? [];
  const isAllPageRowsChecked = pageRowIds.length > 0 && pageRowIds.every((rowId) => checkedIds.includes(rowId));

  const handleToggleAllPageRows = () => {
    if (!onCheckboxChange) {
      return;
    }

    pageRows.forEach((row) => {
      const rowId = getRowId(row);

      if (isAllPageRowsChecked || !checkedIds.includes(rowId)) {
        onCheckboxChange(row);
      }
    });
  };

  return (
    <section
      className="min-h-0 min-w-0 flex-1 overflow-hidden border-t border-slate-200"
      onClick={onBlankClick}
    >
      <div className="flex h-full min-w-0 max-w-full flex-col overflow-hidden">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <colgroup>
            <col style={{ width: checkboxHeader ? "64px" : "40px" }} />
            {columns.map((column) => (
              <col key={column.key} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-slate-200 text-xs text-slate-500">
              <th className="px-3 py-3 text-center font-bold text-slate-900">
                <div className="flex flex-col items-center justify-center gap-1">
                  {checkboxHeader && <span>{checkboxHeader}</span>}
                  <ListCheckbox checked={isAllPageRowsChecked} onChange={handleToggleAllPageRows} />
                </div>
              </th>
              {columns.map((column, columnIndex) => {
                const align = column.align ?? (columnIndex < 3 ? "left" : "center");

                return (
                <th
                  className={`px-3 py-3 font-bold text-slate-900 ${
                    align === "right" ? "text-right" : align === "center" ? "text-center" : ""
                  }`}
                  key={column.key}
                >
                  {column.header}
                </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => {
              const rowId = getRowId(row);
              const isActive = selectedRowId === rowId;
              const isChecked = checkedRowIds ? checkedRowIds.includes(rowId) : isActive;

              return (
                <tr
                  className={`cursor-pointer border-b border-slate-100 ${
                    isActive ? "bg-[#f4f8ff]" : "hover:bg-slate-50"
                  }`}
                  key={rowId}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (onCheckboxChange) {
                      onCheckboxChange(row);
                    }
                    onRowClick?.(row);
                  }}
                >
                  <td className="px-3 py-3 text-center">
                    <span className="inline-flex">
                      <ListCheckbox
                        checked={isChecked}
                        onChange={() => {
                          if (onCheckboxChange) {
                            onCheckboxChange(row);
                            return;
                          }

                          onRowClick?.(row);
                        }}
                      />
                    </span>
                  </td>
                  {columns.map((column, columnIndex) => {
                    const align = column.align ?? (columnIndex < 3 ? "left" : "center");
                    const cellClassName =
                      column.cellClassName ?? "truncate px-3 py-3 font-bold text-slate-900";

                    return (
                    <td
                      className={`${cellClassName} ${
                        align === "right" ? "text-right" : align === "center" ? "text-center" : ""
                      }`}
                      key={column.key}
                    >
                      {column.render(row)}
                    </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && emptyMessage && (
          <div className="flex min-h-0 flex-1 items-center justify-center px-4 text-center text-sm font-bold text-slate-400">
            {emptyMessage}
          </div>
        )}
        {totalPages > 1 && (
          <div className="mt-auto flex items-center justify-center gap-1 py-4 text-sm font-semibold text-slate-500">
            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;
              const isActive = activePage === page;

              return (
                <button
                  className={`flex size-8 items-center justify-center rounded-full transition-colors ${
                    isActive ? "bg-slate-950 text-white" : "hover:bg-slate-100 hover:text-slate-950"
                  }`}
                  key={page}
                  onClick={(event) => {
                    event.stopPropagation();
                    setCurrentPage(page);
                  }}
                  type="button"
                >
                  {page}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
