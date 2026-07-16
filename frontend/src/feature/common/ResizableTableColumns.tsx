"use client";

import { useState, type MouseEvent as ReactMouseEvent } from "react";

const MIN_COLUMN_WIDTH = 72;

export function useResizableTableColumns() {
  const [columnWidths, setColumnWidths] = useState<number[] | null>(null);
  const tableWidth = columnWidths?.reduce((total, width) => total + width, 0);

  const startResize = (event: ReactMouseEvent, columnIndex: number) => {
    event.preventDefault();
    event.stopPropagation();

    const table = event.currentTarget.closest("table");
    const measuredWidths = columnWidths ?? Array.from(table?.querySelectorAll("thead th") ?? [], (header) =>
      header.getBoundingClientRect().width,
    );
    const startWidth = measuredWidths[columnIndex];
    if (startWidth == null) return;

    const startX = event.clientX;
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const nextWidth = Math.max(MIN_COLUMN_WIDTH, startWidth + moveEvent.clientX - startX);
      setColumnWidths(measuredWidths.map((width, index) => index === columnIndex ? nextWidth : width));
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return { columnWidths, startResize, tableWidth };
}

export function ResizableColumnHandle({ columnIndex, onResize }: {
  columnIndex: number;
  onResize: (event: ReactMouseEvent, columnIndex: number) => void;
}) {
  return (
    <button
      aria-label="열 너비 조절"
      className="absolute -right-1 top-0 z-20 h-full w-2 cursor-col-resize touch-none border-0 bg-transparent p-0 after:absolute after:left-1/2 after:top-1/4 after:h-1/2 after:w-px after:bg-slate-500 hover:after:bg-blue-700"
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => onResize(event, columnIndex)}
      type="button"
    />
  );
}
