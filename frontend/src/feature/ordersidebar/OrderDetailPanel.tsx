import type { Order } from "../order/OrdersTypes";

type OrderDetailPanelProps = {
  order: Order | null;
};

export default function OrderDetailPanel({ order }: OrderDetailPanelProps) {
  if (!order) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-10 text-center lg:min-h-screen">
        <p className="text-lg font-bold text-slate-700">선택된 발주서가 없습니다.</p>
        <p className="mt-2 text-sm text-slate-400">
          목록에서 발주서를 선택하거나 주문 생성을 시작하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[360px] flex-col gap-4 overflow-y-auto px-5 py-5 lg:min-h-screen">
      <header>
        <p className="text-sm font-bold text-slate-500">발주번호</p>
        <h2 className="mt-1 truncate border-b-2 border-slate-700 pb-1 text-3xl font-light tracking-tight">
          {order.orderNo}
        </h2>
      </header>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold">기본 정보</h3>
        <dl className="mt-4 grid grid-cols-[88px_1fr] gap-y-3 text-sm">
          <dt className="font-bold text-slate-500">고객사</dt>
          <dd>{order.customer}</dd>
          <dt className="font-bold text-slate-500">품명</dt>
          <dd>{order.product}</dd>
          <dt className="font-bold text-slate-500">발주수량</dt>
          <dd>{order.quantity}</dd>
          <dt className="font-bold text-slate-500">단가</dt>
          <dd>{order.unitPrice}</dd>
          <dt className="font-bold text-slate-500">납기</dt>
          <dd>{order.dueDate}</dd>
          <dt className="font-bold text-slate-500">상태</dt>
          <dd>
            <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-bold text-[#1f4f9a]">
              {order.status}
            </span>
          </dd>
        </dl>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold">메모</h3>
        <p className="mt-3 min-h-20 text-sm leading-6 text-slate-500">{order.memo}</p>
      </section>
    </div>
  );
}
