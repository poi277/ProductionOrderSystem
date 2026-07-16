import type { ReactNode } from "react";

export type OrderShipmentForm = {
  productionOrderNo: string;
  productProcessNo: string;
  productQr: string;
  processName: string;
  isCompleted: string;
  shippedAt: string;
  memo: string;
  createdAt: string;
  updatedAt: string;
};

type OrderShipmentFormCardProps = {
  disabled?: boolean;
  form: OrderShipmentForm;
  onChange?: (key: keyof OrderShipmentForm, value: string) => void;
  title?: string;
};

const text = {
  createdAt: "등록일시",
  isCompleted: "출하완료",
  memo: "출하시 비고",
  processName: "출하기준 공정",
  productProcessNo: "제품공정번호",
  productQr: "제품 QR",
  productionOrderNo: "생산지시번호",
  shippedAt: "출하일자",
  title: "납품출하 세부정보",
  updatedAt: "수정일시",
};

const shipmentProcessOptions = [
  { label: "최종검수", value: "FINAL_INSPECTION" },
  { label: "포장", value: "PACKAGING" },
  { label: "출하", value: "SHIPPED" },
];

export default function OrderShipmentFormCard({
  disabled = false,
  form,
  onChange,
  title = text.title,
}: OrderShipmentFormCardProps) {
  return (
    <section className="h-[560px] overflow-y-auto rounded-lg border border-slate-100 bg-white px-3 py-4">
      {title && (
        <header className="border-b border-slate-100 pb-2">
          <h2 className="mt-0.5 truncate text-base font-bold text-slate-950">{title}</h2>
        </header>
      )}

      <div className="mt-3 flex flex-col gap-3">
        <FormRow label={text.processName}>
          <div className="grid grid-cols-3 gap-2">
            {shipmentProcessOptions.map((option) => (
              <label
                className={`flex min-h-9 items-center gap-2 rounded-md border px-2.5 text-xs font-bold ${form.processName === option.value
                    ? "border-sky-400 bg-sky-50 text-sky-800"
                    : "border-slate-200 bg-white text-slate-900"
                  } ${disabled ? "opacity-80" : ""}`}
                key={option.value}
              >
                <input
                  checked={form.processName === option.value}
                  disabled={disabled}
                  onChange={() => onChange?.("processName", option.value)}
                  type="checkbox"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </FormRow>
      </div>
    </section>
  );
}

function FormRow({ label, children }: { children: ReactNode; label: string }) {
  return (
    <label className="grid grid-cols-[84px_minmax(0,1fr)] items-start gap-2 text-xs">
      <span className="pt-2 font-extrabold text-slate-900">{label}</span>
      <div className="min-w-0">{children}</div>
    </label>
  );
}

