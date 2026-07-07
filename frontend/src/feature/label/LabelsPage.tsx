"use client";

import { useState } from "react";
import DataListTable from "../common/DataListTable";
import ListToolbar from "../common/ListToolbar";
import { useOrderSidebar } from "../ordersidebar/OrderSidebarContext";
import type { DataListColumn } from "../common/DataListTable";
import type { ListOption, SortCondition } from "../common/ListToolbar";
import type { Order } from "../order/OrdersTypes";

type LabelRow = {
  id: number;
  productionOrderId: string;
  productionOrderNo: string;
  qrData: string;
  title: string;
  line1: string;
  line2: string;
  printedAt: string;
  createdAt: string;
  updatedAt: string;
};

type SortKey = keyof Omit<LabelRow, "id">;

const sortButtons: ListOption<SortKey>[] = [
  { label: "생산지시번호", key: "productionOrderNo" },
  { label: "QR 데이터", key: "qrData" },
  { label: "라벨 제목", key: "title" },
  { label: "표시문구1", key: "line1" },
  { label: "표시문구2", key: "line2" },
  { label: "출력일시", key: "printedAt" },
];

const labelColumns: DataListColumn<LabelRow>[] = [
  { align: "center", header: "No.", key: "id", render: (row) => row.id },
  { align: "center", header: "생산지시ID", key: "productionOrderId", render: (row) => row.productionOrderId },
  { align: "center", header: "생산지시번호", key: "productionOrderNo", render: (row) => row.productionOrderNo },
  { align: "center", header: "QR 데이터", key: "qrData", render: (row) => row.qrData },
  { header: "라벨 제목", key: "title", render: (row) => row.title },
  { header: "표시문구1", key: "line1", render: (row) => row.line1 },
  { header: "표시문구2", key: "line2", render: (row) => row.line2 },
  { align: "center", header: "출력일시", key: "printedAt", render: (row) => row.printedAt },
  { align: "center", header: "등록일시", key: "createdAt", render: (row) => row.createdAt },
  { align: "center", header: "수정일시", key: "updatedAt", render: (row) => row.updatedAt },
];

const labelRows: LabelRow[] = [
  {
    id: 1,
    productionOrderId: "1",
    productionOrderNo: "PRD-20260706-001",
    qrData: "QR-LS4C-0001",
    title: "Leak Sensor Point-4C",
    line1: "LOT-20260706-A",
    line2: "검사 전",
    printedAt: "2026.07.06 09:10",
    createdAt: "2026.07.06 09:05",
    updatedAt: "2026.07.06 09:10",
  },
  {
    id: 2,
    productionOrderId: "2",
    productionOrderNo: "PRD-20260706-002",
    qrData: "QR-ECS200-0002",
    title: "ECS200A-ORGANIC-000A",
    line1: "LOT-20260706-B",
    line2: "조립 공정",
    printedAt: "2026.07.06 10:30",
    createdAt: "2026.07.06 10:25",
    updatedAt: "2026.07.06 10:30",
  },
  {
    id: 3,
    productionOrderId: "3",
    productionOrderNo: "PRD-20260705-003",
    qrData: "QR-DULK322-0003",
    title: "DU-LK322-S3",
    line1: "LOT-20260705-C",
    line2: "출하 대기",
    printedAt: "-",
    createdAt: "2026.07.05 11:20",
    updatedAt: "2026.07.05 11:20",
  },
  {
    id: 4,
    productionOrderId: "4",
    productionOrderNo: "PRD-20260703-004",
    qrData: "QR-DULK322-0004",
    title: "DU-LK322-NPN-10-S1",
    line1: "LOT-20260703-C",
    line2: "출하 완료",
    printedAt: "2026.07.03 16:20",
    createdAt: "2026.07.03 13:50",
    updatedAt: "2026.07.03 16:20",
  },
];

export default function LabelsPage() {
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [checkedRowIds, setCheckedRowIds] = useState<number[]>([]);
  const [sortConditions, setSortConditions] = useState<SortCondition<SortKey>[]>([]);
  const [searchField, setSearchField] = useState<SortKey>("qrData");
  const [searchText, setSearchText] = useState("");
  const {
    clearOrderSidebarSelection,
    closeOrderSidebar,
    openOrderDetailSidebar,
    rightPanelMode,
    selectedOrder,
  } = useOrderSidebar();

  const searchOptions = Array.from(new Set(labelRows.map((row) => String(row[searchField]))));
  const filteredRows = labelRows.filter((row) =>
    String(row[searchField]).toLowerCase().includes(searchText.toLowerCase()),
  );
  const sortedRows = sortRows(filteredRows, sortConditions);

  const handleSort = (key: SortKey) => {
    setSortConditions((current) => updateSortConditions(current, key));
  };

  const handleToggleCheckbox = (row: LabelRow) => {
    setCheckedRowIds((current) =>
      current.includes(row.id) ? current.filter((rowId) => rowId !== row.id) : [...current, row.id],
    );
  };

  const handleSelectRow = (row: LabelRow) => {
    if (selectedRowId === row.id && selectedOrder?.orderNo === row.productionOrderNo && rightPanelMode === "detail") {
      setSelectedRowId(null);
      clearOrderSidebarSelection();
      return;
    }

    setSelectedRowId(row.id);
    openOrderDetailSidebar(toSidebarOrder(row));
  };

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white text-slate-950">
      <section className="flex min-w-0 flex-1 flex-col px-5 py-5">
        <ListToolbar
          onSearchFieldChange={setSearchField}
          onSearchTextChange={setSearchText}
          onSort={handleSort}
          options={sortButtons}
          searchField={searchField}
          searchOptions={searchOptions}
          searchText={searchText}
          sortConditions={sortConditions}
        />
        <DataListTable
          checkedRowIds={checkedRowIds}
          columns={labelColumns}
          getRowId={(row) => row.id}
          onBlankClick={closeOrderSidebar}
          onCheckboxChange={handleToggleCheckbox}
          onRowClick={handleSelectRow}
          rows={sortedRows}
          selectedRowId={selectedRowId}
        />
      </section>
    </main>
  );
}

function sortRows(rows: LabelRow[], conditions: SortCondition<SortKey>[]) {
  return [...rows].sort((a, b) => {
    for (const condition of conditions) {
      const result = String(a[condition.key]).localeCompare(String(b[condition.key]), "ko", { numeric: true });
      if (result !== 0) return condition.direction === "asc" ? result : -result;
    }
    return 0;
  });
}

function updateSortConditions(current: SortCondition<SortKey>[], key: SortKey) {
  const existing = current.find((condition) => condition.key === key);
  if (!existing) return [...current, { key, direction: "asc" as const }];
  if (existing.direction === "asc") {
    return current.map((condition) => (condition.key === key ? { ...condition, direction: "desc" as const } : condition));
  }
  return current.filter((condition) => condition.key !== key);
}

function toSidebarOrder(row: LabelRow): Order {
  return {
    id: row.id,
    orderNo: row.productionOrderNo,
    orderDate: row.createdAt,
    customer: "-",
    product: row.title,
    quantity: row.productionOrderId,
    unitPrice: "-",
    dueDate: row.printedAt,
    status: row.printedAt === "-" ? "Waiting" : "Printed",
    memo: `QR ${row.qrData}, line1 ${row.line1}, line2 ${row.line2}`,
  };
}
