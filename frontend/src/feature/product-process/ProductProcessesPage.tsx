"use client";

import { useEffect, useState } from "react";
import DataListTable from "../common/DataListTable";
import { formatKoreanDateTimeWithoutYear } from "../common/dateFormat";
import ListToolbar from "../common/ListToolbar";
import { useOrderSidebar } from "../ordersidebar/OrderSidebarContext";
import type { DataListColumn } from "../common/DataListTable";
import type { ListOption, SortCondition } from "../common/ListToolbar";
import type { Order } from "../order/OrdersTypes";
import type { OrderProcessForm } from "../ordersidebar/OrderProcessFormCard";

type ProductProcess = {
  id: number;
  createdTime: string;
  customer: string;
  productionOrderNo: string;
  productName: string;
  quantity: string;
  lotNo: string;
  productQr: string;
  processSequence: string;
};

type ProductProcessResponse = {
  productQr: string;
  productionId: string | null;
  customer: string | null;
  productName: string | null;
  quantity: number | null;
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
  SHIPMENT: "출하완료",
};

type SortKey = keyof Omit<ProductProcess, "id">;

const sortButtons: ListOption<SortKey>[] = [
  { label: "날짜", key: "createdTime" },
  { label: "고객사", key: "customer" },
  { label: "지시번호", key: "productionOrderNo" },
  { label: "품명", key: "productName" },
  { label: "수량", key: "quantity" },
  { label: "LOT", key: "lotNo" },
  { label: "QR", key: "productQr" },
];

const processColumns: DataListColumn<ProductProcess>[] = [
  { align: "center", header: "No.", key: "id", render: (row) => row.id },
  { align: "center", header: "날짜", key: "createdTime", render: (row) => row.createdTime },
  { align: "center", header: "고객사", key: "customer", render: (row) => row.customer },
  { align: "center", header: "지시번호", key: "productionOrderNo", render: (row) => row.productionOrderNo },
  { header: "품명", key: "productName", render: (row) => row.productName },
  { align: "center", header: "수량", key: "quantity", render: (row) => row.quantity },
  { align: "center", header: "LOT", key: "lotNo", render: (row) => row.lotNo },
  { align: "center", header: "QR", key: "productQr", render: (row) => row.productQr },
];

export default function ProductProcessesPage() {
  const [processes, setProcesses] = useState<ProductProcess[]>([]);
  const [loadError, setLoadError] = useState("");
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [checkedRowIds, setCheckedRowIds] = useState<number[]>([]);
  const [sortConditions, setSortConditions] = useState<SortCondition<SortKey>[]>([]);
  const [searchField, setSearchField] = useState<SortKey>("productQr");
  const [searchText, setSearchText] = useState("");
  const { closeOrderSidebar, openOrderDetailSidebar } = useOrderSidebar();

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

  const handleToggleCheckbox = (row: ProductProcess) => {
    setCheckedRowIds((current) =>
      current.includes(row.id) ? current.filter((rowId) => rowId !== row.id) : [...current, row.id],
    );
  };

  const handleSelectRow = (row: ProductProcess) => {
    setSelectedRowId(row.id);
    openOrderDetailSidebar(toSidebarOrder(row));
  };

  const handleDeleteSelectedRows = async () => {
    const selectedRows = processes.filter((row) => checkedRowIds.includes(row.id));

    if (selectedRows.length === 0 || !window.confirm(`${selectedRows.length}개를 정말로 삭제하시겠습니까?`)) {
      return;
    }

    const responses = await Promise.all(
      selectedRows.map((row) =>
        fetch(`${orderApiBaseUrl}/product-processes/${encodeURIComponent(row.productQr)}`, {
          method: "DELETE",
        }),
      ),
    );

    if (responses.some((response) => !response.ok)) {
      window.alert("선택한 생산현황 삭제에 실패했습니다.");
      return;
    }

    setProcesses((current) =>
      current
        .filter((row) => !checkedRowIds.includes(row.id))
        .map((row, index) => ({ ...row, id: index + 1 })),
    );
    setCheckedRowIds([]);
    setSelectedRowId(null);
    closeOrderSidebar();
  };

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white text-slate-950">
      <section className="flex min-w-0 flex-1 flex-col px-5 py-5">
        <ListToolbar
          onSearchFieldChange={setSearchField}
          onSearchTextChange={setSearchText}
          onSort={(key) => setSortConditions((current) => updateSortConditions(current, key))}
          onDelete={handleDeleteSelectedRows}
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
          emptyMessage={loadError || "리스트가 비어있습니다."}
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
    detailType: "process",
    orderNo: row.productionOrderNo,
    orderDate: row.createdTime,
    productionOrderNo: row.productionOrderNo,
    productQr: row.productQr,
    lotNo: row.lotNo,
    processName: row.processSequence,
    processSequence: row.processSequence,
    startedAt: "-",
    customer: row.customer,
    product: row.productName,
    quantity: row.quantity,
    unitPrice: "-",
    dueDate: "-",
    status: "-",
    memo: `QR ${row.productQr}, LOT ${row.lotNo}, process ${row.processSequence}`,
  };
}

function toProductProcessRow(process: OrderProcessForm, index: number): ProductProcess {
  return {
    id: index + 1,
    createdTime: "-",
    customer: "-",
    productionOrderNo: process.productionOrderNo,
    productName: process.productName || "-",
    quantity: "1",
    lotNo: process.lotNo || "-",
    productQr: process.productQr,
    processSequence: toProductProcessLabel(process.processSequence),
  };
}

function toProductProcessRowFromApi(process: ProductProcessResponse, index: number): ProductProcess {
  return {
    id: index + 1,
    createdTime: formatKoreanDateTimeWithoutYear(process.createdTime),
    customer: process.customer ?? "-",
    productionOrderNo: process.productionId ?? "-",
    productName: process.productName ?? "-",
    quantity: String(process.quantity ?? 1),
    lotNo: process.lot ?? "-",
    productQr: process.productQr,
    processSequence: process.processName ?? process.processSequence ?? toProductProcessLabel(process.process),
  };
}

function toProductProcessLabel(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return productProcessLabels[value] ?? value;
}
