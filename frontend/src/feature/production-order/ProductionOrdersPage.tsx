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
  orderNo: string;
  customer: string;
  product: string;
  orderQuantity: string;
  instructionQuantity: string;
  processCounts: Record<string, number>;
  dueDate: string;
  createdTime: string;
};

type ProductionOrderResponse = {
  purchaseId: string | null;
  customer: string | null;
  dueDate: string | null;
  productName: string | null;
  purchaseQuantity: number | null;
  instructionQuantity: number | null;
  productQrQuantity: number | null;
  completedQuantity: number | null;
  shippedQuantity: number | null;
  createdTime: string | null;
  processCounts: Record<string, number> | null;
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
  | "instructionQuantity"
  | "dueDate"
  | "createdTime";

const sortButtons: ListOption<SortKey>[] = [
  { label: "발주번호", key: "orderNo" },
  { label: "고객사", key: "customer" },
  { label: "제품명", key: "product" },
  { label: "수량", key: "instructionQuantity" },
  { label: "납기", key: "dueDate" },
  { label: "생성시간", key: "createdTime" },
];

const productProcessRows = [
  { key: "PRODUCTION_INSTRUCTION_CHECK", label: "생산지시" },
  { key: "ASSEMBLY", label: "조립" },
  { key: "FUNCTION_TEST", label: "기능검사" },
  { key: "SHIPMENT_INSPECTION", label: "출하검사" },
  { key: "SHIPMENT", label: "출하중" },
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
    align: "center",
    header: "고객사",
    key: "customer",
    render: (row) => row.customer,
  },
  {
    header: "제품명",
    key: "product",
    render: (row) => row.product,
  },
  {
    cellClassName: "p-0 align-middle font-bold text-slate-900",
    header: "수량",
    key: "instructionQuantity",
    render: (row) => <ProductionQuantityTable processCounts={row.processCounts} quantity={row.instructionQuantity} />,
  },
  {
    header: "납기",
    key: "dueDate",
    render: (row) => row.dueDate,
  },
  {
    align: "center",
    header: "생성시간",
    key: "createdTime",
    render: (row) => row.createdTime,
  },
];

function ProductionQuantityTable({
  processCounts,
  quantity,
}: {
  processCounts: Record<string, number>;
  quantity: string;
}) {
  return (
    <table className="w-full table-fixed border-collapse overflow-hidden rounded border border-slate-200 text-xs">
      <tbody>
        <tr className="border-b border-slate-100">
          <th className="w-2/3 bg-slate-100 px-2 py-1 text-left font-bold text-slate-700">
            총 수량
          </th>
          <td className="w-1/3 px-2 py-1 text-right font-bold text-slate-950">
            {quantity}
          </td>
        </tr>
        {productProcessRows.map((process) => (
          <tr className="border-b border-slate-100 last:border-b-0" key={process.key}>
            <th className="w-2/3 bg-slate-50 px-2 py-1 text-left font-bold text-slate-600">
              {process.label}
            </th>
            <td className="w-1/3 px-2 py-1 text-right font-bold text-slate-950">
              {processCounts[process.key] ?? 0}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

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

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white text-slate-950">
      <section className="flex min-w-0 flex-1 flex-col px-5 py-5">
        <ListToolbar
          onSearchFieldChange={setSearchField}
          onSearchTextChange={setSearchText}
          onSort={handleSort}
          onDelete={() => console.log("delete selected production orders", checkedOrderIds)}
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
    orderQuantity: order.instructionQuantity || "0",
    instructionQuantity: order.instructionQuantity || "0",
    processCounts: createInitialProcessCounts(Number(order.instructionQuantity || 0)),
    dueDate: order.dueDate ? order.dueDate.replaceAll("-", ".") : "-",
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
    orderQuantity: String(order.purchaseQuantity ?? instructionQuantity),
    instructionQuantity,
    processCounts: normalizeProcessCounts(order.processCounts, Number(instructionQuantity)),
    dueDate: order.dueDate ? order.dueDate.replaceAll("-", ".") : "-",
    createdTime: formatDateTime(order.createdTime),
  };
}

function createInitialProcessCounts(instructionQuantity: number) {
  return productProcessRows.reduce<Record<string, number>>((counts, process, index) => {
    counts[process.key] = index === 0 ? instructionQuantity : 0;
    return counts;
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

function formatDateTime(value: string | null) {
  return value ? value.replace("T", " ").replaceAll("-", ".") : "-";
}
