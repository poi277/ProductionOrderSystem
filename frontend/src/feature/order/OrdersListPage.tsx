"use client";

import { useEffect, useState } from "react";
import DataListTable from "../common/DataListTable";
import { formatKoreanDateTimeWithoutYear, formatKoreanDateWithoutYear } from "../common/dateFormat";
import ListToolbar from "../common/ListToolbar";
import type { DataListColumn } from "../common/DataListTable";
import type { ListOption, SortCondition } from "../common/ListToolbar";
import { useOrderSidebar } from "../ordersidebar/OrderSidebarContext";
import type { Order } from "./OrdersTypes";

type SortKey =
  | "orderNo"
  | "orderDate"
  | "customer"
  | "product"
  | "quantity"
  | "totalAmount"
  | "dueDate";

type OrderPurchaseResponse = {
  purchaseId: string;
  customer: string | null;
  productName: string | null;
  quantity: number | null;
  price: number | null;
  purchaseDate: string | null;
  dueDate: string | null;
  status: string | null;
  note: string | null;
  createdTime: string | null;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type UpdatedOrderEvent = {
  previousOrderNo: string;
  order: OrderPurchaseResponse;
};

const orderListApiUrl = process.env.NEXT_PUBLIC_ORDER_LIST_API_URL ?? "http://localhost:8080/order";

const text = {
  customer: "\uace0\uac1d\uc0ac",
  createdAt: "\uc0dd\uc131\uc2dc\uac04",
  dueDate: "\ub0a9\uae30\uc77c",
  empty: "\ub4f1\ub85d\ub41c\u0020\ubc1c\uc8fc\uc11c\uac00\u0020\uc5c6\uc2b5\ub2c8\ub2e4\u002e",
  loadError: "\ubc1c\uc8fc\uc11c\u0020\ubaa9\ub85d\uc744\u0020\uc870\ud68c\ud558\uc9c0\u0020\ubabb\ud588\uc2b5\ub2c8\ub2e4\u002e",
  loading: "\ubc1c\uc8fc\uc11c\u0020\ubaa9\ub85d\uc744\u0020\ubd88\ub7ec\uc624\ub294\u0020\uc911\uc785\ub2c8\ub2e4\u002e",
  memo: "\ube44\uace0",
  orderDate: "\ubc1c\uc8fc\uc77c",
  orderNo: "\ubc1c\uc8fc\ubc88\ud638",
  product: "\ud488\uba85",
  orderAmount: "\ubc1c\uc8fc\uae08\uc561",
  quantity: "\uc218\ub7c9",
  status: "\uc0c1\ud0dc",
  totalAmount: "\ucd1d\uae08\uc561",
  unitPrice: "\uae08\uc561",
  unknownLoadError:
    "\ubc1c\uc8fc\uc11c\u0020\ubaa9\ub85d\u0020\uc870\ud68c\u0020\uc911\u0020\uc624\ub958\uac00\u0020\ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4\u002e",
};

const sortButtons: ListOption<SortKey>[] = [
  { label: text.orderDate, key: "orderDate" },
  { label: text.customer, key: "customer" },
  { label: text.orderNo, key: "orderNo" },
  { label: text.product, key: "product" },
  { label: text.quantity, key: "quantity" },
  { label: text.orderAmount, key: "totalAmount" },
  { label: text.dueDate, key: "dueDate" },
];

const orderColumns: DataListColumn<Order>[] = [
  { align: "center", header: "No.", key: "id", render: (row) => row.id },
  { align: "center", header: text.orderDate, key: "orderDate", render: (row) => row.orderDate },
  { align: "center", header: text.customer, key: "customer", render: (row) => row.customer },
  { align: "center", header: text.orderNo, key: "orderNo", render: (row) => row.orderNo },
  { header: text.product, key: "product", render: (row) => row.product },
  { align: "center", header: text.quantity, key: "quantity", render: (row) => row.quantity },
  { align: "center", header: text.orderAmount, key: "totalAmount", render: (row) => row.totalAmount ?? "-" },
  { align: "center", header: text.dueDate, key: "dueDate", render: (row) => row.dueDate },
];

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [checkedOrderIds, setCheckedOrderIds] = useState<number[]>([]);
  const [sortConditions, setSortConditions] = useState<SortCondition<SortKey>[]>([]);
  const [searchField, setSearchField] = useState<SortKey>("orderNo");
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const {
    clearOrderSidebarSelection,
    closeOrderSidebar,
    openOrderDetailSidebar,
    rightPanelMode,
    selectedOrder,
  } = useOrderSidebar();

  useEffect(() => {
    let ignore = false;

    const loadOrders = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await fetch(orderListApiUrl, { cache: "no-store" });

        if (!response.ok) {
          throw new Error(text.loadError);
        }

        const result = (await response.json()) as ApiResponse<OrderPurchaseResponse[]>;

        if (!ignore) {
          setOrders(result.data.map(toOrderRow));
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error instanceof Error ? error.message : text.unknownLoadError);
          setOrders([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const handleCreated = (event: Event) => {
      const createdOrder = (event as CustomEvent<OrderPurchaseResponse>).detail;

      setOrders((current) =>
        [toOrderRow(createdOrder, 0), ...current].map((order, index) => ({ ...order, id: index + 1 })),
      );
    };

    const handleUpdated = (event: Event) => {
      const { previousOrderNo, order: updatedOrder } = (event as CustomEvent<UpdatedOrderEvent>).detail;

      setOrders((current) =>
        current
          .map((order) =>
            order.orderNo === previousOrderNo ? { ...toOrderRow(updatedOrder, order.id - 1), id: order.id } : order,
          )
          .map((order, index) => ({ ...order, id: index + 1 })),
      );
    };

    const handleDeleted = (event: Event) => {
      const deletedOrderNo = (event as CustomEvent<string>).detail;

      setOrders((current) =>
        current
          .filter((order) => order.orderNo !== deletedOrderNo)
          .map((order, index) => ({ ...order, id: index + 1 })),
      );
      clearOrderSidebarSelection();
    };

    window.addEventListener("order-purchase-created", handleCreated);
    window.addEventListener("order-purchase-updated", handleUpdated);
    window.addEventListener("order-purchase-deleted", handleDeleted);

    return () => {
      window.removeEventListener("order-purchase-created", handleCreated);
      window.removeEventListener("order-purchase-updated", handleUpdated);
      window.removeEventListener("order-purchase-deleted", handleDeleted);
    };
  }, [clearOrderSidebarSelection]);

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

  const handleSelectOrder = (order: Order) => {
    openOrderDetailSidebar(order);
  };

  const handleToggleOrderCheckbox = (order: Order) => {
    setCheckedOrderIds((current) =>
      current.includes(order.id)
        ? current.filter((orderId) => orderId !== order.id)
        : [...current, order.id],
    );
  };

  const handleDeleteSelectedOrders = async () => {
    const selectedOrders = orders.filter((order) => checkedOrderIds.includes(order.id));

    if (selectedOrders.length === 0 || !window.confirm(`${selectedOrders.length}개를 정말로 삭제하시겠습니까?`)) {
      return;
    }

    const responses = await Promise.all(
      selectedOrders.map((order) =>
        fetch(`${orderListApiUrl}/${encodeURIComponent(order.orderNo)}`, {
          method: "DELETE",
        }),
      ),
    );

    if (responses.some((response) => !response.ok)) {
      window.alert("선택한 발주서 삭제에 실패했습니다.");
      return;
    }

    setOrders((current) =>
      current
        .filter((order) => !checkedOrderIds.includes(order.id))
        .map((order, index) => ({ ...order, id: index + 1 })),
    );
    setCheckedOrderIds([]);
    clearOrderSidebarSelection();
  };

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white text-slate-950">
      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 flex-1 flex-col px-5 py-5">
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
            columns={orderColumns}
            emptyMessage={isLoading ? text.loading : errorMessage || text.empty}
            getRowId={(row) => row.id}
            onBlankClick={closeOrderSidebar}
            onCheckboxChange={handleToggleOrderCheckbox}
            onRowClick={handleSelectOrder}
            rows={isLoading || errorMessage ? [] : sortedOrders}
            selectedRowId={rightPanelMode === "detail" ? selectedOrder?.id : null}
          />
        </div>
      </section>
    </main>
  );
}

function toOrderRow(order: OrderPurchaseResponse, index: number): Order {
  return {
    id: index + 1,
    orderNo: order.purchaseId,
    orderDate: formatDate(order.purchaseDate),
    customer: order.customer ?? "-",
    product: order.productName ?? "-",
    quantity: formatNumber(order.quantity),
    unitPrice: formatNumber(order.price),
    totalAmount: formatNumber(calculateTotalAmount(order.quantity, order.price)),
    dueDate: formatDate(order.dueDate),
    status: formatStatus(order.status),
    memo: order.note ?? "-",
    createdAt: formatDateTime(order.createdTime),
  };
}

function formatDate(value: string | null) {
  return formatKoreanDateWithoutYear(value);
}

function formatDateTime(value: string | null) {
  return formatKoreanDateTimeWithoutYear(value);
}

function calculateTotalAmount(quantity: number | null, unitPrice: number | null) {
  if (quantity == null || unitPrice == null) {
    return null;
  }

  return quantity * unitPrice;
}

function formatNumber(value: number | null) {
  return value == null ? "-" : value.toLocaleString("ko-KR");
}

function formatStatus(value: string | null) {
  switch (value) {
    case "WAITING":
      return "\uc9c0\uc2dc\ub300\uae30";
    case "IN_PROGRESS":
    case "PRODUCING":
      return "\uc0dd\uc0b0\uc911";
    case "COMPLETED":
      return "\uc644\ub8cc";
    case "SHIPPED":
      return "\ucd9c\ud558\uc644\ub8cc";
    case "CANCELED":
      return "\ucde8\uc18c";
    default:
      return value ?? "-";
  }
}

function getSortValue(order: Order, key: SortKey) {
  if (key === "totalAmount") {
    return Number((order.totalAmount ?? "0").replaceAll(",", ""));
  }

  if (key === "quantity") {
    return Number(order.quantity.replaceAll(",", ""));
  }

  return order[key];
}

function getSearchValue(order: Order, key: SortKey) {
  return order[key];
}
