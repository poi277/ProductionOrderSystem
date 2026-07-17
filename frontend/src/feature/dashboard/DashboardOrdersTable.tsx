"use client";

import { ResizableColumnHandle, useResizableTableColumns } from "../common/ResizableTableColumns";
import StepProgress from "./StepProgress";
import { PROGRESS_STEPS } from "./progressStatus";
import type { DashboardOrder } from "./dashboardTypes";
import { productCategoryBadgeClass, productCategoryLabel } from "../common/productCategory";

type DashboardOrdersTableProps = {
  orders: DashboardOrder[];
};

export default function DashboardOrdersTable({ orders }: DashboardOrdersTableProps) {
  const { columnWidths, startResize, tableWidth } = useResizableTableColumns();

  return (
    <div className="min-h-0 flex-1 overflow-x-auto border border-slate-200 bg-white shadow-sm">
      <table
        className="w-full table-fixed border-collapse text-sm"
        style={tableWidth == null ? undefined : { width: tableWidth }}
      >
        <colgroup>
          <col className={columnWidths ? undefined : "w-[10%]"} style={columnWidths ? { width: columnWidths[0] } : undefined} />
          <col className={columnWidths ? undefined : "w-[10%]"} style={columnWidths ? { width: columnWidths[1] } : undefined} />
          <col className={columnWidths ? undefined : "w-[10%]"} style={columnWidths ? { width: columnWidths[2] } : undefined} />
          <col className={columnWidths ? undefined : "w-[10%]"} style={columnWidths ? { width: columnWidths[3] } : undefined} />
          <col className={columnWidths ? undefined : "w-[10%]"} style={columnWidths ? { width: columnWidths[4] } : undefined} />
          {PROGRESS_STEPS.map((step, index) => (
            <col className={columnWidths ? undefined : "w-[7.143%]"} key={step} style={columnWidths ? { width: columnWidths[index + 5] } : undefined} />
          ))}
        </colgroup>
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200 text-slate-900">
            {["제품군", "발주번호", "고객사", "품명", "발주수량"].map((label, index) => (
              <DashboardHeader columnIndex={index} key={label} onResize={startResize}>{label}</DashboardHeader>
            ))}
            {PROGRESS_STEPS.map((step) => (
              <DashboardHeader columnIndex={4} key={step} onResize={startResize} progress resizable={false}>
                {step}
              </DashboardHeader>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr className="border-b border-slate-200 bg-white transition-colors hover:bg-slate-50" key={order.id}>
              <td className="whitespace-nowrap px-2 py-1 text-center">
                <span className={`inline-flex rounded-full border px-3 py-1 font-bold ${productCategoryBadgeClass(order.productCategory)}`}>{productCategoryLabel(order.productCategory)}</span>
              </td>
              <td className="truncate px-4 py-1 text-center font-bold text-slate-900" title={order.purchaseId}>
                {order.purchaseId}
              </td>
              <td className="truncate px-4 py-1 text-center font-semibold text-slate-700" title={order.customer ?? "-"}>
                {order.customer ?? "-"}
              </td>
              <td className="truncate px-4 py-1 text-center font-semibold text-slate-900" title={order.productName ?? "-"}>
                {order.productName ?? "-"}
              </td>
              <td className="whitespace-nowrap px-4 py-1 text-center font-bold text-slate-700">
                {formatQuantity(order.quantity)}
              </td>
              <td className="py-1" colSpan={7}>
                <StepProgress processCompletedTimes={order.processCompletedTimes} status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DashboardHeader({ children, columnIndex, onResize, progress = false, resizable = true }: {
  children: React.ReactNode;
  columnIndex: number;
  onResize: ReturnType<typeof useResizableTableColumns>["startResize"];
  progress?: boolean;
  resizable?: boolean;
}) {
  return (
    <th className={`relative whitespace-nowrap py-3 text-center font-bold text-slate-900 ${progress ? "px-1 text-[11px]" : "px-4"}`}>
      {children}
      {resizable && <ResizableColumnHandle columnIndex={columnIndex} onResize={onResize} />}
    </th>
  );
}

function formatQuantity(quantity: number | null) {
  return quantity == null ? "-" : `${quantity.toLocaleString("ko-KR")}개`;
}
