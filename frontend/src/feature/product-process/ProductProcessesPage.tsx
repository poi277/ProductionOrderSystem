"use client";

import { useEffect, useState } from "react";
import DataListTable from "../common/DataListTable";
import ListToolbar from "../common/ListToolbar";
import { useOrderSidebar } from "../ordersidebar/OrderSidebarContext";
import type { OrderProcessForm } from "../ordersidebar/OrderProcessFormCard";
import type { DataListColumn } from "../common/DataListTable";
import type { ListOption, SortCondition } from "../common/ListToolbar";
import type { Order } from "../order/OrdersTypes";

type ProductProcess = {
  id: number;
  productionOrderNo: string;
  productQr: string;
  productName: string;
  lotNo: string;
  processSequence: string;
  createdTime: string;
};

type ProductProcessResponse = {
  productQr: string;
  productionId: string | null;
  productName: string | null;
  lot: string | null;
  process: string | null;
  processName: string | null;
  processSequence: string | null;
  startedAt: string | null;
  createdTime: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const orderApiBaseUrl = process.env.NEXT_PUBLIC_ORDER_API_BASE_URL ?? "http://localhost:8080/order";

const productProcessLabels: Record<string, string> = {
  PRODUCTION_INSTRUCTION_CHECK: "생산지시",
  ASSEMBLY: "조립",
  FUNCTION_TEST: "기능검사",
  SHIPMENT_INSPECTION: "출하검사",
  SHIPMENT: "출하중",
};

type SortKey = keyof Omit<ProductProcess, "id">;

const sortButtons: ListOption<SortKey>[] = [
  { label: "생산지시번호", key: "productionOrderNo" },
  { label: "제품 QR", key: "productQr" },
  { label: "제품명", key: "productName" },
  { label: "LOT 번호", key: "lotNo" },
  { label: "공정순서", key: "processSequence" },
  { label: "생성시간", key: "createdTime" },
];

const processColumns: DataListColumn<ProductProcess>[] = [
  { align: "center", header: "No.", key: "id", render: (row) => row.id },
  { align: "center", header: "생산지시번호", key: "productionOrderNo", render: (row) => row.productionOrderNo },
  { align: "center", header: "제품 QR", key: "productQr", render: (row) => row.productQr },
  { header: "제품명", key: "productName", render: (row) => row.productName },
  { align: "center", header: "LOT 번호", key: "lotNo", render: (row) => row.lotNo },
  { align: "center", header: "공정순서", key: "processSequence", render: (row) => row.processSequence },
  { align: "center", header: "생성시간", key: "createdTime", render: (row) => row.createdTime },
];

export default function ProductProcessesPage() {
  const [processes, setProcesses] = useState<ProductProcess[]>([]);
  const [loadError, setLoadError] = useState("");
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [checkedRowIds, setCheckedRowIds] = useState<number[]>([]);
  const [sortConditions, setSortConditions] = useState<SortCondition<SortKey>[]>([]);
  const [searchField, setSearchField] = useState<SortKey>("productQr");
  const [searchText, setSearchText] = useState("");
  const {
    closeOrderSidebar,
    openOrderDetailSidebar,
  } = useOrderSidebar();

  useEffect(() => {
    const loadProcesses = async () => {
      try {
        const response = await fetch(`${orderApiBaseUrl}/product-processes`);

        if (!response.ok) {
          setLoadError("생산현황 목록을 불러오지 못했습니다.");
          setProcesses([]);
          return;
        }

        const result = (await response.json()) as ApiResponse<ProductProcessResponse[]>;
        setLoadError("");
        setProcesses(result.data.map(toProductProcessRowFromApi));
      } catch {
        setLoadError("생산현황 목록을 불러오지 못했습니다.");
        setProcesses([]);
      }
    };

    void loadProcesses();
  }, []);

  useEffect(() => {
    const handleCreate = (event: Event) => {
      const createdProcess = (event as CustomEvent<OrderProcessForm>).detail;

      setProcesses((current) =>
        [toProductProcessRow(createdProcess, 0), ...current].map((row, index) => ({ ...row, id: index + 1 })),
      );
    };

    const handleUpdate = (event: Event) => {
      const { processId, order: updatedProcess } = (
        event as CustomEvent<{ processId: number; order: OrderProcessForm }>
      ).detail;

      setProcesses((current) =>
        current.map((row) =>
          row.id === processId ? { ...toProductProcessRow(updatedProcess, row.id - 1), id: row.id } : row,
        ),
      );
    };

    const handleDelete = (event: Event) => {
      const deletedProcessId = (event as CustomEvent<number>).detail;

      setProcesses((current) =>
        current.filter((row) => row.id !== deletedProcessId).map((row, index) => ({ ...row, id: index + 1 })),
      );
      setSelectedRowId(null);
      closeOrderSidebar();
    };

    window.addEventListener("product-process-created", handleCreate);
    window.addEventListener("product-process-updated", handleUpdate);
    window.addEventListener("product-process-deleted", handleDelete);

    return () => {
      window.removeEventListener("product-process-created", handleCreate);
      window.removeEventListener("product-process-updated", handleUpdate);
      window.removeEventListener("product-process-deleted", handleDelete);
    };
  }, [closeOrderSidebar]);

  const searchOptions = Array.from(new Set(processes.map((row) => String(row[searchField]))));
  const filteredRows = processes.filter((row) =>
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
          onDelete={() => console.log("delete selected product processes", checkedRowIds)}
          options={sortButtons}
          searchField={searchField}
          searchOptions={searchOptions}
          searchText={searchText}
          selectedCount={checkedRowIds.length}
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
          emptyMessage={loadError || "리스트가 비어있습니다."}
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
    detailType: "process",
    orderNo: row.productionOrderNo,
    orderDate: "-",
    productionOrderNo: row.productionOrderNo,
    productQr: row.productQr,
    lotNo: row.lotNo,
    processName: row.processSequence,
    processSequence: row.processSequence,
    startedAt: "-",
    customer: "-",
    product: row.productName,
    quantity: row.processSequence,
    unitPrice: "-",
    dueDate: "-",
    status: "-",
    memo: `QR ${row.productQr}, LOT ${row.lotNo}, process ${row.processSequence}`,
  };
}

function toProductProcessRow(process: OrderProcessForm, index: number): ProductProcess {
  return {
    id: index + 1,
    productionOrderNo: process.productionOrderNo,
    productQr: process.productQr,
    productName: process.productName || "-",
    lotNo: process.lotNo || "-",
    processSequence: toProductProcessLabel(process.processSequence),
    createdTime: "-",
  };
}

function toProductProcessRowFromApi(process: ProductProcessResponse, index: number): ProductProcess {
  return {
    id: index + 1,
    productionOrderNo: process.productionId ?? "-",
    productQr: process.productQr,
    productName: process.productName ?? "-",
    lotNo: process.lot ?? "-",
    processSequence: toProductProcessLabel(process.process ?? process.processSequence),
    createdTime: toDisplayDateTime(process.createdTime ?? ""),
  };
}

function toProductProcessLabel(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return productProcessLabels[value] ?? value;
}

function toDisplayDateTime(value: string) {
  if (!value) {
    return "-";
  }

  return value.replace("T", " ").replaceAll("-", ".");
}
