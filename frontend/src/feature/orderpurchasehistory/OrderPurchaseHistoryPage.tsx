"use client";

import { useEffect, useState } from "react";
import DataListTable from "../common/DataListTable";
import { formatKoreanDateWithoutYear } from "../common/dateFormat";
import ListToolbar from "../common/ListToolbar";
import type { DataListColumn } from "../common/DataListTable";
import type { ListOption, SortCondition } from "../common/ListToolbar";
import { useOrderSidebar } from "../ordersidebar/OrderSidebarContext";
import { purchaseHistoryEndpoints } from "../../../lib/endpoints";
import { apiClient, getApiErrorMessage } from "../../../util/apiClient";
import { useApiMutationRevision } from "../../../util/apiMutationStore";
import type { ProductCategory } from "../order/OrdersTypes";
import { productCategoryBadgeClass, productCategoryLabel } from "../common/productCategory";

type Source = "PURCHASE" | "HISTORY";
type SortKey = "orderNo" | "productCategory" | "customer" | "product" | "quantity" | "dueDate" | "memo";

type HistoryResponse = {
  id: number;
  source: Source;
  purchaseId: string;
  customer: string | null;
  productName: string | null;
  quantity: number | null;
  dueDate: string | null;
  status: string | null;
  note: string | null;
  createdTime: string | null;
  productCategory: ProductCategory | null;
};

type HistoryRow = {
  rowId: string;
  no: number;
  source: Source;
  sourceId: number;
  orderNo: string;
  customer: string;
  product: string;
  quantity: string;
  dueDate: string;
  memo: string;
  createdTime: string | null;
  productCategory: ProductCategory | null;
};

type ApiResponse<T> = { success: boolean; message: string; data: T };

const options: ListOption<SortKey>[] = [
  { label: "제품군", key: "productCategory" },
  { label: "발주번호", key: "orderNo" },
  { label: "고객사", key: "customer" },
  { label: "품명", key: "product" },
  { label: "수량", key: "quantity" },
  { label: "납기일", key: "dueDate" },
  { label: "비고", key: "memo" },
];

const columns: DataListColumn<HistoryRow>[] = [
  { align: "center", header: "No.", key: "no", render: (row) => row.no },
  { align: "center", header: "제품군", key: "productCategory", render: (row) => <span className={`inline-flex rounded-full border px-3 py-1 font-bold ${productCategoryBadgeClass(row.productCategory)}`}>{productCategoryLabel(row.productCategory)}</span> },
  { align: "center", header: "발주번호", key: "orderNo", render: (row) => row.orderNo },
  { align: "center", header: "고객사", key: "customer", render: (row) => row.customer },
  { header: "품명", key: "product", render: (row) => row.product },
  { align: "center", header: "발주수량", key: "quantity", render: (row) => row.quantity },
  { align: "center", header: "납기일", key: "dueDate", render: (row) => row.dueDate },
  { header: "비고", key: "memo", render: (row) => row.memo },
];

export default function OrderPurchaseHistoryPage() {
  const mutationRevision = useApiMutationRevision();
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [sortConditions, setSortConditions] = useState<SortCondition<SortKey>[]>([]);
  const [searchField, setSearchField] = useState<SortKey>("orderNo");
  const [searchText, setSearchText] = useState("");
  const [message, setMessage] = useState("발주이력 목록을 불러오는 중입니다.");
  const { closeOrderSidebar } = useOrderSidebar();

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const response = await apiClient(purchaseHistoryEndpoints.root, { cache: "no-store" });
        if (!response.ok) throw new Error(await getApiErrorMessage(response, "발주이력 목록을 조회하지 못했습니다."));
        const result = (await response.json()) as ApiResponse<HistoryResponse[]>;
        if (!ignore) {
          setRows(result.data.map(toRow));
          setMessage("등록된 발주이력이 없습니다.");
        }
      } catch {
        if (!ignore) {
          setRows([]);
          setMessage("발주이력 목록을 조회하지 못했습니다.");
        }
      }
    };
    void load();
    return () => { ignore = true; };
  }, [mutationRevision]);

  const filtered = rows.filter((row) =>
    historyValue(row, searchField).toLowerCase().includes(searchText.toLowerCase()),
  );
  const sorted = [...filtered].sort((a, b) => {
    for (const condition of sortConditions) {
      const result = historyValue(a, condition.key).localeCompare(historyValue(b, condition.key), "ko", { numeric: true });
      if (result !== 0) return condition.direction === "asc" ? result : -result;
    }
    return 0;
  });

  const handleSort = (key: SortKey) => {
    setSortConditions((current) => {
      const existing = current.find((condition) => condition.key === key);
      if (!existing) return [...current, { key, direction: "asc" }];
      if (existing.direction === "asc") {
        return current.map((condition) => condition.key === key ? { ...condition, direction: "desc" } : condition);
      }
      return current.filter((condition) => condition.key !== key);
    });
  };

  const handleDelete = async () => {
    const selected = rows.filter((row) => checkedIds.includes(row.rowId));
    if (!selected.length || !window.confirm(`${selected.length}개를 정말로 삭제하시겠습니까?`)) return;

    const responses = await Promise.all(selected.map((row) =>
      apiClient(purchaseHistoryEndpoints.item(row.source, row.sourceId), { method: "DELETE" }),
    ));
    const failedResponse = responses.find((response) => !response.ok);
    if (failedResponse) {
      window.alert(await getApiErrorMessage(failedResponse, "선택한 발주이력 삭제에 실패했습니다."));
      return;
    }
    setRows((current) => current.filter((row) => !checkedIds.includes(row.rowId)).map(withNumber));
    setCheckedIds([]);
    closeOrderSidebar();
  };

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white text-slate-950">
      <section className="flex min-w-0 flex-1 flex-col px-5 py-5">
        <ListToolbar
          categoryKey="order"
          onSearchFieldChange={setSearchField}
          onSearchTextChange={setSearchText}
          onSort={handleSort}
          onDelete={handleDelete}
          options={options}
          searchField={searchField}
          searchOptions={Array.from(new Set(rows.map((row) => historyValue(row, searchField))))}
          searchText={searchText}
          selectedCount={checkedIds.length}
          sortConditions={sortConditions}
        />
        <DataListTable
          categoryKey="order"
          onColumnSort={(key) => handleSort(key as SortKey)}
          sortableColumnKeys={options.map((option) => option.key)}
          sortConditions={sortConditions}
          checkedRowIds={checkedIds}
          columns={columns}
          emptyMessage={message}
          getRowId={(row) => row.rowId}
          onBlankClick={closeOrderSidebar}
          onCheckboxChange={(row) => setCheckedIds((current) =>
            current.includes(row.rowId) ? current.filter((id) => id !== row.rowId) : [...current, row.rowId],
          )}
          rows={sorted}
        />
      </section>
    </main>
  );
}

function historyValue(row: HistoryRow, key: SortKey) {
  return key === "productCategory" ? productCategoryLabel(row.productCategory) : String(row[key] ?? "");
}

function toRow(item: HistoryResponse, index: number): HistoryRow {
  return {
    rowId: `${item.source}-${item.id}`,
    no: index + 1,
    source: item.source,
    sourceId: item.id,
    orderNo: item.purchaseId,
    customer: item.customer ?? "-",
    product: item.productName ?? "-",
    quantity: item.quantity == null ? "-" : item.quantity.toLocaleString("ko-KR"),
    dueDate: formatKoreanDateWithoutYear(item.dueDate),
    memo: item.note ?? "-",
    createdTime: item.createdTime,
    productCategory: item.productCategory ?? null,
  };
}

function withNumber(row: HistoryRow, index: number): HistoryRow {
  return { ...row, no: index + 1 };
}
