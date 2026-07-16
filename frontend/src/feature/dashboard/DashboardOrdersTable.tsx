import StepProgress from "./StepProgress";
import { PROGRESS_STEPS } from "./progressStatus";
import type { DashboardOrder } from "./dashboardTypes";

type DashboardOrdersTableProps = {
  orders: DashboardOrder[];
};

export default function DashboardOrdersTable({ orders }: DashboardOrdersTableProps) {
  return (
    <div className="min-h-0 flex-1 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[1180px] table-fixed border-collapse text-sm">
        <colgroup>
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          {PROGRESS_STEPS.map((step) => <col className="w-[7.428%]" key={step} />)}
        </colgroup>
        <thead className="bg-slate-50">
          <tr className="border-b border-slate-200 text-slate-900">
            <th className="px-4 py-1 text-center font-bold">발주번호</th>
            <th className="px-4 py-1 text-center font-bold">고객사</th>
            <th className="px-4 py-1 text-center font-bold">품명</th>
            <th className="px-4 py-1 text-center font-bold">발주수량</th>
            {PROGRESS_STEPS.map((step) => <th className="whitespace-nowrap px-1 py-1 text-center text-[11px] font-bold text-slate-600" key={step}>{step}</th>)}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr className="border-b border-slate-200 bg-white transition-colors hover:bg-slate-50" key={order.purchaseId}>
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

function formatQuantity(quantity: number | null) {
  return quantity == null ? "-" : `${quantity.toLocaleString("ko-KR")}개`;
}
