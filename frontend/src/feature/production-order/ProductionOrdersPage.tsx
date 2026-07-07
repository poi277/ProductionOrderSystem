"use client";

import { useState } from "react";
import DataListTable from "../common/DataListTable";
import ListToolbar from "../common/ListToolbar";
import type { DataListColumn } from "../common/DataListTable";
import type { ListOption, SortCondition } from "../common/ListToolbar";
import { useOrderSidebar } from "../ordersidebar/OrderSidebarContext";
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

const productionOrderRows: ProductionOrder[] = [
  {
    id: 1,
    productionOrderNo: "PRD-20260706-001",
    orderNo: "PO-20260706-001",
    customer: "테스트엔테크",
    product: "Leak Sensor Point-4C",
    orderQuantity: "74",
    instructionQuantity: "74",
    completedQuantity: "0",
    shippedQuantity: "0",
    dueDate: "2026.07.10",
    status: "지시대기",
  },
  {
    id: 2,
    productionOrderNo: "PRD-20260706-002",
    orderNo: "PO-20260706-002",
    customer: "LSE",
    product: "ECS200A-ORGANIC-000A",
    orderQuantity: "4",
    instructionQuantity: "4",
    completedQuantity: "1",
    shippedQuantity: "0",
    dueDate: "2026.07.10",
    status: "생산중",
  },
  {
    id: 3,
    productionOrderNo: "PRD-20260705-003",
    orderNo: "PO-20260705-003",
    customer: "에스티아이",
    product: "DU-LK322-S3 커넥터 타입",
    orderQuantity: "7",
    instructionQuantity: "7",
    completedQuantity: "5",
    shippedQuantity: "0",
    dueDate: "2026.07.10",
    status: "생산중",
  },
  {
    id: 4,
    productionOrderNo: "PRD-20260703-004",
    orderNo: "PO-20260703-004",
    customer: "TEMCCNS",
    product: "DU-LK322-NPN-10-S1",
    orderQuantity: "74",
    instructionQuantity: "74",
    completedQuantity: "74",
    shippedQuantity: "74",
    dueDate: "2026.06.30",
    status: "출하완료",
  },
  {
    id: 5,
    productionOrderNo: "PRD-20260702-005",
    orderNo: "PO-20260702-005",
    customer: "테스트엔테크",
    product: "Leak Sensor Support",
    orderQuantity: "15",
    instructionQuantity: "15",
    completedQuantity: "15",
    shippedQuantity: "12",
    dueDate: "2026.06.30",
    status: "마감",
  },
];

export default function ProductionOrdersPage() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [checkedOrderIds, setCheckedOrderIds] = useState<number[]>([]);
  const [sortConditions, setSortConditions] = useState<SortCondition<SortKey>[]>([]);
  const [searchField, setSearchField] = useState<SortKey>("productionOrderNo");
  const [searchText, setSearchText] = useState("");
  const {
    clearOrderSidebarSelection,
    closeOrderSidebar,
    openOrderDetailSidebar,
    rightPanelMode,
    selectedOrder,
  } = useOrderSidebar();

  const searchOptions = Array.from(
    new Set(productionOrderRows.map((order) => String(getSearchValue(order, searchField)))),
  );
  const filteredOrders = productionOrderRows.filter((order) =>
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
    if (selectedOrderId === order.id && selectedOrder?.orderNo === order.orderNo && rightPanelMode === "detail") {
      setSelectedOrderId(null);
      clearOrderSidebarSelection();
      return;
    }

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
    orderNo: order.orderNo,
    customer: order.customer,
    product: order.product,
    quantity: order.instructionQuantity,
    unitPrice: "-",
    dueDate: order.dueDate,
    status: order.status,
    memo: `${order.productionOrderNo} ?앹궛吏?쒖엯?덈떎. ?꾨즺?섎웾 ${order.completedQuantity}, 異쒗븯?섎웾 ${order.shippedQuantity}`,
  };
}
