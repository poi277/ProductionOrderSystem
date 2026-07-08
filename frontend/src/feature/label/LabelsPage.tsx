"use client";

import { useEffect, useState } from "react";
import DataListTable from "../common/DataListTable";
import ListToolbar from "../common/ListToolbar";
import type { DataListColumn } from "../common/DataListTable";
import type { ListOption, SortCondition } from "../common/ListToolbar";
import type { Order } from "../order/OrdersTypes";
import { useOrderSidebar } from "../ordersidebar/OrderSidebarContext";
import type { OrderLabelForm } from "../ordersidebar/OrderLabelFormCard";

type LabelRow = {
  id: number;
  productionOrderId: string;
  productionOrderNo: string;
  qrData: string;
  product: string;
  lot: string;
  title: string;
  line1: string;
  line2: string;
  printedAt: string;
  createdAt: string;
  updatedAt: string;
};

type LabelResponse = {
  productQr: string;
  productionOrderId: string | null;
  productionOrderNo: string | null;
  productName: string | null;
  title: string | null;
  line1: string | null;
  line2: string | null;
  printedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const orderApiBaseUrl = process.env.NEXT_PUBLIC_ORDER_API_BASE_URL ?? "http://localhost:8080/order";

type SortKey = keyof Omit<LabelRow, "id">;

const sortButtons: ListOption<SortKey>[] = [
  { label: "QR 데이터", key: "qrData" },
  { label: "제품명", key: "product" },
  { label: "LOT", key: "lot" },
  { label: "생산지시번호", key: "productionOrderNo" },
  { label: "생성시간", key: "createdAt" },
];

const labelColumns: DataListColumn<LabelRow>[] = [
  { align: "center", header: "QR데이터", key: "qrData", render: (row) => row.qrData },
  { header: "제품명", key: "product", render: (row) => row.product },
  { align: "center", header: "LOT", key: "lot", render: (row) => row.lot },
  { align: "center", header: "생산지시번호", key: "productionOrderNo", render: (row) => row.productionOrderNo },
  { align: "center", header: "생성시간", key: "createdAt", render: (row) => row.createdAt },
];

export default function LabelsPage() {
  const [labels, setLabels] = useState<LabelRow[]>([]);
  const [loadError, setLoadError] = useState("");
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [checkedRowIds, setCheckedRowIds] = useState<number[]>([]);
  const [sortConditions, setSortConditions] = useState<SortCondition<SortKey>[]>([]);
  const [searchField, setSearchField] = useState<SortKey>("qrData");
  const [searchText, setSearchText] = useState("");
  const { closeOrderSidebar, openOrderDetailSidebar } = useOrderSidebar();

  useEffect(() => {
    const loadLabels = async () => {
      try {
        const response = await fetch(`${orderApiBaseUrl}/labels`);

        if (!response.ok) {
          setLoadError("라벨 목록을 불러오지 못했습니다.");
          setLabels([]);
          return;
        }

        const result = (await response.json()) as ApiResponse<LabelResponse[]>;
        setLoadError("");
        setLabels(result.data.map(toLabelRowFromApi));
      } catch {
        setLoadError("라벨 목록을 불러오지 못했습니다.");
        setLabels([]);
      }
    };

    void loadLabels();
  }, []);

  useEffect(() => {
    const handleCreate = (event: Event) => {
      const createdLabel = (event as CustomEvent<OrderLabelForm>).detail;

      setLabels((current) =>
        [toLabelRow(createdLabel, 0), ...current].map((row, index) => ({ ...row, id: index + 1 })),
      );
    };

    const handleUpdate = (event: Event) => {
      const { labelId, order: updatedLabel } = (event as CustomEvent<{ labelId: number; order: OrderLabelForm }>).detail;

      setLabels((current) =>
        current.map((row) => (row.id === labelId ? { ...toLabelRow(updatedLabel, row.id - 1), id: row.id } : row)),
      );
    };

    const handleDelete = (event: Event) => {
      const deletedLabelId = (event as CustomEvent<number>).detail;

      setLabels((current) =>
        current.filter((row) => row.id !== deletedLabelId).map((row, index) => ({ ...row, id: index + 1 })),
      );
      setSelectedRowId(null);
      closeOrderSidebar();
    };

    window.addEventListener("label-created", handleCreate);
    window.addEventListener("label-updated", handleUpdate);
    window.addEventListener("label-deleted", handleDelete);

    return () => {
      window.removeEventListener("label-created", handleCreate);
      window.removeEventListener("label-updated", handleUpdate);
      window.removeEventListener("label-deleted", handleDelete);
    };
  }, [closeOrderSidebar]);

  const searchOptions = Array.from(new Set(labels.map((row) => String(row[searchField]))));
  const filteredRows = labels.filter((row) =>
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
          onDelete={() => console.log("delete selected labels", checkedRowIds)}
          options={sortButtons}
          searchField={searchField}
          searchOptions={searchOptions}
          searchText={searchText}
          selectedCount={checkedRowIds.length}
          sortConditions={sortConditions}
        />
        <DataListTable
          checkedRowIds={checkedRowIds}
          columns={labelColumns}
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
    detailType: "label",
    orderNo: row.productionOrderNo,
    orderDate: row.createdAt,
    productionOrderId: row.productionOrderId,
    productionOrderNo: row.productionOrderNo,
    productQr: row.qrData,
    qrData: row.qrData,
    title: row.title,
    line1: row.line1,
    line2: row.line2,
    printedAt: row.printedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    customer: "-",
    product: row.product,
    quantity: row.productionOrderId,
    unitPrice: "-",
    dueDate: row.printedAt,
    status: row.printedAt === "-" ? "대기" : "출력완료",
    memo: `QR ${row.qrData}, line1 ${row.line1}, line2 ${row.line2}`,
  };
}

function toLabelRow(label: OrderLabelForm, index: number): LabelRow {
  return {
    id: index + 1,
    productionOrderId: label.productionOrderId || "-",
    productionOrderNo: label.productionOrderNo || "-",
    qrData: label.qrData,
    product: label.title || "-",
    lot: label.line1 || "-",
    title: label.title || "-",
    line1: label.line1 || "-",
    line2: label.line2 || "-",
    printedAt: toDisplayDateTime(label.printedAt),
    createdAt: toDisplayDateTime(label.createdAt),
    updatedAt: toDisplayDateTime(label.updatedAt),
  };
}

function toLabelRowFromApi(label: LabelResponse, index: number): LabelRow {
  return {
    id: index + 1,
    productionOrderId: label.productionOrderId ?? "-",
    productionOrderNo: label.productionOrderNo ?? "-",
    qrData: label.productQr,
    product: label.productName ?? label.title ?? "-",
    lot: label.line1 ?? "-",
    title: label.title ?? label.productName ?? "-",
    line1: label.line1 ?? "-",
    line2: label.line2 ?? "-",
    printedAt: toDisplayDateTime(label.printedAt ?? ""),
    createdAt: toDisplayDateTime(label.createdAt ?? ""),
    updatedAt: toDisplayDateTime(label.updatedAt ?? ""),
  };
}

function toDisplayDateTime(value: string) {
  if (!value) {
    return "-";
  }

  return value.replace("T", " ").replaceAll("-", ".");
}
