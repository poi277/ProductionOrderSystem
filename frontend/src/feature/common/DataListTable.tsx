import ListCheckbox from "./ListCheckbox";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

export type DataListColumn<TRow> = {
  align?: "left" | "center" | "right";
  header: string;
  key: string;
  render: (row: TRow) => ReactNode;
};

type DataListTableProps<TRow> = {
  columns: DataListColumn<TRow>[];
  rows: TRow[];
  emptyMessage?: string;
  selectedRowId?: string | number | null;
  checkedRowIds?: Array<string | number>;
  getRowId: (row: TRow) => string | number;
  onBlankClick?: () => void;
  onCheckboxChange?: (row: TRow) => void;
  onRowClick: (row: TRow) => void;
};

export default function DataListTable<TRow>({
  columns,
  rows,
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

  return (
    <section
      className="min-h-0 min-w-0 flex-1 overflow-hidden border-t border-slate-200"
      onClick={onBlankClick}
    >
      <div className="flex h-full min-w-0 max-w-full flex-col overflow-hidden">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <colgroup>
            <col style={{ width: "40px" }} />
            {columns.map((column) => (
              <col key={column.key} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-slate-200 text-xs text-slate-500">
              <th className="w-10 px-3 py-3">
                <ListCheckbox />
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
                    onRowClick(row);
                  }}
                >
                  <td className="px-3 py-3">
                    <ListCheckbox
                      checked={isChecked}
                      onChange={() => {
                        if (onCheckboxChange) {
                          onCheckboxChange(row);
                          return;
                        }

                        onRowClick(row);
                      }}
                    />
                  </td>
                  {columns.map((column, columnIndex) => {
                    const align = column.align ?? (columnIndex < 3 ? "left" : "center");

                    return (
                    <td
                      className={`truncate px-3 py-3 font-bold text-slate-900 ${
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
