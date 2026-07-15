"use client";

import { useEffect, useState } from "react";
import DataListTable from "../common/DataListTable";
import { formatKoreanDateTimeWithoutYear, formatKoreanDateWithoutYear } from "../common/dateFormat";
import ListToolbar from "../common/ListToolbar";
import type { DataListColumn } from "../common/DataListTable";
import type { ListOption, SortCondition } from "../common/ListToolbar";
import { compareNumberOrText, matchesSearch, sortByConditions, updateSortConditions } from "../common/listDataUtils";
import { useRowSelection } from "../common/useRowSelection";
import { useOrderSidebar } from "../ordersidebar/OrderSidebarContext";
import type { Order } from "./OrdersTypes";
import { orderEndpoints } from "../../../lib/endpoints";
import { apiClient, getApiErrorMessage } from "../../../util/apiClient";
import { useApiMutationRevision } from "../../../util/apiMutationStore";

type SortKey =
  | "orderNo"
  | "customer"
  | "product"
  | "quantity"
  | "dueDate"
  | "memo";

type OrderPurchaseResponse = {
  id: number;
  purchaseId: string;
  customer: string | null;
  productName: string | null;
  quantity: number | null;
  price: number | null;
  dueDate: string | null;
  status: string | null;
  statusLabel: string | null;
  note: string | null;
  createdTime: string | null;
  productionDbId: number | null;
  lot: string | null;
  productQrQuantity: number | null;
  productQr: string | null;
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

const text = {
  customer: "\uace0\uac1d\uc0ac",
  createdAt: "\uc0dd\uc131\uc2dc\uac04",
  currentProcess: "\ud604\uc7ac\uacf5\uc815",
  dueDate: "\ub0a9\uae30\uc77c",
  empty: "\ub4f1\ub85d\ub41c\u0020\ubc1c\uc8fc\uc11c\uac00\u0020\uc5c6\uc2b5\ub2c8\ub2e4\u002e",
  loadError: "\ubc1c\uc8fc\uc11c\u0020\ubaa9\ub85d\uc744\u0020\uc870\ud68c\ud558\uc9c0\u0020\ubabb\ud588\uc2b5\ub2c8\ub2e4\u002e",
  loading: "\ubc1c\uc8fc\uc11c\u0020\ubaa9\ub85d\uc744\u0020\ubd88\ub7ec\uc624\ub294\u0020\uc911\uc785\ub2c8\ub2e4\u002e",
  memo: "\ube44\uace0",
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
  { label: text.orderNo, key: "orderNo" },
  { label: text.customer, key: "customer" },
  { label: text.product, key: "product" },
  { label: text.quantity, key: "quantity" },
  { label: text.dueDate, key: "dueDate" },
  { label: text.memo, key: "memo" },
];

const orderColumns: DataListColumn<Order>[] = [
  { align: "center", header: "No.", key: "id", render: (row) => row.id },
  { align: "center", header: text.orderNo, key: "orderNo", render: (row) => row.orderNo },
  { align: "center", header: text.customer, key: "customer", render: (row) => row.customer },
  { header: text.product, key: "product", render: (row) => row.product },
  { align: "center", header: "\ubc1c\uc8fc\uc218\ub7c9", key: "quantity", render: (row) => row.quantity },
  { align: "center", header: text.dueDate, key: "dueDate", render: (row) => row.dueDate },
  { header: text.memo, key: "memo", render: (row) => row.memo },
  { align: "center", header: text.currentProcess, key: "status", render: (row) => row.status },
];

export default function OrdersListPage() {
  const mutationRevision = useApiMutationRevision();
  const [orders, setOrders] = useState<Order[]>([]);
  const { selectedIds: checkedOrderIds, setSelectedIds: setCheckedOrderIds, toggleOne: toggleOrderCheckbox } = useRowSelection<number>();
  const [sortConditions, setSortConditions] = useState<SortCondition<SortKey>[]>([]);
  const [searchField, setSearchField] = useState<SortKey>("orderNo");
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const {
    clearOrderSidebarSelection,
    closeOrderSidebar,
    openOrderDetailSidebar,
    selectedOrder,
  } = useOrderSidebar();

  useEffect(() => {
    let ignore = false;

    const loadOrders = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await apiClient(orderEndpoints.root, { cache: "no-store" });

        if (!response.ok) {
          throw new Error(await getApiErrorMessage(response, text.loadError));
        }

        const result = (await response.json()) as ApiResponse<OrderPurchaseResponse[]>;

        if (!ignore) {
          setOrders(result.data.map(toOrderRow));
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error instanceof Error ? error.message : text.unknownLoadError);
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
  }, [mutationRevision]);

  useEffect(() => {
    const handleCreated = (event: Event) => {
      const createdOrder = (event as CustomEvent<OrderPurchaseResponse>).detail;
      if (!createdOrder?.purchaseId) return;

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
    matchesSearch(getSearchValue(order, searchField), searchText),
  );

  const sortedOrders = sortByConditions(filteredOrders, sortConditions, getSortValue, compareNumberOrText);

  const handleSort = (key: SortKey) => {
    setSortConditions((current) => updateSortConditions(current, key));
  };

  const handleSelectOrder = (order: Order) => {
    openOrderDetailSidebar(order);
  };

  const handleToggleOrderCheckbox = (order: Order) => {
    toggleOrderCheckbox(order.id);
  };

  const handleDeleteSelectedOrders = async () => {
    const selectedOrders = orders.filter((order) => checkedOrderIds.includes(order.id));

    if (selectedOrders.length === 0 || !window.confirm(`${selectedOrders.length}개를 정말로 삭제하시겠습니까?`)) {
      return;
    }

    const responses = await Promise.all(
      selectedOrders.map((order) =>
        apiClient(orderEndpoints.detail(order.purchaseDbId ?? ""), {
          method: "DELETE",
        }),
      ),
    );

    const failedResponse = responses.find((response) => !response.ok);
    if (failedResponse) {
      window.alert(await getApiErrorMessage(failedResponse, "선택한 발주서 삭제에 실패했습니다."));
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
            categoryKey="order"
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
            categoryKey="order"
            onColumnSort={(key) => handleSort(key as SortKey)}
            sortableColumnKeys={sortButtons.map((option) => option.key)}
            sortConditions={sortConditions}
            checkedRowIds={checkedOrderIds}
            columns={orderColumns}
            emptyMessage={isLoading && orders.length === 0 ? text.loading : errorMessage || text.empty}
            getRowId={(row) => row.id}
            onBlankClick={closeOrderSidebar}
            onCheckboxChange={handleToggleOrderCheckbox}
            onRowClick={handleSelectOrder}
            rows={sortedOrders}
            selectedRowId={selectedOrder?.id ?? null}
          />
        </div>
      </section>
    </main>
  );
}

function toOrderRow(order: OrderPurchaseResponse, index: number): Order {
  return {
    id: index + 1,
    purchaseDbId: order.id,
    productionDbId: order.productionDbId ?? undefined,
    purchasePrice: order.price,
    purchaseStatus: order.status,
    purchaseNote: order.note,
    purchaseCreatedTime: order.createdTime,
    purchaseDueDate: order.dueDate,
    productQrQuantity: order.productQrQuantity,
    orderNo: order.purchaseId,
    orderDate: "-",
    customer: order.customer ?? "-",
    product: order.productName ?? "-",
    quantity: formatNumber(order.quantity),
    unitPrice: formatNumber(order.price),
    totalAmount: formatNumber(calculateTotalAmount(order.quantity, order.price)),
    dueDate: formatDate(order.dueDate),
    status: order.statusLabel ?? order.status ?? "-",
    memo: order.note ?? "-",
    createdAt: formatDateTime(order.createdTime),
    productQr: order.productQr ?? undefined,
    lotNo: order.lot ?? undefined,
    instructionQuantity: order.productQrQuantity == null ? undefined : String(order.productQrQuantity),
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

function getSortValue(order: Order, key: SortKey) {
  if (key === "quantity") {
    return Number(order.quantity.replaceAll(",", ""));
  }

  return order[key];
}

function getSearchValue(order: Order, key: SortKey) {
  return order[key];
}
