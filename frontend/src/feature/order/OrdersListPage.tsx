"use client";

import { useState } from "react";
import DataListTable from "../common/DataListTable";
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
  | "unitPrice"
  | "dueDate"
  | "status"
  | "memo";

const sortButtons: ListOption<SortKey>[] = [
  { label: "발주번호", key: "orderNo" },
  { label: "발주일자", key: "orderDate" },
  { label: "고객사", key: "customer" },
  { label: "품명", key: "product" },
  { label: "발주수량", key: "quantity" },
  { label: "단가", key: "unitPrice" },
  { label: "납기", key: "dueDate" },
  { label: "상태", key: "status" },
];

const orderColumns: DataListColumn<Order>[] = [
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
    header: "발주일자",
    align: "center",
    key: "orderDate",
    render: (row) => row.orderDate,
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
    header: "발주수량",
    key: "quantity",
    render: (row) => row.quantity,
  },
  {
    header: "단가",
    key: "unitPrice",
    render: (row) => row.unitPrice,
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
  {
    header: "비고",
    key: "memo",
    render: (row) => row.memo,
  },
];

const baseOrderRows: Order[] = [
  {
    id: 1,
    orderNo: "PO-20260706-001",
    orderDate: "2026.07.06",
    customer: "테스트엔테크",
    product: "Leak Sensor Point-4C",
    quantity: "74",
    unitPrice: "143,500",
    dueDate: "2026.07.10",
    status: "지시대기",
    memo: "제품 QR 생성 전 발주서 검토가 필요합니다.",
  },
  {
    id: 2,
    orderNo: "PO-20260706-002",
    orderDate: "2026.07.06",
    customer: "LSE",
    product: "ECS200A-ORGANIC-000A",
    quantity: "4",
    unitPrice: "98,700",
    dueDate: "2026.07.10",
    status: "지시대기",
    memo: "고객사 납기 일정 확인 후 생산지시를 생성합니다.",
  },
  {
    id: 3,
    orderNo: "PO-20260705-003",
    orderDate: "2026.07.05",
    customer: "에스티아이",
    product: "DU-LK322-S3 커넥터 타입",
    quantity: "7",
    unitPrice: "30,000",
    dueDate: "2026.07.10",
    status: "생산중",
    memo: "일부 수량은 공정 진행 중입니다.",
  },
  {
    id: 4,
    orderNo: "PO-20260703-004",
    orderDate: "2026.07.03",
    customer: "TEMCCNS",
    product: "DU-LK322-NPN-10-S1",
    quantity: "74",
    unitPrice: "143,500",
    dueDate: "2026.06.30",
    status: "마감",
    memo: "출하 완료된 발주서입니다.",
  },
  {
    id: 5,
    orderNo: "PO-20260702-005",
    orderDate: "2026.07.02",
    customer: "테스트엔테크",
    product: "Leak Sensor Support",
    quantity: "15",
    unitPrice: "30,000",
    dueDate: "2026.06.30",
    status: "출하완료",
    memo: "납품출하 완료 후 이력 조회가 가능합니다.",
  },
];

const orderRows: Order[] = Array.from({ length: 21 }, (_, index) => {
  const base = baseOrderRows[index % baseOrderRows.length];
  const sequence = String(index + 1).padStart(3, "0");
  const day = String(6 - (index % 6)).padStart(2, "0");

  return {
    ...base,
    id: index + 1,
    orderNo: `PO-202607${day}-${sequence}`,
  };
});

export default function OrdersListPage() {
  const [checkedOrderIds, setCheckedOrderIds] = useState<number[]>([]);
  const [sortConditions, setSortConditions] = useState<SortCondition<SortKey>[]>([]);
  const [searchField, setSearchField] = useState<SortKey>("orderNo");
  const [searchText, setSearchText] = useState("");
  const {
    clearOrderSidebarSelection,
    closeOrderSidebar,
    openOrderDetailSidebar,
    rightPanelMode,
    selectedOrder,
  } = useOrderSidebar();

  const searchOptions = Array.from(
    new Set(orderRows.map((order) => String(getSearchValue(order, searchField)))),
  );
  const filteredOrders = orderRows.filter((order) =>
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
    if (selectedOrder?.id === order.id && rightPanelMode === "detail") {
      clearOrderSidebarSelection();
      return;
    }

    openOrderDetailSidebar(order);
  };

  const handleToggleOrderCheckbox = (order: Order) => {
    setCheckedOrderIds((current) =>
      current.includes(order.id)
        ? current.filter((orderId) => orderId !== order.id)
        : [...current, order.id],
    );
  };

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white text-slate-950">
      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 flex-1 flex-col px-5 py-5">
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
            columns={orderColumns}
            getRowId={(row) => row.id}
            onBlankClick={closeOrderSidebar}
            onCheckboxChange={handleToggleOrderCheckbox}
            onRowClick={handleSelectOrder}
            rows={sortedOrders}
            selectedRowId={rightPanelMode === "detail" ? selectedOrder?.id : null}
          />
        </div>
      </section>
    </main>
  );
}

function getSortValue(order: Order, key: SortKey) {
  if (key === "quantity" || key === "unitPrice") {
    return Number(order[key].replaceAll(",", ""));
  }

  return order[key];
}

function getSearchValue(order: Order, key: SortKey) {
  return order[key];
}
