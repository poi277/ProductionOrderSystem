"use client";

import { useEffect, useState } from "react";
import DataListTable from "../common/DataListTable";
import ListToolbar from "../common/ListToolbar";
import { useOrderSidebar } from "../ordersidebar/OrderSidebarContext";
import type { OrderShipmentForm } from "../ordersidebar/OrderShipmentFormCard";
import type { DataListColumn } from "../common/DataListTable";
import type { ListOption, SortCondition } from "../common/ListToolbar";
import type { Order } from "../order/OrdersTypes";

type Shipment = {
  id: number;
  productionOrderNo: string;
  productProcessNo: string;
  productQr: string;
  processName: string;
  isCompleted: string;
  shippedAt: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
};

type ShipmentResponse = {
  shipmentId: string;
  productQr: string | null;
  productionId: string | null;
  productProcessNo: string | null;
  processName: string | null;
  completed: boolean | null;
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
  { label: "생산지시번호", key: "productionOrderNo" },
  { label: "제품공정번호", key: "productProcessNo" },
  { label: "제품 QR", key: "productQr" },
  { label: "출하기준 공정", key: "processName" },
  { label: "출하완료", key: "isCompleted" },
  { label: "출하일자", key: "shippedAt" },
  { label: "출하시 비고", key: "memo" },
  { label: "등록일시", key: "createdAt" },
  { label: "수정일시", key: "updatedAt" },
];

const shipmentColumns: DataListColumn<Shipment>[] = [
  { align: "center", header: "No.", key: "id", render: (row) => row.id },
  { align: "center", header: "생산지시번호", key: "productionOrderNo", render: (row) => row.productionOrderNo },
  { align: "center", header: "제품공정번호", key: "productProcessNo", render: (row) => row.productProcessNo },
  { align: "center", header: "제품 QR", key: "productQr", render: (row) => row.productQr },
  { header: "출하 기준 공정", key: "processName", render: (row) => row.processName },
  {
    header: "출하완료",
    key: "isCompleted",
    render: (row) => (
      <span className="rounded-full bg-[#eef4ff] px-3 py-1 font-bold text-slate-900">
        {row.isCompleted}
      </span>
    ),
  },
  { align: "center", header: "출하일자", key: "shippedAt", render: (row) => row.shippedAt },
  { header: "출하시 비고", key: "memo", render: (row) => row.memo },
  { align: "center", header: "등록일시", key: "createdAt", render: (row) => row.createdAt },
  { align: "center", header: "수정일시", key: "updatedAt", render: (row) => row.updatedAt },
];

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
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
    const loadShipments = async () => {
      try {
        const response = await fetch(`${orderApiBaseUrl}/shipments`);

        if (!response.ok) {
          setLoadError("납품출하 목록을 불러오지 못했습니다.");
          setShipments([]);
          return;
        }

        const result = (await response.json()) as ApiResponse<ShipmentResponse[]>;
        setLoadError("");
        setShipments(result.data.map(toShipmentRowFromApi));
      } catch {
        setLoadError("납품출하 목록을 불러오지 못했습니다.");
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

  const handleSort = (key: SortKey) => {
    setSortConditions((current) => updateSortConditions(current, key));
  };

  const handleToggleCheckbox = (row: Shipment) => {
    setCheckedRowIds((current) =>
      current.includes(row.id) ? current.filter((rowId) => rowId !== row.id) : [...current, row.id],
    );
  };

  const handleSelectRow = (row: Shipment) => {
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
          columns={shipmentColumns}
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
    processName: row.processName,
    shippedAt: row.shippedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    customer: "-",
    product: row.productQr,
    quantity: "-",
    unitPrice: "-",
    dueDate: row.shippedAt,
    status: row.isCompleted,
    memo: row.memo,
  };
}

function toShipmentRow(shipment: OrderShipmentForm, index: number): Shipment {
  return {
    id: index + 1,
    productionOrderNo: shipment.productionOrderNo,
    productProcessNo: shipment.productProcessNo,
    productQr: shipment.productQr,
    processName: shipment.processName,
    isCompleted: shipment.isCompleted,
    shippedAt: toDisplayDateTime(shipment.shippedAt),
    memo: shipment.memo || "-",
    createdAt: toDisplayDateTime(shipment.createdAt),
    updatedAt: toDisplayDateTime(shipment.updatedAt),
  };
}

function toShipmentRowFromApi(shipment: ShipmentResponse, index: number): Shipment {
  return {
    id: index + 1,
    productionOrderNo: shipment.productionId ?? "-",
    productProcessNo: shipment.productProcessNo ?? shipment.shipmentId,
    productQr: shipment.productQr ?? "-",
    processName: shipment.processName ?? "-",
    isCompleted: shipment.completed ? "완료" : "대기",
    shippedAt: toDisplayDateTime(shipment.shippedAt ?? ""),
    memo: shipment.memo ?? "-",
    createdAt: toDisplayDateTime(shipment.createdAt ?? ""),
    updatedAt: toDisplayDateTime(shipment.updatedAt ?? ""),
  };
}

function toDisplayDateTime(value: string) {
  if (!value) {
    return "-";
  }

  return value.replace("T", " ").replaceAll("-", ".");
}
