"use client";

import { useEffect, useState } from "react";
import DataListTable from "../common/DataListTable";
import ListToolbar from "../common/ListToolbar";
import type { DataListColumn } from "../common/DataListTable";
import type { ListOption, SortCondition } from "../common/ListToolbar";

type ProcessHistoryRow = {
  id: number;
  processId: number;
  purchaseId: string;
  productQr: string;
  productName: string;
  productProcess: string;
  isSuccess: string;
  createdTime: string;
};

type ProcessHistoryResponse = {
  processId: number;
  purchaseId: string | null;
  productQr: string | null;
  productName: string | null;
  productProcess: string | null;
  isSuccess: boolean | null;
  createdTime: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type SortKey = keyof Omit<ProcessHistoryRow, "id">;

const orderApiBaseUrl = process.env.NEXT_PUBLIC_ORDER_API_BASE_URL ?? "http://localhost:8080/order";

const sortButtons: ListOption<SortKey>[] = [
  { label: "공정이력번호", key: "processId" },
  { label: "발주번호", key: "purchaseId" },
  { label: "제품 QR", key: "productQr" },
  { label: "제품명", key: "productName" },
  { label: "공정", key: "productProcess" },
  { label: "결과", key: "isSuccess" },
  { label: "생성시간", key: "createdTime" },
];

const processHistoryColumns: DataListColumn<ProcessHistoryRow>[] = [
  { align: "center", header: "No.", key: "id", render: (row) => row.id },
  { align: "center", header: "공정이력번호", key: "processId", render: (row) => row.processId },
  { align: "center", header: "발주번호", key: "purchaseId", render: (row) => row.purchaseId },
  { align: "center", header: "제품 QR", key: "productQr", render: (row) => row.productQr },
  { header: "제품명", key: "productName", render: (row) => row.productName },
  { header: "공정", key: "productProcess", render: (row) => row.productProcess },
  {
    header: "결과",
    key: "isSuccess",
    render: (row) => <span className="rounded-full bg-[#eef4ff] px-3 py-1 font-bold text-slate-900">{row.isSuccess}</span>,
  },
  { align: "center", header: "생성시간", key: "createdTime", render: (row) => row.createdTime },
];

export default function ProcessHistoriesPage() {
  const [histories, setHistories] = useState<ProcessHistoryRow[]>([]);
  const [checkedRowIds, setCheckedRowIds] = useState<number[]>([]);
  const [loadError, setLoadError] = useState("");
  const [searchField, setSearchField] = useState<SortKey>("productQr");
  const [searchText, setSearchText] = useState("");
  const [sortConditions, setSortConditions] = useState<SortCondition<SortKey>[]>([]);

  useEffect(() => {
    const loadHistories = async () => {
      try {
        const response = await fetch(`${orderApiBaseUrl}/process-histories`);

        if (!response.ok) {
          setLoadError("공정이력 목록을 불러오지 못했습니다.");
          setHistories([]);
          return;
        }

        const result = (await response.json()) as ApiResponse<ProcessHistoryResponse[]>;
        setLoadError("");
        setHistories(result.data.map(toProcessHistoryRow));
      } catch {
        setLoadError("공정이력 목록을 불러오지 못했습니다.");
        setHistories([]);
      }
    };

    void loadHistories();
  }, []);

  const searchOptions = Array.from(new Set(histories.map((row) => String(row[searchField]))));
  const filteredRows = histories.filter((row) =>
    String(row[searchField]).toLowerCase().includes(searchText.toLowerCase()),
  );
  const sortedRows = sortRows(filteredRows, sortConditions);

  const handleSort = (key: SortKey) => {
    setSortConditions((current) => updateSortConditions(current, key));
  };

  const handleToggleCheckbox = (row: ProcessHistoryRow) => {
    setCheckedRowIds((current) =>
      current.includes(row.id) ? current.filter((rowId) => rowId !== row.id) : [...current, row.id],
    );
  };

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white text-slate-950">
      <section className="flex min-w-0 flex-1 flex-col px-5 py-5">
        <ListToolbar
          onDelete={() => console.log("delete selected process histories", checkedRowIds)}
          onSearchFieldChange={setSearchField}
          onSearchTextChange={setSearchText}
          onSort={handleSort}
          options={sortButtons}
          searchField={searchField}
          searchOptions={searchOptions}
          searchText={searchText}
          selectedCount={checkedRowIds.length}
          sortConditions={sortConditions}
        />
        <DataListTable
          checkedRowIds={checkedRowIds}
          columns={processHistoryColumns}
          emptyMessage={loadError || "리스트가 비어있습니다."}
          getRowId={(row) => row.id}
          onCheckboxChange={handleToggleCheckbox}
          rows={sortedRows}
        />
      </section>
    </main>
  );
}

function sortRows(rows: ProcessHistoryRow[], conditions: SortCondition<SortKey>[]) {
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

function toProcessHistoryRow(history: ProcessHistoryResponse, index: number): ProcessHistoryRow {
  return {
    id: index + 1,
    processId: history.processId,
    purchaseId: history.purchaseId ?? "-",
    productQr: history.productQr ?? "-",
    productName: history.productName ?? "-",
    productProcess: toProductProcessLabel(history.productProcess),
    isSuccess: history.isSuccess ? "성공" : "실패",
    createdTime: formatDateTime(history.createdTime),
  };
}

function toProductProcessLabel(process: string | null) {
  switch (process) {
    case "PRODUCTION_INSTRUCTION_CHECK":
      return "생산지시";
    case "ASSEMBLY":
      return "조립";
    case "FUNCTION_TEST":
      return "기능검사";
    case "SHIPMENT_INSPECTION":
      return "출하검사";
    default:
      return process ?? "-";
  }
}

function formatDateTime(value: string | null) {
  return value ? value.replace("T", " ").replaceAll("-", ".") : "-";
}
