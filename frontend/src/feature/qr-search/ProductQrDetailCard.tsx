import { formatKoreanDateTime, formatKoreanShortDateTime } from "../common/dateFormat";
import { PRODUCT_PROCESS_LABELS, PRODUCT_PROCESS_STEPS } from "../ordersidebar/processStatusUtils";
import type { ProductProcessHistory, ProductProcessStatus, ProductQrDetail } from "./qrSearchTypes";
import { productCategoryBadgeClass, productCategoryLabel } from "../common/productCategory";

export default function ProductQrDetailCard({ product }: { product: ProductQrDetail }) {
  const histories = [...product.processHistories].sort((a, b) =>
    a.completedTime.localeCompare(b.completedTime) || a.id - b.id,
  );
  const latestHistoryByProcess = histories.reduce((result, history) => {
    result[history.process] = history;
    return result;
  }, {} as Partial<Record<ProductProcessStatus, ProductProcessHistory>>);
  const defectProcesses = new Set(histories.filter((history) => history.defect).map((history) => history.process));

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <p className="text-xs font-bold text-slate-400">제품 QR 상세</p>
          <h2 className="mt-1 break-all text-lg font-extrabold text-slate-900">{product.productQr}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone={product.defect ? "red" : "green"}>{product.defect ? "불량" : "정상"}</Badge>
          <Badge tone="slate">{PRODUCT_PROCESS_LABELS[product.currentProcess]}</Badge>
        </div>
      </header>

      <section className="grid gap-x-4 gap-y-2 border-b border-slate-200 px-5 py-4 text-sm sm:grid-cols-2">
        <div className="grid min-h-8 grid-cols-[100px_1fr] items-center gap-3"><dt className="font-bold text-slate-400">제품군</dt><dd><span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${productCategoryBadgeClass(product.productCategory)}`}>{productCategoryLabel(product.productCategory)}</span></dd></div>
        <Detail label="발주번호" value={product.purchaseId} />
        <Detail label="고객사" value={product.customer} />
        <Detail label="품명" value={product.productName} />
        <Detail label="LOT" value={product.lot} />
        <Detail label="제품 생성시간" value={formatKoreanDateTime(product.createdTime)} />
      </section>

      <section className="border-b border-slate-200 px-5 py-5">
        <h3 className="text-sm font-extrabold text-slate-800">공정 진행 현황</h3>
        {histories.length === 0 ? (
          <p className="mt-4 rounded-lg bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">아직 완료된 공정 이력이 없습니다.</p>
        ) : (
          <div className="mt-5 overflow-x-auto pb-2">
            <div className="flex min-w-[760px] items-start">
              {PRODUCT_PROCESS_STEPS.map(([label, status], index) => {
                const latest = latestHistoryByProcess[status];
                const completed = Boolean(latest);
                const hasDefect = defectProcesses.has(status);
                return (
                  <div className="relative flex min-w-0 flex-1 flex-col items-center" key={status}>
                    {index > 0 && <span className={`absolute right-1/2 top-2.5 h-0.5 w-full ${completed ? "bg-slate-700" : "bg-slate-200"}`} />}
                    <span className={`relative z-10 flex size-5 items-center justify-center rounded-full border-2 ${
                      hasDefect ? "border-red-500 bg-red-50" : completed ? "border-slate-800 bg-slate-800" : "border-slate-300 bg-white"
                    }`}>
                      {completed && !hasDefect && <span className="size-1.5 rounded-full bg-white" />}
                      {hasDefect && <span className="size-1.5 rounded-full bg-red-500" />}
                    </span>
                    <span className={`mt-2 text-center text-[11px] font-bold ${completed ? "text-slate-700" : "text-slate-400"}`}>{label}</span>
                    <span className="mt-0.5 text-xs font-semibold text-blue-800" title={formatKoreanDateTime(latest?.completedTime)}>
                      {formatKoreanShortDateTime(latest?.completedTime)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section className="px-5 py-5">
        <h3 className="text-sm font-extrabold text-slate-800">전체 공정 이력</h3>
        {histories.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">공정 이력이 없습니다.</p>
        ) : (
          <ol className="mt-3 grid max-h-[240px] grid-cols-3 gap-3 overflow-y-auto pr-2">
            {historyRows(histories).map(({ history, repeated }) => (
              <li className="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 p-3" key={history.id}>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {PRODUCT_PROCESS_LABELS[history.process]}{repeated ? history.process === "TEST" ? " 재검사 완료" : " 재작업 완료" : " 완료"}
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-blue-800">{formatKoreanDateTime(history.completedTime)}</p>
                </div>
                <div className="flex gap-2">
                  {repeated && <Badge tone="amber">재작업</Badge>}
                  <Badge tone={history.defect ? "red" : "green"}>{history.defect ? "불량" : "정상"}</Badge>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </article>
  );
}

function historyRows(histories: ProductProcessHistory[]) {
  const counts = new Map<ProductProcessStatus, number>();
  return histories.map((history) => {
    const count = counts.get(history.process) ?? 0;
    counts.set(history.process, count + 1);
    return { history, repeated: count > 0 };
  });
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return <div className="grid min-h-8 grid-cols-[100px_1fr] items-center gap-3"><dt className="font-bold text-slate-400">{label}</dt><dd className="break-words font-semibold text-slate-700">{value || "-"}</dd></div>;
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "red" | "green" | "blue" | "slate" | "amber" }) {
  const colors = { red: "bg-red-50 text-red-700", green: "bg-emerald-50 text-emerald-700", blue: "bg-blue-50 text-blue-700", slate: "bg-slate-100 text-slate-600", amber: "bg-amber-50 text-amber-700" };
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${colors[tone]}`}>{children}</span>;
}
