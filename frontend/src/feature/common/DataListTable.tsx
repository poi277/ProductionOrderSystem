import ListCheckbox from "./ListCheckbox";
import { ResizableColumnHandle, useResizableTableColumns } from "./ResizableTableColumns";
import { getCategoryActiveClass } from "./categoryActiveStyles";
import type { CategoryActiveKey } from "./categoryActiveStyles";
import type { ReactNode } from "react";
import { useMemo } from "react";

export type DataListColumn<TRow> = {
  align?: "left" | "center" | "right";
  cellClassName?: string;
  header: string;
  key: string;
  render: (row: TRow) => ReactNode;
};

type DataListTableProps<TRow> = {
  categoryKey?: CategoryActiveKey;
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
  onColumnSort?: (key: string) => void;
  sortableColumnKeys?: string[];
  sortConditions?: Array<{ key: string; direction: "asc" | "desc" }>;
};

export default function DataListTable<TRow>({
  categoryKey = "settings",
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
  onColumnSort,
  sortableColumnKeys = [],
  sortConditions = [],
}: DataListTableProps<TRow>) {
  const rowIds = rows.map(getRowId);
  const checkedIdSet = useMemo(() => new Set(checkedRowIds ?? []), [checkedRowIds]);
  const isAllRowsChecked = rowIds.length > 0 && rowIds.every((rowId) => checkedIdSet.has(rowId));
  const { columnWidths, startResize, tableWidth } = useResizableTableColumns();
  const unitWidth = 100 / columns.length;

  const handleToggleAllRows = () => {
    if (!onCheckboxChange) {
      return;
    }

    rows.forEach((row) => {
      const rowId = getRowId(row);

      if (isAllRowsChecked || !checkedIdSet.has(rowId)) {
        onCheckboxChange(row);
      }
    });
  };

  return (
    <section
      className="h-[calc(100dvh-245px)] min-h-48 min-w-0 shrink-0 overflow-hidden border-t border-slate-200"
      onClick={onBlankClick}
    >
      <div className="data-list-scrollbar h-full min-w-0 max-w-full overflow-y-scroll overscroll-contain [scrollbar-gutter:stable]">
        <table
          className="w-full table-fixed border-collapse text-left text-sm"
          style={tableWidth == null ? undefined : { width: tableWidth }}
        >
          <colgroup>
            <col style={{ width: columnWidths?.[0] ?? `${unitWidth / 2}%` }} />
            {columns.map((column, index) => (
              <col
                key={column.key}
                style={{ width: columnWidths?.[index + 1] ?? `${index === 0 ? unitWidth / 2 : unitWidth}%` }}
              />
            ))}
          </colgroup>
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-slate-200 text-[13px] font-semibold text-slate-600">
              <th className="relative px-3 py-3 text-center text-[13px] font-semibold text-slate-600">
                <div className="flex flex-col items-center justify-center gap-1">
                  {checkboxHeader && <span>{checkboxHeader}</span>}
                  <ListCheckbox checked={isAllRowsChecked} onChange={handleToggleAllRows} />
                </div>
                <ResizableColumnHandle columnIndex={0} onResize={startResize} />
              </th>
              {columns.map((column, columnIndex) => {
                const sortable = sortableColumnKeys.includes(column.key);
                const condition = sortConditions.find((item) => item.key === column.key);

                return (
                <th
                  className="relative p-0 text-center text-[13px] font-semibold text-slate-600"
                  key={column.key}
                >
                  {sortable ? (
                    <button
                      className={`relative flex w-full items-center justify-center rounded-xl px-7 py-3 text-[13px] font-semibold !text-slate-600 transition-colors ${
                        condition ? getCategoryActiveClass(categoryKey) : "text-slate-900 hover:bg-slate-100"
                      }`}
                      onClick={() => onColumnSort?.(column.key)}
                      type="button"
                    >
                      {column.header}
                      <ColumnSortIcon direction={condition?.direction} />
                    </button>
                  ) : <div className="px-3 py-3 text-[13px] font-semibold text-slate-600">{column.header}</div>}
                  {columnIndex < columns.length - 1 && (
                    <ResizableColumnHandle columnIndex={columnIndex + 1} onResize={startResize} />
                  )}
                </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const rowId = getRowId(row);
              const isActive = selectedRowId === rowId;
              const isChecked = checkedIdSet.has(rowId);

              return (
                <tr
                  className={`cursor-pointer border-b border-slate-100 ${
                    isActive ? "bg-[#f4f8ff]" : "hover:bg-slate-50"
                  }`}
                  key={rowId}
                  onClick={(event) => {
                    event.stopPropagation();
                    onRowClick?.(row);
                  }}
                >
                  <td className="px-3 py-3 text-center">
                    <span className="inline-flex">
                      <ListCheckbox
                        checked={isChecked}
                        onChange={onCheckboxChange ? () => onCheckboxChange(row) : undefined}
                      />
                    </span>
                  </td>
                  {columns.map((column, columnIndex) => {
                    const align = column.align ?? (columnIndex < 3 ? "left" : "center");
                    const cellClassName =
                      column.cellClassName ?? "truncate px-3 py-3 text-[15px] font-bold text-slate-900";

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
          <div className="flex min-h-48 items-center justify-center px-4 text-center text-sm font-bold text-slate-400">
            {emptyMessage}
          </div>
        )}
      </div>
    </section>
  );
}

function ColumnSortIcon({ direction }: { direction?: "asc" | "desc" }) {
  return (
    <svg
      aria-hidden="true"
      className={`absolute right-2 size-4 transition-opacity ${direction ? "opacity-100" : "opacity-35"}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
    >
      <path d={direction === "desc" ? "m6 9 6 6 6-6" : "m6 15 6-6 6 6"} />
    </svg>
  );
}
