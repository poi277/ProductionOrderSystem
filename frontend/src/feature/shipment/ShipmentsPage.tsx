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
import type { OrderShipmentForm } from "../ordersidebar/OrderShipmentFormCard";

type Shipment = {
  id: number;
  purchaseDbId?: number;
  productionDbId?: number;
  createdAt: string;
  customer: string;
  productionOrderNo: string;
  productName: string;
  quantity: string;
  packedQuantity: string;
  lotNo: string;
  productQr: string;
  productQrs: string[];
  productProcessNo: string;
  processName: string;
  judgment: string;
  completedAt: string;
  shippedAt: string;
  memo: string;
  updatedAt: string;
  price: number | null;
  dueDate: string | null;
  purchaseStatus: string | null;
  purchaseNote: string | null;
  purchaseCreatedTime: string | null;
  productQrQuantity: number | null;
  process: string | null;
  isDefect: boolean;
};

type ShipmentResponse = {
  purchaseDbId: number | null;
  productionDbId: number | null;
  shipmentId: string;
  productQr: string | null;
  productQrs: string[] | null;
  productName: string | null;
  productionId: string | null;
  customer: string | null;
  quantity: number | null;
  packedQuantity: number | null;
  lot: string | null;
  productProcessNo: string | null;
  processName: string | null;
  shippedAt: string | null;
  memo: string | null;
  createdAt: string | null;
  updatedAt: string | null;
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

type SortKey = keyof Omit<Shipment, "id">;

const sortButtons: ListOption<SortKey>[] = [
  { label: "발주번호", key: "productionOrderNo" },
  { label: "고객사", key: "customer" },
  { label: "품명", key: "productName" },
  { label: "발주수량", key: "quantity" },
  { label: "포장수량", key: "packedQuantity" },
  { label: "Lot No.", key: "lotNo" },
];

const shipmentColumns: DataListColumn<Shipment>[] = [
  { align: "center", header: "No.", key: "id", render: (row) => row.id },
  { align: "center", header: "발주번호", key: "productionOrderNo", render: (row) => row.productionOrderNo },
  { align: "center", header: "고객사", key: "customer", render: (row) => row.customer },
  { header: "품명", key: "productName", render: (row) => row.productName },
  { align: "center", header: "발주수량", key: "quantity", render: (row) => row.quantity },
  { align: "center", header: "포장수량", key: "packedQuantity", render: (row) => row.packedQuantity },
  { align: "center", header: "Lot No.", key: "lotNo", render: (row) => row.lotNo },
];

export default function ShipmentsPage() {
  const mutationRevision = useApiMutationRevision();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loadError, setLoadError] = useState("");
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const { selectedIds: checkedRowIds, setSelectedIds: setCheckedRowIds, toggleOne: toggleRowCheckbox } = useRowSelection<number>();
  const [sortConditions, setSortConditions] = useState<SortCondition<SortKey>[]>([]);
  const [searchField, setSearchField] = useState<SortKey>("productionOrderNo");
  const [searchText, setSearchText] = useState("");
  const { closeOrderSidebar, openOrderDetailSidebar } = useOrderSidebar();

  useEffect(() => {
    const loadShipments = async () => {
      try {
        const response = await apiClient(orderEndpoints.shipments);

        if (!response.ok) {
          setLoadError(await getApiErrorMessage(response, "검수/포장 목록을 불러오지 못했습니다."));
          setShipments([]);
          return;
        }

        const result = (await response.json()) as ApiResponse<ShipmentResponse[]>;
        setLoadError("");
        setShipments(result.data.map(toShipmentRowFromApi));
      } catch {
        setLoadError("검수/포장 목록을 불러오지 못했습니다.");
        setShipments([]);
      }
    };

    void loadShipments();
  }, [mutationRevision]);

  useEffect(() => {
    const handleCreate = (event: Event) => {
      const createdShipment = (event as CustomEvent<OrderShipmentForm>).detail;

      setShipments((current) =>
        [toShipmentRow(createdShipment, 0), ...current].map((row, index) => ({ ...row, id: index + 1 })),
      );
    };

    const handleUpdate = (event: Event) => {
      const { shipmentId, order: updatedShipment } = (
        event as CustomEvent<{ shipmentId: number; order: OrderShipmentForm }>
      ).detail;

      setShipments((current) =>
        current.map((row) =>
          row.id === shipmentId ? { ...toShipmentRow(updatedShipment, row.id - 1), id: row.id } : row,
        ),
      );
    };

    const handleDelete = (event: Event) => {
      const deletedShipmentId = (event as CustomEvent<number>).detail;

      setShipments((current) =>
        current.filter((row) => row.id !== deletedShipmentId).map((row, index) => ({ ...row, id: index + 1 })),
      );
      setSelectedRowId(null);
      closeOrderSidebar();
    };

    window.addEventListener("shipment-created", handleCreate);
    window.addEventListener("shipment-updated", handleUpdate);
    window.addEventListener("shipment-deleted", handleDelete);

    return () => {
      window.removeEventListener("shipment-created", handleCreate);
      window.removeEventListener("shipment-updated", handleUpdate);
      window.removeEventListener("shipment-deleted", handleDelete);
    };
  }, [closeOrderSidebar]);

  const searchOptions = useMemo(
    () => Array.from(new Set(shipments.map((row) => String(row[searchField])))),
    [shipments, searchField],
  );
  const sortedRows = useMemo(() => {
    const filteredRows = shipments.filter((row) => matchesSearch(row[searchField], searchText));
    return sortByConditions(filteredRows, sortConditions, (row, key) => row[key], compareNumericText);
  }, [shipments, searchField, searchText, sortConditions]);

  const handleToggleCheckbox = (row: Shipment) => {
    toggleRowCheckbox(row.id);
  };

  const handleSelectRow = (row: Shipment) => {
    setSelectedRowId(row.id);
    openOrderDetailSidebar(toSidebarOrder(row));
  };

  const handleDeleteSelectedRows = async () => {
    const selectedRows = shipments.filter((row) => checkedRowIds.includes(row.id));

    if (selectedRows.length === 0 || !window.confirm(`${selectedRows.length}개를 정말로 삭제하시겠습니까?`)) {
      return;
    }

    const responses = await Promise.all(
      selectedRows.flatMap((row) => row.productQrs).map((productQr) =>
        apiClient(orderEndpoints.shipment(productQr), {
          method: "DELETE",
        }),
      ),
    );

    const failedResponse = responses.find((response) => !response.ok);
    if (failedResponse) {
      window.alert(await getApiErrorMessage(failedResponse, "선택한 검수/포장 삭제에 실패했습니다."));
      return;
    }

    setShipments((current) =>
      current
        .filter((row) => !checkedRowIds.includes(row.id))
        .map((row, index) => ({ ...row, id: index + 1 })),
    );
    setCheckedRowIds([]);
    setSelectedRowId(null);
    closeOrderSidebar();
  };

  const handleCompleteSelectedRows = async () => {
    const selectedRows = shipments.filter((row) => checkedRowIds.includes(row.id));

    if (selectedRows.length === 0 || !window.confirm(`${selectedRows.length}개를 출하 처리하시겠습니까?`)) {
      return;
    }

    const response = await apiClient(orderEndpoints.completeShipments, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedRows.flatMap((row) => row.productQrs)),
    });

    if (!response.ok) {
      window.alert(await getApiErrorMessage(response, "선택한 출하 처리에 실패했습니다."));
      return;
    }

    setShipments((current) =>
      current
        .filter((row) => !checkedRowIds.includes(row.id))
        .map((row, index) => ({ ...row, id: index + 1 })),
    );
    setCheckedRowIds([]);
    setSelectedRowId(null);
    closeOrderSidebar();
  };

  const handleCompleteAllRows = async () => {
    if (shipments.length === 0 || !window.confirm(`${shipments.length}개 제품을 전체 출하 처리하시겠습니까?`)) {
      return;
    }

    const response = await apiClient(orderEndpoints.completeShipments, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(shipments.flatMap((row) => row.productQrs)),
    });

    if (!response.ok) {
      window.alert(await getApiErrorMessage(response, "전체 출하 처리에 실패했습니다."));
      return;
    }

    setShipments([]);
    setCheckedRowIds([]);
    setSelectedRowId(null);
    closeOrderSidebar();
  };

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white text-slate-950">
      <section className="flex min-w-0 flex-1 flex-col px-5 py-5">
        <ListToolbar
          categoryKey="shipment"
          extraAction={{
            disabled: checkedRowIds.length === 0,
            label: "출하",
            onClick: handleCompleteSelectedRows,
          }}
          extraActions={[
            {
              disabled: shipments.length === 0,
              label: "전체출하",
              onClick: handleCompleteAllRows,
            },
          ]}
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
          categoryKey="shipment"
          onColumnSort={(key) => setSortConditions((current) => updateSortConditions(current, key as SortKey))}
          sortableColumnKeys={sortButtons.map((option) => option.key)}
          sortConditions={sortConditions}
          checkedRowIds={checkedRowIds}
          columns={shipmentColumns}
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

function toSidebarOrder(row: Shipment): Order {
  return {
    id: row.id,
    purchaseDbId: row.purchaseDbId,
    productionDbId: row.productionDbId,
    detailType: "shipment",
    orderNo: row.productionOrderNo,
    orderDate: row.createdAt,
    productionOrderNo: row.productionOrderNo,
    productProcessNo: row.productProcessNo,
    productQr: row.productQr,
    product: row.productName,
    processName: row.processName,
    shippedAt: row.shippedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    customer: row.customer,
    quantity: row.quantity,
    unitPrice: row.price == null ? "-" : String(row.price),
    dueDate: row.dueDate ?? "-",
    purchasePrice: row.price,
    purchaseDueDate: row.dueDate,
    purchaseStatus: row.purchaseStatus,
    purchaseNote: row.purchaseNote,
    purchaseCreatedTime: row.purchaseCreatedTime,
    productQrQuantity: row.productQrQuantity,
    productProcessStatus: row.process ?? undefined,
    isDefect: row.isDefect,
    status: "-",
    memo: row.memo,
  };
}

function toShipmentRow(shipment: OrderShipmentForm, index: number): Shipment {
  return {
    id: index + 1,
    createdAt: formatKoreanDateTimeWithoutYear(shipment.createdAt),
    customer: "-",
    productionOrderNo: shipment.productionOrderNo,
    productName: shipment.productQr,
    quantity: "1",
    packedQuantity: "1",
    lotNo: shipment.memo || "-",
    productQr: shipment.productQr,
    productQrs: [shipment.productQr],
    productProcessNo: shipment.productProcessNo,
    processName: shipment.processName,
    judgment: "-",
    completedAt: formatKoreanDateTimeWithoutYear(shipment.updatedAt || shipment.shippedAt),
    shippedAt: formatKoreanDateTimeWithoutYear(shipment.shippedAt),
    memo: shipment.memo || "-",
    updatedAt: formatKoreanDateTimeWithoutYear(shipment.updatedAt),
    price: null, dueDate: null, purchaseStatus: null, purchaseNote: null, purchaseCreatedTime: null,
    productQrQuantity: null, process: null, isDefect: false,
  };
}

function toShipmentRowFromApi(shipment: ShipmentResponse, index: number): Shipment {
  return {
    id: index + 1,
    purchaseDbId: shipment.purchaseDbId ?? undefined,
    productionDbId: shipment.productionDbId ?? undefined,
    createdAt: formatKoreanDateTimeWithoutYear(shipment.createdAt),
    customer: shipment.customer ?? "-",
    productionOrderNo: shipment.productionId ?? "-",
    productName: shipment.productName ?? "-",
    quantity: String(shipment.quantity ?? 1),
    packedQuantity: String(shipment.packedQuantity ?? shipment.productQrs?.length ?? 0),
    lotNo: shipment.lot ?? shipment.memo ?? "-",
    productQr: shipment.productQr ?? "-",
    productQrs: shipment.productQrs ?? (shipment.productQr ? [shipment.productQr] : []),
    productProcessNo: shipment.productProcessNo ?? shipment.shipmentId,
    processName: shipment.processName ?? "-",
    judgment: "-",
    completedAt: formatKoreanDateTimeWithoutYear(shipment.updatedAt ?? shipment.shippedAt),
    shippedAt: formatKoreanDateTimeWithoutYear(shipment.shippedAt),
    memo: shipment.memo ?? "-",
    updatedAt: formatKoreanDateTimeWithoutYear(shipment.updatedAt),
    price: shipment.price,
    dueDate: shipment.dueDate,
    purchaseStatus: shipment.purchaseStatus,
    purchaseNote: shipment.note,
    purchaseCreatedTime: shipment.purchaseCreatedTime,
    productQrQuantity: shipment.productQrQuantity,
    process: shipment.process,
    isDefect: Boolean(shipment.isDefect),
  };
}
