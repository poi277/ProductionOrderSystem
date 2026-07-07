"use client";

import { useState } from "react";
import DataListTable from "../common/DataListTable";
import ListToolbar from "../common/ListToolbar";
import { useOrderSidebar } from "../ordersidebar/OrderSidebarContext";
import type { DataListColumn } from "../common/DataListTable";
import type { ListOption, SortCondition } from "../common/ListToolbar";
import type { Order } from "../order/OrdersTypes";

type Shipment = {
  id: number;
  productionOrderNo: string;
  productProcessNo: string;
  productQr: string;
  processName: string;
  isCompleted: string;
  shippedAt: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
};

type SortKey = keyof Omit<Shipment, "id">;

const sortButtons: ListOption<SortKey>[] = [
  { label: "생산지시번호", key: "productionOrderNo" },
  { label: "제품공정번호", key: "productProcessNo" },
  { label: "제품 QR", key: "productQr" },
  { label: "공정명", key: "processName" },
  { label: "출하완료", key: "isCompleted" },
  { label: "출하일시", key: "shippedAt" },
];

const shipmentColumns: DataListColumn<Shipment>[] = [
  { align: "center", header: "No.", key: "id", render: (row) => row.id },
  { align: "center", header: "생산지시번호", key: "productionOrderNo", render: (row) => row.productionOrderNo },
  { align: "center", header: "제품공정번호", key: "productProcessNo", render: (row) => row.productProcessNo },
  { align: "center", header: "제품 QR", key: "productQr", render: (row) => row.productQr },
  { header: "출하 기준 공정", key: "processName", render: (row) => row.processName },
  {
    header: "출하완료",
    key: "isCompleted",
    render: (row) => (
      <span className="rounded-full bg-[#eef4ff] px-3 py-1 font-bold text-slate-900">
        {row.isCompleted}
      </span>
    ),
  },
  { align: "center", header: "출하일시", key: "shippedAt", render: (row) => row.shippedAt },
  { header: "비고", key: "memo", render: (row) => row.memo },
  { align: "center", header: "등록일시", key: "createdAt", render: (row) => row.createdAt },
  { align: "center", header: "수정일시", key: "updatedAt", render: (row) => row.updatedAt },
];

const shipmentRows: Shipment[] = [
  {
    id: 1,
    productionOrderNo: "PRD-20260703-004",
    productProcessNo: "PROC-20260703-004",
    productQr: "QR-DULK322-0004",
    processName: "최종검수",
    isCompleted: "완료",
    shippedAt: "2026.07.04 10:30",
    memo: "고객사 납품 완료",
    createdAt: "2026.07.04 10:35",
    updatedAt: "2026.07.04 10:35",
  },
  {
    id: 2,
    productionOrderNo: "PRD-20260702-005",
    productProcessNo: "PROC-20260702-005",
    productQr: "QR-LSSUP-0005",
    processName: "포장",
    isCompleted: "부분출하",
    shippedAt: "2026.07.05 15:20",
    memo: "12개 우선 출하",
    createdAt: "2026.07.05 15:25",
    updatedAt: "2026.07.05 15:30",
  },
  {
    id: 3,
    productionOrderNo: "PRD-20260706-001",
    productProcessNo: "PROC-20260706-001",
    productQr: "QR-LS4C-0001",
    processName: "검사",
    isCompleted: "대기",
    shippedAt: "-",
    memo: "공정 완료 후 출하 예정",
    createdAt: "2026.07.06 11:00",
    updatedAt: "2026.07.06 11:00",
  },
  {
    id: 4,
    productionOrderNo: "PRD-20260706-002",
    productProcessNo: "PROC-20260706-002",
    productQr: "QR-ECS200-0002",
    processName: "검사",
    isCompleted: "대기",
    shippedAt: "-",
    memo: "검사 대기",
    createdAt: "2026.07.06 12:10",
    updatedAt: "2026.07.06 12:10",
  },
];

export default function ShipmentsPage() {
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [checkedRowIds, setCheckedRowIds] = useState<number[]>([]);
  const [sortConditions, setSortConditions] = useState<SortCondition<SortKey>[]>([]);
  const [searchField, setSearchField] = useState<SortKey>("productQr");
  const [searchText, setSearchText] = useState("");
  const {
    clearOrderSidebarSelection,
    closeOrderSidebar,
    openOrderDetailSidebar,
    rightPanelMode,
    selectedOrder,
  } = useOrderSidebar();

  const searchOptions = Array.from(new Set(shipmentRows.map((row) => String(row[searchField]))));
  const filteredRows = shipmentRows.filter((row) =>
    String(row[searchField]).toLowerCase().includes(searchText.toLowerCase()),
  );
  const sortedRows = sortRows(filteredRows, sortConditions);

  const handleSort = (key: SortKey) => {
    setSortConditions((current) => updateSortConditions(current, key));
  };

  const handleToggleCheckbox = (row: Shipment) => {
    setCheckedRowIds((current) =>
      current.includes(row.id) ? current.filter((rowId) => rowId !== row.id) : [...current, row.id],
    );
  };

  const handleSelectRow = (row: Shipment) => {
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
          columns={shipmentColumns}
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

function sortRows(rows: Shipment[], conditions: SortCondition<SortKey>[]) {
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

function toSidebarOrder(row: Shipment): Order {
  return {
    id: row.id,
    orderNo: row.productionOrderNo,
    orderDate: row.createdAt,
    customer: "-",
    product: row.productQr,
    quantity: "-",
    unitPrice: "-",
    dueDate: row.shippedAt,
    status: row.isCompleted,
    memo: `Process ${row.processName}, process no ${row.productProcessNo}. ${row.memo}`,
  };
}
