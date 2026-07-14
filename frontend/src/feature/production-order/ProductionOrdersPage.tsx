"use client";

import { useEffect, useState } from "react";
import DataListTable from "../common/DataListTable";
import { formatKoreanDateTimeWithoutYear, formatKoreanDateWithoutYear } from "../common/dateFormat";
import ListToolbar from "../common/ListToolbar";
import type { DataListColumn } from "../common/DataListTable";
import type { ListOption, SortCondition } from "../common/ListToolbar";
import { useOrderSidebar } from "../ordersidebar/OrderSidebarContext";
import type { OrderProductionForm } from "../ordersidebar/OrderProductionFormCard";
import type { Order, PurchaseOption } from "../order/OrdersTypes";

type ProductionOrder = {
  id: number;
  purchaseDbId?: number;
  productionDbId?: number;
  orderNo: string;
  customer: string;
  product: string;
  lotNo: string;
  productQr: string;
  qrQuantity: string;
  memo: string;
  orderQuantity: string;
  instructionQuantity: string;
  purchaseQuantity: string;
  processCounts: Record<string, number>;
  processLabels: Record<string, string>;
  dueDate: string;
  createdTime: string;
  currentProcess: string;
  purchasePrice?: number | null;
  purchaseStatus?: string | null;
  purchaseNote?: string | null;
  purchaseCreatedTime?: string | null;
  purchaseDueDate?: string | null;
};

type ProductionOrderResponse = {
  id: number;
  purchaseDbId: number | null;
  purchaseId: string | null;
  customer: string | null;
  dueDate: string | null;
  productName: string | null;
  price: number | null;
  status: string | null;
  note: string | null;
  purchaseCreatedTime: string | null;
  lot: string | null;
  productQr: string | null;
  purchaseQuantity: number | null;
  instructionQuantity: number | null;
  productQrQuantity: number | null;
  completedQuantity: number | null;
  shippedQuantity: number | null;
  createdTime: string | null;
  processCounts: Record<string, number> | null;
  processLabels: Record<string, string> | null;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const orderApiBaseUrl = process.env.NEXT_PUBLIC_ORDER_API_BASE_URL ?? "http://localhost:8080/order";

type SortKey =
  | "orderNo"
  | "customer"
  | "product"
  | "purchaseQuantity"
  | "lotNo"
  | "qrQuantity"
  | "memo";

const sortButtons: ListOption<SortKey>[] = [
  { label: "발주번호", key: "orderNo" },
  { label: "고객사", key: "customer" },
  { label: "품명", key: "product" },
  { label: "발주수량", key: "purchaseQuantity" },
  { label: "Lot No.", key: "lotNo" },
  { label: "QR갯수", key: "qrQuantity" },
  { label: "비고", key: "memo" },
];

const productProcessRows = [
  { key: "PRODUCTION_INSTRUCTION_CHECK", label: "생산지시" },
  { key: "ASSEMBLY", label: "조립" },
  { key: "FUNCTION_TEST", label: "기능검사" },
  { key: "SHIPMENT_INSPECTION", label: "출하검사" },
  { key: "SHIPMENT", label: "출하완료" },
];

const currentProcessSteps = [
  { key: "INSTRUCTION", label: "생산 지시" },
  { key: "ASSEMBLY", label: "생산중" },
  { key: "TEST", label: "기능검사" },
  { key: "FINAL_INSPECTION", label: "출하검사" },
  { key: "PACKAGING", label: "포장" },
  { key: "WAITING_FOR_SHIPMENT", label: "납품대기" },
] as const;

const productionOrderColumns: DataListColumn<ProductionOrder>[] = [
  {
    align: "center",
    header: "No.",
    key: "id",
    render: (row) => row.id,
  },
  {
    align: "center",
    header: "발주번호",
    key: "orderNo",
    render: (row) => row.orderNo,
  },
  {
    align: "center",
    header: "고객사",
    key: "customer",
    render: (row) => row.customer,
  },
  {
    header: "품명",
    key: "product",
    render: (row) => row.product,
  },
  {
    align: "center",
    header: "발주수량",
    key: "purchaseQuantity",
    render: (row) => row.purchaseQuantity,
  },
  {
    align: "center",
    header: "Lot No.",
    key: "lotNo",
    render: (row) => row.lotNo,
  },
  {
    align: "center",
    header: "QR갯수",
    key: "qrQuantity",
    render: (row) => row.qrQuantity,
  },
  {
    header: "비고",
    key: "memo",
    render: (row) => row.memo,
  },
  {
    align: "center",
    header: "현재 공정",
    key: "currentProcess",
    render: (row) => row.currentProcess,
  },
];

export default function ProductionOrdersPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loadError, setLoadError] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [checkedOrderIds, setCheckedOrderIds] = useState<number[]>([]);
  const [sortConditions, setSortConditions] = useState<SortCondition<SortKey>[]>([]);
  const [searchField, setSearchField] = useState<SortKey>("orderNo");
  const [searchText, setSearchText] = useState("");
  const {
    closeOrderSidebar,
    openOrderDetailSidebar,
    setPurchaseOptions,
  } = useOrderSidebar();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await fetch(`${orderApiBaseUrl}/productions`);

        if (!response.ok) {
          setLoadError("생산지시 목록을 불러오지 못했습니다.");
          setOrders([]);
          return;
        }

        const result = (await response.json()) as ApiResponse<ProductionOrderResponse[]>;
        setLoadError("");
        setOrders(result.data.map(toProductionOrderRowFromApi));
      } catch {
        setLoadError("생산지시 목록을 불러오지 못했습니다.");
        setOrders([]);
      }
    };

    void loadOrders();

    const loadPurchaseOptions = async () => {
      try {
        const response = await fetch(orderApiBaseUrl, { cache: "no-store" });
        const result = (await response.json()) as ApiResponse<PurchaseOption[]>;
        setPurchaseOptions(response.ok ? result.data : []);
      } catch {
        setPurchaseOptions([]);
      }
    };
    void loadPurchaseOptions();
  }, [setPurchaseOptions]);

  useEffect(() => {
    const handleCreate = (event: Event) => {
      const createdOrder = (event as CustomEvent<ProductionOrderResponse>).detail;

      setOrders((current) =>
        [toProductionOrderRowFromApi(createdOrder, 0), ...current].map((order, index) => ({ ...order, id: index + 1 })),
      );
    };

    const handleUpdate = (event: Event) => {
      const { previousProductionOrderNo, order: updatedOrder } = (
        event as CustomEvent<{ previousProductionOrderNo: string; order: OrderProductionForm }>
      ).detail;

      setOrders((current) =>
        current.map((order) =>
          order.orderNo === previousProductionOrderNo
            ? { ...toProductionOrderRow(updatedOrder, order.id - 1), id: order.id }
            : order,
        ),
      );
    };

    const handleDelete = (event: Event) => {
      const deletedProductionOrderNo = (event as CustomEvent<string>).detail;

      setOrders((current) =>
        current
          .filter((order) => order.orderNo !== deletedProductionOrderNo)
          .map((order, index) => ({ ...order, id: index + 1 })),
      );
      setSelectedOrderId(null);
      closeOrderSidebar();
    };

    window.addEventListener("production-order-created", handleCreate);
    window.addEventListener("production-order-updated", handleUpdate);
    window.addEventListener("production-order-deleted", handleDelete);

    return () => {
      window.removeEventListener("production-order-created", handleCreate);
      window.removeEventListener("production-order-updated", handleUpdate);
      window.removeEventListener("production-order-deleted", handleDelete);
    };
  }, [closeOrderSidebar]);

  const searchOptions = Array.from(
    new Set(orders.map((order) => String(getSearchValue(order, searchField)))),
  );
  const filteredOrders = orders.filter((order) =>
    String(getSearchValue(order, searchField)).toLowerCase().includes(searchText.toLowerCase()),
  );
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    for (const condition of sortConditions) {
      const aValue = getSortValue(a, condition.key);
      const bValue = getSortValue(b, condition.key);
      const compareResult =
        typeof aValue === "number" && typeof bValue === "number"
          ? aValue - bValue
          : String(aValue).localeCompare(String(bValue), "ko");

      if (compareResult !== 0) {
        return condition.direction === "asc" ? compareResult : -compareResult;
      }
    }

    return 0;
  });

  const handleSort = (key: SortKey) => {
    setSortConditions((current) => {
      const existing = current.find((condition) => condition.key === key);

      if (!existing) {
        return [...current, { key, direction: "asc" }];
      }

      if (existing.direction === "asc") {
        return current.map((condition) =>
          condition.key === key ? { ...condition, direction: "desc" } : condition,
        );
      }

      return current.filter((condition) => condition.key !== key);
    });
  };

  const handleToggleOrderCheckbox = (order: ProductionOrder) => {
    setCheckedOrderIds((current) =>
      current.includes(order.id)
        ? current.filter((orderId) => orderId !== order.id)
        : [...current, order.id],
    );
  };

  const handleSelectOrder = (order: ProductionOrder) => {
    setSelectedOrderId(order.id);
    openOrderDetailSidebar(toSidebarOrder(order));
  };

  const handleDeleteSelectedOrders = async () => {
    const selectedOrders = orders.filter((order) => checkedOrderIds.includes(order.id));

    if (selectedOrders.length === 0 || !window.confirm(`${selectedOrders.length}개를 정말로 삭제하시겠습니까?`)) {
      return;
    }

    const responses = await Promise.all(
      selectedOrders.map((order) =>
        fetch(`${orderApiBaseUrl}/productions/${order.productionDbId}`, {
          method: "DELETE",
        }),
      ),
    );

    if (responses.some((response) => !response.ok)) {
      window.alert("선택한 생산지시 삭제에 실패했습니다.");
      return;
    }

    setOrders((current) =>
      current
        .filter((order) => !checkedOrderIds.includes(order.id))
        .map((order, index) => ({ ...order, id: index + 1 })),
    );
    setCheckedOrderIds([]);
    setSelectedOrderId(null);
    closeOrderSidebar();
  };

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white text-slate-950">
      <section className="flex min-w-0 flex-1 flex-col px-5 py-5">
        <ListToolbar
          categoryKey="production"
          onSearchFieldChange={setSearchField}
          onSearchTextChange={setSearchText}
          onSort={handleSort}
          onDelete={handleDeleteSelectedOrders}
          options={sortButtons}
          searchField={searchField}
          searchOptions={searchOptions}
          searchText={searchText}
          selectedCount={checkedOrderIds.length}
          sortConditions={sortConditions}
        />

        <DataListTable
          checkedRowIds={checkedOrderIds}
          columns={productionOrderColumns}
          getRowId={(row) => row.id}
          onBlankClick={closeOrderSidebar}
          onCheckboxChange={handleToggleOrderCheckbox}
          onRowClick={handleSelectOrder}
          rows={sortedOrders}
          selectedRowId={selectedOrderId}
          emptyMessage={loadError || "리스트가 비어있습니다."}
        />
      </section>
    </main>
  );
}

function getSortValue(order: ProductionOrder, key: SortKey) {
  if (key === "purchaseQuantity" || key === "qrQuantity") {
    return Number(order[key].replaceAll(",", ""));
  }

  return order[key];
}

function getSearchValue(order: ProductionOrder, key: SortKey) {
  return order[key];
}

function toSidebarOrder(order: ProductionOrder): Order {
  return {
    id: order.id,
    purchaseDbId: order.purchaseDbId,
    productionDbId: order.productionDbId,
    purchasePrice: order.purchasePrice,
    purchaseStatus: order.purchaseStatus,
    purchaseNote: order.purchaseNote,
    purchaseCreatedTime: order.purchaseCreatedTime,
    purchaseDueDate: order.purchaseDueDate,
    productQrQuantity: Number(order.qrQuantity.replaceAll(",", "")) || 0,
    detailType: "production",
    orderNo: order.orderNo,
    orderDate: "-",
    productionOrderNo: order.orderNo,
    customer: order.customer,
    product: order.product,
    lotNo: order.lotNo,
    productQr: order.productQr,
    quantity: order.instructionQuantity,
    instructionQuantity: order.instructionQuantity,
    unitPrice: "-",
    dueDate: order.dueDate,
    status: "-",
    createdAt: order.createdTime,
    memo: order.purchaseNote ?? "-",
  };
}

function toProductionOrderRow(order: OrderProductionForm, index: number): ProductionOrder {
  return {
    id: index + 1,
    orderNo: order.orderNo,
    customer: order.customer || "-",
    product: order.product || "-",
    lotNo: "-",
    productQr: "-",
    qrQuantity: "0",
    memo: "-",
    orderQuantity: order.instructionQuantity || "0",
    instructionQuantity: order.instructionQuantity || "0",
    purchaseQuantity: order.instructionQuantity || "0",
    processCounts: createInitialProcessCounts(Number(order.instructionQuantity || 0)),
    processLabels: createDefaultProcessLabels(),
    dueDate: formatKoreanDateWithoutYear(order.dueDate),
    createdTime: "-",
    currentProcess: "생산 지시",
    purchasePrice: null,
    purchaseStatus: null,
    purchaseNote: null,
    purchaseCreatedTime: null,
    purchaseDueDate: null,
  };
}

function toProductionOrderRowFromApi(order: ProductionOrderResponse, index: number): ProductionOrder {
	const qrQuantity = order.productQrQuantity ?? 0;
	const instructionQuantity = String(qrQuantity > 0 ? qrQuantity : (order.purchaseQuantity ?? 0));

  return {
    id: index + 1,
    purchaseDbId: order.purchaseDbId ?? undefined,
    productionDbId: order.id,
    orderNo: order.purchaseId ?? "-",
    customer: order.customer ?? "-",
    product: order.productName ?? "-",
    lotNo: order.lot ?? "",
    productQr: order.productQr ?? "",
    qrQuantity: formatNumber(order.productQrQuantity),
    memo: "-",
    orderQuantity: String(order.purchaseQuantity ?? instructionQuantity),
    instructionQuantity,
    purchaseQuantity: formatNumber(order.purchaseQuantity ?? 0),
    processCounts: normalizeProcessCounts(order.processCounts, Number(instructionQuantity)),
    processLabels: normalizeProcessLabels(order.processLabels),
    dueDate: formatKoreanDateWithoutYear(order.dueDate),
    createdTime: formatDateTime(order.createdTime),
    currentProcess: getCurrentProcess(order.processCounts, order.processLabels),
    purchasePrice: order.price,
    purchaseStatus: order.status,
    purchaseNote: order.note,
    purchaseCreatedTime: order.purchaseCreatedTime,
    purchaseDueDate: order.dueDate,
  };
}

function getCurrentProcess(processCounts: Record<string, number> | null, processLabels: Record<string, string> | null) {
  const current = currentProcessSteps.find((step) => (processCounts?.[step.key] ?? 0) > 0);
  return current ? processLabels?.[current.key] ?? current.label : "-";
}

function createInitialProcessCounts(instructionQuantity: number) {
  return productProcessRows.reduce<Record<string, number>>((counts, process, index) => {
    counts[process.key] = index === 0 ? instructionQuantity : 0;
    return counts;
  }, {});
}

function createDefaultProcessLabels() {
  return productProcessRows.reduce<Record<string, string>>((labels, process) => {
    labels[process.key] = process.label;
    return labels;
  }, {});
}

function normalizeProcessCounts(processCounts: Record<string, number> | null, instructionQuantity: number) {
  if (!processCounts) {
    return createInitialProcessCounts(instructionQuantity);
  }

  return productProcessRows.reduce<Record<string, number>>((counts, process) => {
    counts[process.key] = processCounts?.[process.key] ?? 0;
    return counts;
  }, {});
}

function normalizeProcessLabels(processLabels: Record<string, string> | null) {
  return productProcessRows.reduce<Record<string, string>>((labels, process) => {
    labels[process.key] = processLabels?.[process.key] ?? process.label;
    return labels;
  }, {});
}

function formatDateTime(value: string | null) {
  return formatKoreanDateTimeWithoutYear(value);
}

function formatNumber(value: number | null) {
  return value == null ? "-" : value.toLocaleString("ko-KR");
}
