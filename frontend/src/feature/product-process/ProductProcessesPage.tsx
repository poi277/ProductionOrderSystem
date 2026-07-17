"use client";

import { useEffect, useMemo, useState } from "react";
import DataListTable from "../common/DataListTable";
import { formatKoreanDateTimeWithoutYear } from "../common/dateFormat";
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

type ProductProcess = {
  id: number;
  purchaseDbId?: number;
  productionDbId?: number;
  createdTime: string;
  customer: string;
  productionOrderNo: string;
  productName: string;
  quantity: string;
  qrQuantity: string;
  lotNo: string;
  productQr: string;
  processSequence: string;
  processStatus: string | null;
  isDefect: boolean;
  purchaseStatus: string | null;
  purchaseNote: string | null;
  purchaseCreatedTime: string | null;
  dueDate: string | null;
};

type ProductProcessResponse = {
  purchaseDbId: number | null;
  productionDbId: number | null;
  productQr: string;
  productionId: string | null;
  customer: string | null;
  productName: string | null;
  quantity: number | null;
  productQrQuantity: number | null;
  lot: string | null;
  process: string | null;
  processName: string | null;
  processSequence: string | null;
  isDefect: boolean | null;
  purchaseStatus: string | null;
  note: string | null;
  purchaseCreatedTime: string | null;
  dueDate: string | null;
  startedAt: string | null;
  createdTime: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const productProcessLabels: Record<string, string> = {
  INSTRUCTION: "생산지시",
  ASSEMBLY: "생산중",
  TEST: "기능검사",
  FINAL_INSPECTION: "출하검사",
  PACKAGING: "포장",
  SHIPPED: "출하",
};

type SortKey = keyof Omit<ProductProcess, "id">;

const sortButtons: ListOption<SortKey>[] = [
  { label: "발주번호", key: "productionOrderNo" },
  { label: "고객사", key: "customer" },
  { label: "품명", key: "productName" },
  { label: "발주수량", key: "quantity" },
  { label: "현재공정", key: "processSequence" },
];

const processColumns: DataListColumn<ProductProcess>[] = [
  { align: "center", header: "No.", key: "id", render: (row) => row.id },
  { align: "center", header: "발주번호", key: "productionOrderNo", render: (row) => row.productionOrderNo },
  { align: "center", header: "고객사", key: "customer", render: (row) => row.customer },
  { header: "품명", key: "productName", render: (row) => row.productName },
  { align: "center", header: "발주수량", key: "quantity", render: (row) => row.quantity },
  { align: "center", header: "현재공정", key: "processSequence", render: (row) => row.processSequence },
];

export default function ProductProcessesPage() {
  const mutationRevision = useApiMutationRevision();
  const [processes, setProcesses] = useState<ProductProcess[]>([]);
  const [loadError, setLoadError] = useState("");
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const { selectedIds: checkedRowIds, setSelectedIds: setCheckedRowIds, toggleOne: toggleRowCheckbox } = useRowSelection<number>();
  const [sortConditions, setSortConditions] = useState<SortCondition<SortKey>[]>([]);
  const [searchField, setSearchField] = useState<SortKey>("productQr");
  const [searchText, setSearchText] = useState("");
  const { closeOrderSidebar, openOrderDetailSidebar } = useOrderSidebar();

  useEffect(() => {
    const loadProcesses = async () => {
      try {
        const response = await apiClient(orderEndpoints.productionProcesses);

        if (!response.ok) {
          setLoadError(await getApiErrorMessage(response, "생산현황 목록을 불러오지 못했습니다."));
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
  }, [mutationRevision]);

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
          row.id === processId
            ? {
                ...row,
                productName: updatedProcess.productName || row.productName,
                lotNo: updatedProcess.lotNo || row.lotNo,
                processSequence: toProductProcessLabel(updatedProcess.processSequence),
              }
            : row,
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

  const searchOptions = useMemo(
    () => Array.from(new Set(processes.map((row) => String(row[searchField])))),
    [processes, searchField],
  );
  const sortedRows = useMemo(() => {
    const filteredRows = processes.filter((row) => matchesSearch(row[searchField], searchText));
    return sortByConditions(filteredRows, sortConditions, (row, key) => row[key], compareNumericText);
  }, [processes, searchField, searchText, sortConditions]);

  const handleToggleCheckbox = (row: ProductProcess) => {
    toggleRowCheckbox(row.id);
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
        apiClient(orderEndpoints.productProcess(row.productQr), {
          method: "DELETE",
        }),
      ),
    );

    const failedResponse = responses.find((response) => !response.ok);
    if (failedResponse) {
      window.alert(await getApiErrorMessage(failedResponse, "선택한 생산현황 삭제에 실패했습니다."));
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
          categoryKey="processOverview"
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
          categoryKey="processOverview"
          onColumnSort={(key) => setSortConditions((current) => updateSortConditions(current, key as SortKey))}
          sortableColumnKeys={sortButtons.map((option) => option.key)}
          sortConditions={sortConditions}
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

function toSidebarOrder(row: ProductProcess): Order {
  return {
    id: row.id,
    purchaseDbId: row.purchaseDbId,
    productionDbId: row.productionDbId,
    detailType: "process",
    orderNo: row.productionOrderNo,
    orderDate: row.createdTime,
    productionOrderNo: row.productionOrderNo,
    productQr: row.productQr,
    lotNo: row.lotNo,
    processName: row.processSequence,
    processSequence: row.processSequence,
    productProcessStatus: row.processStatus ?? undefined,
    isDefect: row.isDefect,
    purchaseStatus: row.purchaseStatus,
    purchaseNote: row.purchaseNote,
    purchaseCreatedTime: row.purchaseCreatedTime,
    purchaseDueDate: row.dueDate,
    productQrQuantity: Number(row.qrQuantity) || 0,
    startedAt: "-",
    customer: row.customer,
    product: row.productName,
    quantity: row.quantity,
    instructionQuantity: row.qrQuantity,
    dueDate: row.dueDate ?? "-",
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
    qrQuantity: "1",
    lotNo: process.lotNo || "-",
    productQr: process.productQr,
    processSequence: toProductProcessLabel(process.processSequence),
    processStatus: process.processSequence,
    isDefect: false,
    purchaseStatus: null,
    purchaseNote: null,
    purchaseCreatedTime: null,
    dueDate: null,
  };
}

function toProductProcessRowFromApi(process: ProductProcessResponse, index: number): ProductProcess {
  return {
    id: index + 1,
    purchaseDbId: process.purchaseDbId ?? undefined,
    productionDbId: process.productionDbId ?? undefined,
    createdTime: formatKoreanDateTimeWithoutYear(process.createdTime),
    customer: process.customer ?? "-",
    productionOrderNo: process.productionId ?? "-",
    productName: process.productName ?? "-",
    quantity: String(process.quantity ?? 1),
    qrQuantity: String(process.productQrQuantity ?? 0),
    lotNo: process.lot ?? "-",
    productQr: process.productQr,
    processSequence: process.processName ?? process.processSequence ?? toProductProcessLabel(process.process),
    processStatus: process.process,
    isDefect: Boolean(process.isDefect),
    purchaseStatus: process.purchaseStatus,
    purchaseNote: process.note,
    purchaseCreatedTime: process.purchaseCreatedTime,
    dueDate: process.dueDate,
  };
}

function toProductProcessLabel(value: string | null | undefined) {
  if (!value) {
    return "-";
  }

  return productProcessLabels[value] ?? value;
}

