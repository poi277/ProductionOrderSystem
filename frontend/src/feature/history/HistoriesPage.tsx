"use client";

import { useEffect, useState } from "react";
import DataListTable from "../common/DataListTable";
import ListToolbar from "../common/ListToolbar";
import type { DataListColumn } from "../common/DataListTable";
import type { ListOption, SortCondition } from "../common/ListToolbar";
import type { Order } from "../order/OrdersTypes";
import { useOrderSidebar } from "../ordersidebar/OrderSidebarContext";
import type { OrderHistoryForm } from "../ordersidebar/OrderHistoryFormCard";

type HistoryRow = {
  id: number;
  historyId: number;
  productionOrderNo: string;
  productQr: string;
  productName: string;
  processName: string;
  judgment: string;
  defectType: string;
  worker: string;
  equipment: string;
  status: string;
  memo: string;
};

type HistoryResponse = {
  historyId: number;
  productQr: string | null;
  productionId: string | null;
  productName: string | null;
  processName: string | null;
  judgment: string | null;
  defectType: string | null;
  worker: string | null;
  equipment: string | null;
  note: string | null;
  status: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const orderApiBaseUrl = process.env.NEXT_PUBLIC_ORDER_API_BASE_URL ?? "http://localhost:8080/order";

type SortKey = keyof Omit<HistoryRow, "id">;

const sortButtons: ListOption<SortKey>[] = [
  { label: "이력번호", key: "historyId" },
  { label: "생산지시번호", key: "productionOrderNo" },
  { label: "제품 QR", key: "productQr" },
  { label: "품명", key: "productName" },
  { label: "공정명", key: "processName" },
  { label: "판정", key: "judgment" },
  { label: "상태", key: "status" },
  { label: "작업자", key: "worker" },
];

const historyColumns: DataListColumn<HistoryRow>[] = [
  { align: "center", header: "No.", key: "id", render: (row) => row.id },
  { align: "center", header: "이력번호", key: "historyId", render: (row) => row.historyId },
  { align: "center", header: "생산지시번호", key: "productionOrderNo", render: (row) => row.productionOrderNo },
  { align: "center", header: "제품 QR", key: "productQr", render: (row) => row.productQr },
  { header: "품명", key: "productName", render: (row) => row.productName },
  { header: "공정명", key: "processName", render: (row) => row.processName },
  { header: "판정", key: "judgment", render: (row) => row.judgment },
  { header: "불량유형", key: "defectType", render: (row) => row.defectType },
  { header: "작업자", key: "worker", render: (row) => row.worker },
  { header: "설비", key: "equipment", render: (row) => row.equipment },
  {
    header: "상태",
    key: "status",
    render: (row) => <span className="rounded-full bg-[#eef4ff] px-3 py-1 font-bold text-slate-900">{row.status}</span>,
  },
  { header: "비고", key: "memo", render: (row) => row.memo },
];

export default function HistoriesPage() {
  const [histories, setHistories] = useState<HistoryRow[]>([]);
  const [loadError, setLoadError] = useState("");
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [checkedRowIds, setCheckedRowIds] = useState<number[]>([]);
  const [sortConditions, setSortConditions] = useState<SortCondition<SortKey>[]>([]);
  const [searchField, setSearchField] = useState<SortKey>("productQr");
  const [searchText, setSearchText] = useState("");
  const { closeOrderSidebar, openOrderDetailSidebar } = useOrderSidebar();

  useEffect(() => {
    const loadHistories = async () => {
      try {
        const response = await fetch(`${orderApiBaseUrl}/histories`);

        if (!response.ok) {
          setLoadError("이력 목록을 불러오지 못했습니다.");
          setHistories([]);
          return;
        }

        const result = (await response.json()) as ApiResponse<HistoryResponse[]>;
        setLoadError("");
        setHistories(result.data.map(toHistoryRowFromApi));
      } catch {
        setLoadError("이력 목록을 불러오지 못했습니다.");
        setHistories([]);
      }
    };

    void loadHistories();
  }, []);

  useEffect(() => {
    const handleCreate = (event: Event) => {
      const createdHistory = (event as CustomEvent<OrderHistoryForm>).detail;

      setHistories((current) =>
        [toHistoryRow(createdHistory, 0), ...current].map((row, index) => ({ ...row, id: index + 1 })),
      );
    };

    const handleUpdate = (event: Event) => {
      const { historyId, order: updatedHistory } = (
        event as CustomEvent<{ historyId: number; order: OrderHistoryForm }>
      ).detail;

      setHistories((current) =>
        current.map((row) => (row.id === historyId ? { ...toHistoryRow(updatedHistory, row.id - 1), id: row.id } : row)),
      );
    };

    const handleDelete = (event: Event) => {
      const deletedHistoryId = (event as CustomEvent<number>).detail;

      setHistories((current) =>
        current.filter((row) => row.id !== deletedHistoryId).map((row, index) => ({ ...row, id: index + 1 })),
      );
      setSelectedRowId(null);
      closeOrderSidebar();
    };

    window.addEventListener("history-created", handleCreate);
    window.addEventListener("history-updated", handleUpdate);
    window.addEventListener("history-deleted", handleDelete);

    return () => {
      window.removeEventListener("history-created", handleCreate);
      window.removeEventListener("history-updated", handleUpdate);
      window.removeEventListener("history-deleted", handleDelete);
    };
  }, [closeOrderSidebar]);

  const searchOptions = Array.from(new Set(histories.map((row) => String(row[searchField]))));
  const filteredRows = histories.filter((row) =>
    String(row[searchField]).toLowerCase().includes(searchText.toLowerCase()),
  );
  const sortedRows = sortRows(filteredRows, sortConditions);

  const handleSort = (key: SortKey) => {
    setSortConditions((current) => updateSortConditions(current, key));
  };

  const handleToggleCheckbox = (row: HistoryRow) => {
    setCheckedRowIds((current) =>
      current.includes(row.id) ? current.filter((rowId) => rowId !== row.id) : [...current, row.id],
    );
  };

  const handleSelectRow = (row: HistoryRow) => {
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
          columns={historyColumns}
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

function sortRows(rows: HistoryRow[], conditions: SortCondition<SortKey>[]) {
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

function toSidebarOrder(row: HistoryRow): Order {
  return {
    id: row.id,
    detailType: "history",
    historyId: row.historyId,
    orderNo: row.productionOrderNo,
    orderDate: "-",
    productionOrderNo: row.productionOrderNo,
    productQr: row.productQr,
    processName: row.processName,
    judgment: row.judgment,
    defectType: row.defectType,
    worker: row.worker,
    equipment: row.equipment,
    customer: "-",
    product: row.productName,
    quantity: "-",
    unitPrice: "-",
    dueDate: "-",
    status: row.status,
    memo: row.memo,
  };
}

function toHistoryRow(history: OrderHistoryForm, index: number): HistoryRow {
  return {
    id: index + 1,
    historyId: Number(history.historyId || 0),
    productionOrderNo: history.productionOrderNo || "-",
    productQr: history.productQr || "-",
    productName: history.productName || "-",
    processName: history.processName || "-",
    judgment: history.judgment || "-",
    defectType: history.defectType || "-",
    worker: history.worker || "-",
    equipment: history.equipment || "-",
    status: history.status,
    memo: history.memo || "-",
  };
}

function toHistoryRowFromApi(history: HistoryResponse, index: number): HistoryRow {
  return {
    id: index + 1,
    historyId: history.historyId,
    productionOrderNo: history.productionId ?? "-",
    productQr: history.productQr ?? "-",
    productName: history.productName ?? "-",
    processName: history.processName ?? "-",
    judgment: history.judgment ?? "-",
    defectType: history.defectType ?? "-",
    worker: history.worker ?? "-",
    equipment: history.equipment ?? "-",
    status: toHistoryStatusLabel(history.status),
    memo: history.note ?? "-",
  };
}

function toHistoryStatusLabel(status: string | null) {
  if (status === "DEFECTIVE") return "불량";
  return "정상";
}
