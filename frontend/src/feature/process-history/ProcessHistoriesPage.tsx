"use client";

import { useEffect, useMemo, useState } from "react";
import DataListTable from "../common/DataListTable";
import { formatKoreanDayTime } from "../common/dateFormat";
import ListToolbar from "../common/ListToolbar";
import { useOrderSidebar } from "../ordersidebar/OrderSidebarContext";
import { orderEndpoints } from "../../../lib/endpoints";
import { apiClient, getApiErrorMessage } from "../../../util/apiClient";
import { useApiMutationRevision } from "../../../util/apiMutationStore";
import type { DataListColumn } from "../common/DataListTable";
import type { ListOption, SortCondition } from "../common/ListToolbar";
import { compareNumericText, matchesSearch, sortByConditions, updateSortConditions } from "../common/listDataUtils";
import { useRowSelection } from "../common/useRowSelection";
import type { Order } from "../order/OrdersTypes";
import type { OrderProcessForm } from "../ordersidebar/OrderProcessFormCard";
import type { ProcessStatus } from "../ordersidebar/orderDetailApi";

type ProductRow = {
  id: number;
  purchaseDbId?: number;
  productionDbId?: number;
  purchaseId: string;
  customer: string;
  productName: string;
  quantity: string;
  lot: string;
  productQr: string;
  processSequence: string;
  processStatus: string | null;
  judgment: string;
  completedTime: string;
  purchasePrice: number | null;
  purchaseStatus: string | null;
  purchaseNote: string | null;
  purchaseCreatedTime: string | null;
  dueDate: string | null;
};

type ProductResponse = {
  purchaseDbId: number | null;
  productionDbId: number | null;
  productQr: string | null;
  productionId: string | null;
  customer: string | null;
  productName: string | null;
  quantity: number | null;
  lot: string | null;
  processSequence: string | null;
  process: string | null;
  isDefect: boolean | null;
  createdTime: string | null;
  price: number | null;
  purchaseStatus: string | null;
  note: string | null;
  purchaseCreatedTime: string | null;
  dueDate: string | null;
};

type ApiResponse<T> = { success: boolean; message: string; data: T };
type SortKey = keyof Omit<ProductRow, "id">;

const BATCH_PROCESS_OPTIONS: Array<{ value: ProcessStatus; label: string }> = [
  { value: "INSTRUCTION", label: "생산지시" },
  { value: "ASSEMBLY", label: "생산중" },
  { value: "TEST", label: "기능검사" },
  { value: "FINAL_INSPECTION", label: "출하검사" },
  { value: "PACKAGING", label: "포장" },
  { value: "WAITING_FOR_SHIPMENT", label: "납품대기" },
];

function batchProcessLabel(process: ProcessStatus) {
  return BATCH_PROCESS_OPTIONS.find((option) => option.value === process)?.label ?? process;
}

const sortButtons: ListOption<SortKey>[] = [
  { label: "발주번호", key: "purchaseId" },
  { label: "고객사", key: "customer" },
  { label: "품명", key: "productName" },
  { label: "발주수량", key: "quantity" },
  { label: "Lot No.", key: "lot" },
  { label: "제품QR", key: "productQr" },
  { label: "공정순서 및 판정", key: "processSequence" },
  { label: "완료시간", key: "completedTime" },
];

const columns: DataListColumn<ProductRow>[] = [
  { align: "center", header: "No.", key: "id", render: (row) => row.id },
  { align: "center", header: "발주번호", key: "purchaseId", render: (row) => row.purchaseId },
  { align: "center", header: "고객사", key: "customer", render: (row) => row.customer },
  { header: "품명", key: "productName", render: (row) => row.productName },
  { align: "center", header: "발주수량", key: "quantity", render: (row) => row.quantity },
  { align: "center", header: "Lot No.", key: "lot", render: (row) => row.lot },
  { align: "center", header: "제품QR", key: "productQr", render: (row) => row.productQr },
  {
    align: "center",
    header: "공정순서 및 판정",
    key: "processSequence",
    render: (row) => (
      <span className={`rounded-full px-3 py-1 font-bold ${
          row.judgment === "불량"
            ? "bg-rose-50 text-rose-700"
            : "bg-emerald-50 text-emerald-700"
        }`}>
        {row.processSequence}
      </span>
    ),
  },
  { align: "center", header: "완료시간", key: "completedTime", render: (row) => row.completedTime },
];

export default function ProcessHistoriesPage() {
  const mutationRevision = useApiMutationRevision();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const { selectedIds: checkedRowIds, setSelectedIds: setCheckedRowIds, toggleOne: toggleRowCheckbox } = useRowSelection<number>();
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState("");
  const [searchField, setSearchField] = useState<SortKey>("productQr");
  const [searchText, setSearchText] = useState("");
  const [sortConditions, setSortConditions] = useState<SortCondition<SortKey>[]>([]);
  const [batchJudgment, setBatchJudgment] = useState<"normal" | "defect">("normal");
  const [batchProcess, setBatchProcess] = useState<ProcessStatus | "">("");
  const [isBatchSaving, setIsBatchSaving] = useState(false);
  const { closeOrderSidebar, openOrderDetailSidebar } = useOrderSidebar();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await apiClient(orderEndpoints.processHistories);
        if (!response.ok) throw new Error(await getApiErrorMessage(response, "공정이력 목록을 조회하지 못했습니다."));
        const result = (await response.json()) as ApiResponse<ProductResponse[]>;
        setLoadError("");
        setProducts(result.data.map(toProductRow));
      } catch {
        setLoadError("제품 목록을 불러오지 못했습니다.");
        setProducts([]);
      }
    };
    void loadProducts();
  }, [mutationRevision]);

  useEffect(() => {
    const handleProcessUpdate = (event: Event) => {
      const { processId, order } = (
        event as CustomEvent<{ processId: number; order: OrderProcessForm }>
      ).detail;

      setProducts((current) =>
        current.map((product) =>
          product.id === processId
            ? { ...product, processSequence: toProcessLabel(order.processSequence) }
            : product,
        ),
      );
    };

    window.addEventListener("product-history-process-updated", handleProcessUpdate);
    return () => window.removeEventListener("product-history-process-updated", handleProcessUpdate);
  }, []);

  const searchOptions = useMemo(
    () => Array.from(new Set(products.map((row) => String(row[searchField])))),
    [products, searchField],
  );
  const sortedRows = useMemo(() => {
    const filteredRows = products.filter((row) => matchesSearch(row[searchField], searchText));
    return sortByConditions(filteredRows, sortConditions, (row, key) => row[key], compareNumericText);
  }, [products, searchField, searchText, sortConditions]);

  const handleToggleCheckbox = (row: ProductRow) => {
    toggleRowCheckbox(row.id);
  };

  const handleSelectProduct = (row: ProductRow) => {
    setSelectedRowId(row.id);
    openOrderDetailSidebar(toSidebarOrder(row));
  };

  const handleDeleteSelectedRows = async () => {
    const selectedRows = products.filter((row) => checkedRowIds.includes(row.id));

    if (selectedRows.length === 0 || !window.confirm(`${selectedRows.length}개를 정말로 삭제하시겠습니까?`)) {
      return;
    }

    const responses = await Promise.all(
      selectedRows.map((row) =>
        apiClient(orderEndpoints.shipment(row.productQr), {
          method: "DELETE",
        }),
      ),
    );

    const failedResponse = responses.find((response) => !response.ok);
    if (failedResponse) {
      window.alert(await getApiErrorMessage(failedResponse, "선택한 공정이력 삭제에 실패했습니다."));
      return;
    }

    setProducts((current) =>
      current
        .filter((row) => !checkedRowIds.includes(row.id))
        .map((row, index) => ({ ...row, id: index + 1 })),
    );
    setCheckedRowIds([]);
    setSelectedRowId(null);
    closeOrderSidebar();
  };

  const handleBatchSave = async () => {
    const selectedRows = products.filter((row) => checkedRowIds.includes(row.id));
    if (selectedRows.length === 0 || !batchProcess) return;

    setIsBatchSaving(true);
    try {
      const responses = await Promise.all(
        selectedRows.map((row) =>
          apiClient(orderEndpoints.productProcess(row.productQr), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              processName: batchProcess,
              isDefect: batchJudgment === "defect",
            }),
          }),
        ),
      );

      const failedResponse = responses.find((response) => !response.ok);
      if (failedResponse) {
        window.alert(await getApiErrorMessage(failedResponse, "선택한 공정이력 일괄 저장에 실패했습니다."));
        return;
      }

      const selectedIds = new Set(checkedRowIds);
      setProducts((current) => current.map((row) => selectedIds.has(row.id) ? {
        ...row,
        processStatus: batchProcess,
        processSequence: batchProcessLabel(batchProcess),
        judgment: batchJudgment === "defect" ? "불량" : "정상",
      } : row));
      setCheckedRowIds([]);
      setBatchJudgment("normal");
      setBatchProcess("");
      setSelectedRowId(null);
      closeOrderSidebar();
    } finally {
      setIsBatchSaving(false);
    }
  };

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white text-slate-950">
      <section className="flex min-w-0 flex-1 flex-col px-5 py-5">
        <ListToolbar
          categoryKey="process"
          afterDelete={
            <div className="flex items-center gap-2">
              <select
                aria-label="판정 일괄 선택"
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-violet-400"
                onChange={(event) => setBatchJudgment(event.target.value as "normal" | "defect")}
                value={batchJudgment}
              >
                <option value="normal">정상</option>
                <option value="defect">불량</option>
              </select>
              <select
                aria-label="공정순서 일괄 선택"
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-violet-400"
                onChange={(event) => setBatchProcess(event.target.value as ProcessStatus | "")}
                value={batchProcess}
              >
                <option value="">공정순서 선택</option>
                {BATCH_PROCESS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
              <button
                className="h-10 rounded-lg bg-violet-600 px-4 text-sm font-bold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={checkedRowIds.length === 0 || !batchProcess || isBatchSaving}
                onClick={() => void handleBatchSave()}
                type="button"
              >
                일괄 저장
              </button>
            </div>
          }
          onDelete={handleDeleteSelectedRows}
          onSearchFieldChange={setSearchField}
          onSearchTextChange={setSearchText}
          onSort={(key) => setSortConditions((current) => updateSortConditions(current, key))}
          options={sortButtons}
          searchField={searchField}
          searchOptions={searchOptions}
          searchText={searchText}
          selectedCount={checkedRowIds.length}
          sortConditions={sortConditions}
        />
        <DataListTable
          categoryKey="process"
          onColumnSort={(key) => setSortConditions((current) => updateSortConditions(current, key as SortKey))}
          sortableColumnKeys={sortButtons.map((option) => option.key)}
          sortConditions={sortConditions}
          checkedRowIds={checkedRowIds}
          columns={columns}
          emptyMessage={loadError || "리스트가 비어있습니다."}
          getRowId={(row) => row.id}
          onBlankClick={closeOrderSidebar}
          onCheckboxChange={handleToggleCheckbox}
          onRowClick={handleSelectProduct}
          rows={sortedRows}
          selectedRowId={selectedRowId}
        />
      </section>
    </main>
  );
}

function toSidebarOrder(row: ProductRow): Order {
  return {
    id: row.id,
    purchaseDbId: row.purchaseDbId,
    productionDbId: row.productionDbId,
    detailType: "process",
    processUpdateScope: "product",
    orderNo: row.purchaseId,
    orderDate: row.completedTime,
    productionOrderNo: row.purchaseId,
    customer: row.customer,
    product: row.productName,
    quantity: row.quantity,
    productQr: row.productQr,
    lotNo: row.lot,
    processName: row.processSequence,
    processSequence: row.processSequence,
    productProcessStatus: row.processStatus ?? undefined,
    isDefect: row.judgment === "불량",
    purchasePrice: row.purchasePrice,
    purchaseStatus: row.purchaseStatus,
    purchaseNote: row.purchaseNote,
    purchaseCreatedTime: row.purchaseCreatedTime,
    purchaseDueDate: row.dueDate,
    judgment: row.judgment,
    unitPrice: "-",
    dueDate: row.dueDate ?? "-",
    status: row.judgment,
    memo: "-",
  };
}

function toProcessLabel(value: string) {
  const labels: Record<string, string> = {
    ASSEMBLY: "생산중",
    TEST: "기능검사",
    FINAL_INSPECTION: "출하검사",
    PACKAGING: "포장",
  };
  return labels[value] ?? value;
}

function toProductRow(product: ProductResponse, index: number): ProductRow {
  return {
    id: index + 1,
    purchaseDbId: product.purchaseDbId ?? undefined,
    productionDbId: product.productionDbId ?? undefined,
    purchaseId: product.productionId ?? "-",
    customer: product.customer ?? "-",
    productName: product.productName ?? "-",
    quantity: String(product.quantity ?? 1),
    lot: product.lot ?? "-",
    productQr: product.productQr ?? "-",
    processSequence: product.processSequence ?? "-",
    processStatus: product.process,
    judgment: product.isDefect ? "불량" : "정상",
    completedTime: formatKoreanDayTime(product.createdTime),
    purchasePrice: product.price,
    purchaseStatus: product.purchaseStatus,
    purchaseNote: product.note,
    purchaseCreatedTime: product.purchaseCreatedTime,
    dueDate: product.dueDate,
  };
}
