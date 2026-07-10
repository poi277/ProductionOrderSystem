"use client";

import { useEffect, useState } from "react";
import DataListTable from "../common/DataListTable";
import { formatKoreanDateTimeWithoutYear } from "../common/dateFormat";
import ListToolbar from "../common/ListToolbar";
import { useOrderSidebar } from "../ordersidebar/OrderSidebarContext";
import type { DataListColumn } from "../common/DataListTable";
import type { ListOption, SortCondition } from "../common/ListToolbar";
import type { Order } from "../order/OrdersTypes";
import type { OrderShipmentForm } from "../ordersidebar/OrderShipmentFormCard";

type Shipment = {
  id: number;
  createdAt: string;
  customer: string;
  productionOrderNo: string;
  productName: string;
  quantity: string;
  lotNo: string;
  productQr: string;
  productProcessNo: string;
  processName: string;
  shippedAt: string;
  memo: string;
  updatedAt: string;
};

type ShipmentResponse = {
  shipmentId: string;
  productQr: string | null;
  productName: string | null;
  productionId: string | null;
  customer: string | null;
  quantity: number | null;
  lot: string | null;
  productProcessNo: string | null;
  processName: string | null;
  shippedAt: string | null;
  memo: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const orderApiBaseUrl = process.env.NEXT_PUBLIC_ORDER_API_BASE_URL ?? "http://localhost:8080/order";

type SortKey = keyof Omit<Shipment, "id">;

const sortButtons: ListOption<SortKey>[] = [
  { label: "날짜", key: "createdAt" },
  { label: "고객사", key: "customer" },
  { label: "지시번호", key: "productionOrderNo" },
  { label: "품명", key: "productName" },
  { label: "수량", key: "quantity" },
  { label: "LOT", key: "lotNo" },
  { label: "QR", key: "productQr" },
];

const shipmentColumns: DataListColumn<Shipment>[] = [
  { align: "center", header: "No.", key: "id", render: (row) => row.id },
  { align: "center", header: "날짜", key: "createdAt", render: (row) => row.createdAt },
  { align: "center", header: "고객사", key: "customer", render: (row) => row.customer },
  { align: "center", header: "지시번호", key: "productionOrderNo", render: (row) => row.productionOrderNo },
  { header: "품명", key: "productName", render: (row) => row.productName },
  { align: "center", header: "수량", key: "quantity", render: (row) => row.quantity },
  { align: "center", header: "LOT", key: "lotNo", render: (row) => row.lotNo },
  { align: "center", header: "QR", key: "productQr", render: (row) => row.productQr },
];

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loadError, setLoadError] = useState("");
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [checkedRowIds, setCheckedRowIds] = useState<number[]>([]);
  const [sortConditions, setSortConditions] = useState<SortCondition<SortKey>[]>([]);
  const [searchField, setSearchField] = useState<SortKey>("productQr");
  const [searchText, setSearchText] = useState("");
  const { closeOrderSidebar, openOrderDetailSidebar } = useOrderSidebar();

  useEffect(() => {
    const loadShipments = async () => {
      try {
        const response = await fetch(`${orderApiBaseUrl}/shipments`);

        if (!response.ok) {
          setLoadError("검수/포장 목록을 불러오지 못했습니다.");
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
  }, []);

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

  const searchOptions = Array.from(new Set(shipments.map((row) => String(row[searchField]))));
  const filteredRows = shipments.filter((row) =>
    String(row[searchField]).toLowerCase().includes(searchText.toLowerCase()),
  );
  const sortedRows = sortRows(filteredRows, sortConditions);

  const handleToggleCheckbox = (row: Shipment) => {
    setCheckedRowIds((current) =>
      current.includes(row.id) ? current.filter((rowId) => rowId !== row.id) : [...current, row.id],
    );
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
      selectedRows.map((row) =>
        fetch(`${orderApiBaseUrl}/shipments/${encodeURIComponent(row.productQr)}`, {
          method: "DELETE",
        }),
      ),
    );

    if (responses.some((response) => !response.ok)) {
      window.alert("선택한 검수/포장 삭제에 실패했습니다.");
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

    const response = await fetch(`${orderApiBaseUrl}/shipments/complete`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedRows.map((row) => row.productQr)),
    });

    if (!response.ok) {
      window.alert("선택한 출하 처리에 실패했습니다.");
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

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white text-slate-950">
      <section className="flex min-w-0 flex-1 flex-col px-5 py-5">
        <ListToolbar
          extraAction={{
            disabled: checkedRowIds.length === 0,
            label: "출하",
            onClick: handleCompleteSelectedRows,
          }}
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

function sortRows(rows: Shipment[], conditions: SortCondition<SortKey>[]) {
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

function toSidebarOrder(row: Shipment): Order {
  return {
    id: row.id,
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
    unitPrice: "-",
    dueDate: row.shippedAt,
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
    lotNo: shipment.memo || "-",
    productQr: shipment.productQr,
    productProcessNo: shipment.productProcessNo,
    processName: shipment.processName,
    shippedAt: formatKoreanDateTimeWithoutYear(shipment.shippedAt),
    memo: shipment.memo || "-",
    updatedAt: formatKoreanDateTimeWithoutYear(shipment.updatedAt),
  };
}

function toShipmentRowFromApi(shipment: ShipmentResponse, index: number): Shipment {
  return {
    id: index + 1,
    createdAt: formatKoreanDateTimeWithoutYear(shipment.createdAt),
    customer: shipment.customer ?? "-",
    productionOrderNo: shipment.productionId ?? "-",
    productName: shipment.productName ?? "-",
    quantity: String(shipment.quantity ?? 1),
    lotNo: shipment.lot ?? shipment.memo ?? "-",
    productQr: shipment.productQr ?? "-",
    productProcessNo: shipment.productProcessNo ?? shipment.shipmentId,
    processName: shipment.processName ?? "-",
    shippedAt: formatKoreanDateTimeWithoutYear(shipment.shippedAt),
    memo: shipment.memo ?? "-",
    updatedAt: formatKoreanDateTimeWithoutYear(shipment.updatedAt),
  };
}
