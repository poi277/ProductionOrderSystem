"use client";

import { useEffect, useState } from "react";
import DataListTable from "../common/DataListTable";
import { formatKoreanDateTimeWithoutYear, formatKoreanDateWithoutYear } from "../common/dateFormat";
import ListToolbar from "../common/ListToolbar";
import type { DataListColumn } from "../common/DataListTable";
import type { ListOption, SortCondition } from "../common/ListToolbar";
import { useOrderSidebar } from "../ordersidebar/OrderSidebarContext";
import type { OrderProductionForm } from "../ordersidebar/OrderProductionFormCard";
import type { Order } from "../order/OrdersTypes";

type ProductionOrder = {
  id: number;
  orderNo: string;
  customer: string;
  product: string;
  lotNo: string;
  productQr: string;
  orderQuantity: string;
  instructionQuantity: string;
  purchaseQuantity: string;
  processCounts: Record<string, number>;
  processLabels: Record<string, string>;
  dueDate: string;
  createdTime: string;
};

type ProductionOrderResponse = {
  purchaseId: string | null;
  customer: string | null;
  dueDate: string | null;
  productName: string | null;
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
  | "createdTime"
  | "customer"
  | "product"
  | "instructionQuantity"
  | "lotNo"
  | "productQr";

const sortButtons: ListOption<SortKey>[] = [
  { label: "날짜", key: "createdTime" },
  { label: "고객사", key: "customer" },
  { label: "지시번호", key: "orderNo" },
  { label: "품명", key: "product" },
  { label: "수량", key: "instructionQuantity" },
  { label: "LOT NO.", key: "lotNo" },
  { label: "QR", key: "productQr" },
];

const productProcessRows = [
  { key: "PRODUCTION_INSTRUCTION_CHECK", label: "생산지시" },
  { key: "ASSEMBLY", label: "조립" },
  { key: "FUNCTION_TEST", label: "기능검사" },
  { key: "SHIPMENT_INSPECTION", label: "출하검사" },
  { key: "SHIPMENT", label: "출하완료" },
];

const productionOrderColumns: DataListColumn<ProductionOrder>[] = [
  {
    align: "center",
    header: "No.",
    key: "id",
    render: (row) => row.id,
  },
  {
    align: "center",
    header: "날짜",
    key: "createdTime",
    render: (row) => row.createdTime,
  },
  {
    align: "center",
    header: "고객사",
    key: "customer",
    render: (row) => row.customer,
  },
  {
    header: "지시번호",
    align: "center",
    key: "orderNo",
    render: (row) => row.orderNo,
  },
  {
    header: "품명",
    key: "product",
    render: (row) => row.product,
  },
  {
    align: "center",
    header: "수량",
    key: "instructionQuantity",
    render: (row) => row.instructionQuantity,
  },
  {
    align: "center",
    header: "LOT NO.",
    key: "lotNo",
    render: (row) => row.lotNo,
  },
  {
    align: "center",
    header: "QR",
    key: "productQr",
    render: (row) => row.productQr,
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
  }, []);

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
        fetch(`${orderApiBaseUrl}/productions/${encodeURIComponent(order.orderNo)}`, {
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
  if (key === "instructionQuantity") {
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
    memo: `${order.orderNo} 생산지시입니다. 생산수량 ${order.instructionQuantity}`,
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
    orderQuantity: order.instructionQuantity || "0",
    instructionQuantity: order.instructionQuantity || "0",
    purchaseQuantity: order.instructionQuantity || "0",
    processCounts: createInitialProcessCounts(Number(order.instructionQuantity || 0)),
    processLabels: createDefaultProcessLabels(),
    dueDate: formatKoreanDateWithoutYear(order.dueDate),
    createdTime: "-",
  };
}

function toProductionOrderRowFromApi(order: ProductionOrderResponse, index: number): ProductionOrder {
  const instructionQuantity = String(order.instructionQuantity ?? 0);

  return {
    id: index + 1,
    orderNo: order.purchaseId ?? "-",
    customer: order.customer ?? "-",
    product: order.productName ?? "-",
    lotNo: order.lot ?? "",
    productQr: order.productQr ?? "",
    orderQuantity: String(order.purchaseQuantity ?? instructionQuantity),
    instructionQuantity,
    purchaseQuantity: String(order.purchaseQuantity ?? 0),
    processCounts: normalizeProcessCounts(order.processCounts, Number(instructionQuantity)),
    processLabels: normalizeProcessLabels(order.processLabels),
    dueDate: formatKoreanDateWithoutYear(order.dueDate),
    createdTime: formatDateTime(order.createdTime),
  };
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
