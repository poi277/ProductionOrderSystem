"use client";

import { useEffect, useState } from "react";
import DataListTable from "../common/DataListTable";
import ListToolbar from "../common/ListToolbar";
import type { DataListColumn } from "../common/DataListTable";
import type { ListOption, SortCondition } from "../common/ListToolbar";
import { useOrderSidebar } from "../ordersidebar/OrderSidebarContext";
import type { OrderProductionForm } from "../ordersidebar/OrderProductionFormCard";
import type { Order } from "../order/OrdersTypes";

type ProductionOrder = {
  id: number;
  productionOrderNo: string;
  orderNo: string;
  customer: string;
  product: string;
  orderQuantity: string;
  instructionQuantity: string;
  completedQuantity: string;
  shippedQuantity: string;
  dueDate: string;
  status: string;
};

type ProductionOrderResponse = {
  productionId: string;
  purchaseId: string | null;
  productName: string | null;
  purchaseQuantity: number | null;
  instructionQuantity: number | null;
  productQrQuantity: number | null;
  completedQuantity: number | null;
  shippedQuantity: number | null;
  status: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const orderApiBaseUrl = process.env.NEXT_PUBLIC_ORDER_API_BASE_URL ?? "http://localhost:8080/order";

type SortKey =
  | "productionOrderNo"
  | "orderNo"
  | "customer"
  | "product"
  | "instructionQuantity"
  | "completedQuantity"
  | "shippedQuantity"
  | "dueDate"
  | "status";

const sortButtons: ListOption<SortKey>[] = [
  { label: "생산지시번호", key: "productionOrderNo" },
  { label: "발주번호", key: "orderNo" },
  { label: "고객사", key: "customer" },
  { label: "품명", key: "product" },
  { label: "지시수량", key: "instructionQuantity" },
  { label: "완료수량", key: "completedQuantity" },
  { label: "출하수량", key: "shippedQuantity" },
  { label: "납기", key: "dueDate" },
  { label: "상태", key: "status" },
];

const productionOrderColumns: DataListColumn<ProductionOrder>[] = [
  {
    align: "center",
    header: "No.",
    key: "id",
    render: (row) => row.id,
  },
  {
    header: "발주번호",
    align: "center",
    key: "orderNo",
    render: (row) => row.orderNo,
  },
  {
    header: "생산지시번호",
    align: "center",
    key: "productionOrderNo",
    render: (row) => row.productionOrderNo,
  },
  {
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
    header: "지시수량",
    key: "instructionQuantity",
    render: (row) => row.instructionQuantity,
  },
  {
    header: "완료수량",
    key: "completedQuantity",
    render: (row) => row.completedQuantity,
  },
  {
    header: "출하수량",
    key: "shippedQuantity",
    render: (row) => row.shippedQuantity,
  },
  {
    header: "납기",
    key: "dueDate",
    render: (row) => row.dueDate,
  },
  {
    header: "상태",
    key: "status",
    render: (row) => (
      <span className="rounded-full bg-[#eef4ff] px-3 py-1 font-bold text-slate-900">
        {row.status}
      </span>
    ),
  },
];

export default function ProductionOrdersPage() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loadError, setLoadError] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [checkedOrderIds, setCheckedOrderIds] = useState<number[]>([]);
  const [sortConditions, setSortConditions] = useState<SortCondition<SortKey>[]>([]);
  const [searchField, setSearchField] = useState<SortKey>("productionOrderNo");
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
          order.productionOrderNo === previousProductionOrderNo
            ? { ...toProductionOrderRow(updatedOrder, order.id - 1), id: order.id }
            : order,
        ),
      );
    };

    const handleDelete = (event: Event) => {
      const deletedProductionOrderNo = (event as CustomEvent<string>).detail;

      setOrders((current) =>
        current
          .filter((order) => order.productionOrderNo !== deletedProductionOrderNo)
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
  if (["instructionQuantity", "completedQuantity", "shippedQuantity"].includes(key)) {
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
    productionOrderNo: order.productionOrderNo,
    customer: order.customer,
    product: order.product,
    quantity: order.instructionQuantity,
    instructionQuantity: order.instructionQuantity,
    completedQuantity: order.completedQuantity,
    shippedQuantity: order.shippedQuantity,
    unitPrice: "-",
    dueDate: order.dueDate,
    status: order.status,
    memo: `${order.productionOrderNo} 생산지시입니다. 완료수량 ${order.completedQuantity}, 출하수량 ${order.shippedQuantity}`,
  };
}

function toProductionOrderRow(order: OrderProductionForm, index: number): ProductionOrder {
  return {
    id: index + 1,
    productionOrderNo: order.productionOrderNo,
    orderNo: order.orderNo,
    customer: order.customer || "-",
    product: order.product || "-",
    orderQuantity: order.instructionQuantity || "0",
    instructionQuantity: order.instructionQuantity || "0",
    completedQuantity: order.completedQuantity || "0",
    shippedQuantity: order.shippedQuantity || "0",
    dueDate: order.dueDate ? order.dueDate.replaceAll("-", ".") : "-",
    status: order.status,
  };
}

function toProductionOrderRowFromApi(order: ProductionOrderResponse, index: number): ProductionOrder {
  const instructionQuantity = String(order.instructionQuantity ?? 0);

  return {
    id: index + 1,
    productionOrderNo: order.productionId,
    orderNo: order.purchaseId ?? "-",
    customer: "-",
    product: order.productName ?? "-",
    orderQuantity: String(order.purchaseQuantity ?? instructionQuantity),
    instructionQuantity,
    completedQuantity: String(order.completedQuantity ?? 0),
    shippedQuantity: String(order.shippedQuantity ?? 0),
    dueDate: "-",
    status: toProductionStatusLabel(order.status),
  };
}

function toProductionStatusLabel(status: string | null) {
  switch (status) {
    case "WAITING":
      return "지시대기";
    case "IN_PROGRESS":
      return "생산중";
    case "COMPLETED":
      return "완료";
    case "SHIPPED":
      return "출하완료";
    case "CANCELED":
      return "취소";
    default:
      return status ?? "-";
  }
}
