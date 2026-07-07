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

export default function OrderShipmentFormCard({
  disabled = false,
  form,
  onChange,
  title = text.title,
}: OrderShipmentFormCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white px-3 py-4 shadow-sm">
      <header className="border-b border-slate-100 pb-2">
        <h2 className="mt-0.5 truncate text-base font-bold text-slate-950">{title}</h2>
      </header>

      <div className="mt-3 flex flex-col gap-3">
        <FormRow label={text.productionOrderNo}>
          <TextInput
            disabled={disabled}
            onChange={(value) => onChange?.("productionOrderNo", value)}
            required
            value={form.productionOrderNo}
          />
        </FormRow>
        <FormRow label={text.productProcessNo}>
          <TextInput
            disabled={disabled}
            onChange={(value) => onChange?.("productProcessNo", value)}
            required
            value={form.productProcessNo}
          />
        </FormRow>
        <FormRow label={text.productQr}>
          <TextInput
            disabled={disabled}
            onChange={(value) => onChange?.("productQr", value)}
            required
            value={form.productQr}
          />
        </FormRow>
        <FormRow label={text.processName}>
          <TextInput
            disabled={disabled}
            onChange={(value) => onChange?.("processName", value)}
            required
            value={form.processName}
          />
        </FormRow>
        <FormRow label={text.isCompleted}>
          <select
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-900 outline-none disabled:bg-[#f6f7f9] disabled:font-bold disabled:text-slate-900 focus:border-[#2f80ed]"
            disabled={disabled}
            onChange={(event) => onChange?.("isCompleted", event.target.value)}
            value={form.isCompleted}
          >
            <option value="대기">대기</option>
            <option value="부분출하">부분출하</option>
            <option value="완료">완료</option>
            <option value="취소">취소</option>
          </select>
        </FormRow>
        <FormRow label={text.shippedAt}>
          <TextInput
            disabled={disabled}
            onChange={(value) => onChange?.("shippedAt", value)}
            type="datetime-local"
            value={form.shippedAt}
          />
        </FormRow>
        <FormRow label={text.memo}>
          <textarea
            className="min-h-20 w-full resize-none rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-900 outline-none disabled:bg-[#f6f7f9] disabled:font-bold disabled:text-slate-900 focus:border-[#2f80ed]"
            disabled={disabled}
            onChange={(event) => onChange?.("memo", event.target.value)}
            value={form.memo}
          />
        </FormRow>
        <FormRow label={text.createdAt}>
          <TextInput
            disabled={disabled}
            onChange={(value) => onChange?.("createdAt", value)}
            type="datetime-local"
            value={form.createdAt}
          />
        </FormRow>
        <FormRow label={text.updatedAt}>
          <TextInput
            disabled={disabled}
            onChange={(value) => onChange?.("updatedAt", value)}
            type="datetime-local"
            value={form.updatedAt}
          />
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

function TextInput({
  disabled,
  onChange,
  required,
  type = "text",
  value,
}: {
  disabled: boolean;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <input
      className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-900 outline-none disabled:bg-[#f6f7f9] disabled:font-bold disabled:text-slate-900 focus:border-[#2f80ed]"
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      type={type}
      value={value}
    />
  );
}
