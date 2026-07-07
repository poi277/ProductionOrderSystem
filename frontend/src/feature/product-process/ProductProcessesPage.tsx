"use client";

import { useState } from "react";
import DataListTable from "../common/DataListTable";
import ListToolbar from "../common/ListToolbar";
import { useOrderSidebar } from "../ordersidebar/OrderSidebarContext";
import type { DataListColumn } from "../common/DataListTable";
import type { ListOption, SortCondition } from "../common/ListToolbar";
import type { Order } from "../order/OrdersTypes";

type ProductProcess = {
  id: number;
  productionOrderNo: string;
  productQr: string;
  productName: string;
  lotNo: string;
  processName: string;
  processSequence: string;
  status: string;
  isShipmentTarget: string;
  startedAt: string;
};

type SortKey = keyof Omit<ProductProcess, "id">;

const sortButtons: ListOption<SortKey>[] = [
  { label: "생산지시번호", key: "productionOrderNo" },
  { label: "제품 QR", key: "productQr" },
  { label: "품명", key: "productName" },
  { label: "LOT 번호", key: "lotNo" },
  { label: "공정명", key: "processName" },
  { label: "공정순서", key: "processSequence" },
  { label: "상태", key: "status" },
  { label: "출하대상", key: "isShipmentTarget" },
];

const processColumns: DataListColumn<ProductProcess>[] = [
  { align: "center", header: "No.", key: "id", render: (row) => row.id },
  { align: "center", header: "생산지시번호", key: "productionOrderNo", render: (row) => row.productionOrderNo },
  { align: "center", header: "제품 QR", key: "productQr", render: (row) => row.productQr },
  { header: "품명", key: "productName", render: (row) => row.productName },
  { align: "center", header: "LOT 번호", key: "lotNo", render: (row) => row.lotNo },
  { header: "공정명", key: "processName", render: (row) => row.processName },
  { align: "center", header: "공정순서", key: "processSequence", render: (row) => row.processSequence },
  {
    header: "상태",
    key: "status",
    render: (row) => (
      <span className="rounded-full bg-[#eef4ff] px-3 py-1 font-bold text-slate-900">
        {row.status}
      </span>
    ),
  },
  { align: "center", header: "출하대상", key: "isShipmentTarget", render: (row) => row.isShipmentTarget },
  { align: "center", header: "시작일시", key: "startedAt", render: (row) => row.startedAt },
];

const processRows: ProductProcess[] = [
  {
    id: 1,
    productionOrderNo: "PRD-20260706-001",
    productQr: "QR-LS4C-0001",
    productName: "Leak Sensor Point-4C",
    lotNo: "LOT-20260706-A",
    processName: "자재 준비",
    processSequence: "1",
    status: "완료",
    isShipmentTarget: "N",
    startedAt: "2026.07.06 09:00",
  },
  {
    id: 2,
    productionOrderNo: "PRD-20260706-001",
    productQr: "QR-LS4C-0001",
    productName: "Leak Sensor Point-4C",
    lotNo: "LOT-20260706-A",
    processName: "조립",
    processSequence: "2",
    status: "진행중",
    isShipmentTarget: "N",
    startedAt: "2026.07.06 10:40",
  },
  {
    id: 3,
    productionOrderNo: "PRD-20260706-002",
    productQr: "QR-ECS200-0002",
    productName: "ECS200A-ORGANIC-000A",
    lotNo: "LOT-20260706-B",
    processName: "검사",
    processSequence: "3",
    status: "대기",
    isShipmentTarget: "Y",
    startedAt: "-",
  },
  {
    id: 4,
    productionOrderNo: "PRD-20260703-004",
    productQr: "QR-DULK322-0004",
    productName: "DU-LK322-NPN-10-S1",
    lotNo: "LOT-20260703-C",
    processName: "최종검수",
    processSequence: "4",
    status: "완료",
    isShipmentTarget: "Y",
    startedAt: "2026.07.03 14:00",
  },
];

export default function ProductProcessesPage() {
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

  const searchOptions = Array.from(new Set(processRows.map((row) => String(row[searchField]))));
  const filteredRows = processRows.filter((row) =>
    String(row[searchField]).toLowerCase().includes(searchText.toLowerCase()),
  );
  const sortedRows = sortRows(filteredRows, sortConditions);

  const handleSort = (key: SortKey) => {
    setSortConditions((current) => updateSortConditions(current, key));
  };

  const handleToggleCheckbox = (row: ProductProcess) => {
    setCheckedRowIds((current) =>
      current.includes(row.id) ? current.filter((rowId) => rowId !== row.id) : [...current, row.id],
    );
  };

  const handleSelectRow = (row: ProductProcess) => {
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
          columns={processColumns}
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

function sortRows(rows: ProductProcess[], conditions: SortCondition<SortKey>[]) {
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

function toSidebarOrder(row: ProductProcess): Order {
  return {
    id: row.id,
    orderNo: row.productionOrderNo,
    orderDate: row.startedAt,
    customer: "-",
    product: row.productName,
    quantity: row.processSequence,
    unitPrice: "-",
    dueDate: row.startedAt,
    status: row.status,
    memo: `QR ${row.productQr}, LOT ${row.lotNo}, process ${row.processName}, shipment target ${row.isShipmentTarget}`,
  };
}
