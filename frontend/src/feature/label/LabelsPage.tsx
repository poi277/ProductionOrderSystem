"use client";

import { useEffect, useMemo, useState } from "react";
import DataListTable from "../common/DataListTable";
import { formatKoreanDateTimeWithoutYear } from "../common/dateFormat";
import ListToolbar from "../common/ListToolbar";
import type { DataListColumn } from "../common/DataListTable";
import type { ListOption, SortCondition } from "../common/ListToolbar";
import { compareNumericText, matchesSearch, sortByConditions, updateSortConditions } from "../common/listDataUtils";
import { useRowSelection } from "../common/useRowSelection";
import type { Order } from "../order/OrdersTypes";
import { useOrderSidebar } from "../ordersidebar/OrderSidebarContext";
import type { OrderLabelForm } from "../ordersidebar/OrderLabelFormCard";
import { orderEndpoints } from "../../../lib/endpoints";
import { apiClient, getApiErrorMessage } from "../../../util/apiClient";
import { useApiMutationRevision } from "../../../util/apiMutationStore";

type LabelRow = {
  id: number;
  purchaseDbId?: number;
  productionDbId?: number;
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
  customer: string;
  quantity: number | null;
  price: number | null;
  dueDate: string | null;
  purchaseStatus: string | null;
  note: string | null;
  purchaseCreatedTime: string | null;
  productQrQuantity: number | null;
  process: string | null;
  isDefect: boolean;
};

type LabelResponse = {
  purchaseDbId: number | null;
  productionDbId: number | null;
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
  customer: string | null;
  quantity: number | null;
  price: number | null;
  dueDate: string | null;
  purchaseStatus: string | null;
  note: string | null;
  purchaseCreatedTime: string | null;
  productQrQuantity: number | null;
  process: string | null;
  isDefect: boolean | null;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type SortKey = keyof Omit<LabelRow, "id">;

const sortButtons: ListOption<SortKey>[] = [
  { label: "QR 데이터", key: "qrData" },
  { label: "제품명", key: "product" },
  { label: "LOT", key: "lot" },
  { label: "발주(생산)번호", key: "productionOrderNo" },
  { label: "생성시간", key: "createdAt" },
];

const labelColumns: DataListColumn<LabelRow>[] = [
  { align: "center", header: "QR데이터", key: "qrData", render: (row) => row.qrData },
  { align: "center", header: "제품명", key: "product", render: (row) => row.product },
  { align: "center", header: "LOT", key: "lot", render: (row) => row.lot },
  { align: "center", header: "발주(생산)번호", key: "productionOrderNo", render: (row) => row.productionOrderNo },
  { align: "center", header: "생성시간", key: "createdAt", render: (row) => row.createdAt },
];

export default function LabelsPage() {
  const mutationRevision = useApiMutationRevision();
  const [labels, setLabels] = useState<LabelRow[]>([]);
  const [loadError, setLoadError] = useState("");
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const { selectedIds: checkedRowIds, toggleOne: toggleRowCheckbox } = useRowSelection<number>();
  const [sortConditions, setSortConditions] = useState<SortCondition<SortKey>[]>([]);
  const [searchField, setSearchField] = useState<SortKey>("qrData");
  const [searchText, setSearchText] = useState("");
  const { closeOrderSidebar, openOrderDetailSidebar } = useOrderSidebar();

  useEffect(() => {
    const loadLabels = async () => {
      try {
        const response = await apiClient(orderEndpoints.labels);

        if (!response.ok) {
          setLoadError(await getApiErrorMessage(response, "라벨 목록을 불러오지 못했습니다."));
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
  }, [mutationRevision]);

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

  const searchOptions = useMemo(
    () => Array.from(new Set(labels.map((row) => String(row[searchField])))),
    [labels, searchField],
  );
  const sortedRows = useMemo(() => {
    const filteredRows = labels.filter((row) => matchesSearch(row[searchField], searchText));
    return sortByConditions(filteredRows, sortConditions, (row, key) => row[key], compareNumericText);
  }, [labels, searchField, searchText, sortConditions]);

  const handleSort = (key: SortKey) => {
    setSortConditions((current) => updateSortConditions(current, key));
  };

  const handleToggleCheckbox = (row: LabelRow) => {
    toggleRowCheckbox(row.id);
  };

  const handleSelectRow = (row: LabelRow) => {
    setSelectedRowId(row.id);
    openOrderDetailSidebar(toSidebarOrder(row));
  };

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white text-slate-950">
      <section className="flex min-w-0 flex-1 flex-col px-5 py-5">
        <ListToolbar
          categoryKey="label"
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
          categoryKey="label"
          onColumnSort={(key) => handleSort(key as SortKey)}
          sortableColumnKeys={sortButtons.map((option) => option.key)}
          sortConditions={sortConditions}
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

function toSidebarOrder(row: LabelRow): Order {
  return {
    id: row.id,
    purchaseDbId: row.purchaseDbId,
    productionDbId: row.productionDbId,
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
    customer: row.customer,
    product: row.product,
    quantity: row.quantity == null ? "-" : String(row.quantity),
    unitPrice: row.price == null ? "-" : String(row.price),
    dueDate: row.dueDate ?? "-",
    purchasePrice: row.price,
    purchaseDueDate: row.dueDate,
    purchaseStatus: row.purchaseStatus,
    purchaseNote: row.note,
    purchaseCreatedTime: row.purchaseCreatedTime,
    productQrQuantity: row.productQrQuantity,
    productProcessStatus: row.process ?? undefined,
    isDefect: row.isDefect,
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
    customer: "-", quantity: null, price: null, dueDate: null, purchaseStatus: null, note: null,
    purchaseCreatedTime: null, productQrQuantity: null, process: null, isDefect: false,
  };
}

function toLabelRowFromApi(label: LabelResponse, index: number): LabelRow {
  return {
    id: index + 1,
    purchaseDbId: label.purchaseDbId ?? undefined,
    productionDbId: label.productionDbId ?? undefined,
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
    customer: label.customer ?? "-",
    quantity: label.quantity,
    price: label.price,
    dueDate: label.dueDate,
    purchaseStatus: label.purchaseStatus,
    note: label.note,
    purchaseCreatedTime: label.purchaseCreatedTime,
    productQrQuantity: label.productQrQuantity,
    process: label.process,
    isDefect: Boolean(label.isDefect),
  };
}

function toDisplayDateTime(value: string) {
  return formatKoreanDateTimeWithoutYear(value);
}
