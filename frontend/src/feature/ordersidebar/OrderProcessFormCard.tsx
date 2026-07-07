import type { ReactNode } from "react";

export type OrderProcessForm = {
  productionOrderNo: string;
  productQr: string;
  productName: string;
  lotNo: string;
  processName: string;
  processSequence: string;
  status: string;
  isShipmentTarget: string;
  startedAt: string;
};

type OrderProcessFormCardProps = {
  disabled?: boolean;
  form: OrderProcessForm;
  onChange?: (key: keyof OrderProcessForm, value: string) => void;
  title?: string;
};

const text = {
  isShipmentTarget: "출하대상",
  lotNo: "LOT번호",
  processName: "공정명",
  processSequence: "공정순서",
  productName: "품명",
  productQr: "제품 QR",
  productionOrderNo: "생산지시번호",
  startedAt: "시작일시",
  status: "상태",
  title: "생산현황 세부정보",
};

export default function OrderProcessFormCard({
  disabled = false,
  form,
  onChange,
  title = text.title,
}: OrderProcessFormCardProps) {
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
        <FormRow label={text.productQr}>
          <TextInput
            disabled={disabled}
            onChange={(value) => onChange?.("productQr", value)}
            required
            value={form.productQr}
          />
        </FormRow>
        <FormRow label={text.productName}>
          <TextInput
            disabled={disabled}
            onChange={(value) => onChange?.("productName", value)}
            required
            value={form.productName}
          />
        </FormRow>
        <FormRow label={text.lotNo}>
          <TextInput disabled={disabled} onChange={(value) => onChange?.("lotNo", value)} value={form.lotNo} />
        </FormRow>
        <FormRow label={text.processName}>
          <TextInput
            disabled={disabled}
            onChange={(value) => onChange?.("processName", value)}
            required
            value={form.processName}
          />
        </FormRow>
        <FormRow label={text.processSequence}>
          <TextInput
            disabled={disabled}
            min={1}
            onChange={(value) => onChange?.("processSequence", value)}
            required
            type="number"
            value={form.processSequence}
          />
        </FormRow>
        <FormRow label={text.status}>
          <select
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-900 outline-none disabled:bg-[#f6f7f9] disabled:font-bold disabled:text-slate-900 focus:border-[#2f80ed]"
            disabled={disabled}
            onChange={(event) => onChange?.("status", event.target.value)}
            value={form.status}
          >
            <option value="대기">대기</option>
            <option value="진행중">진행중</option>
            <option value="완료">완료</option>
            <option value="중단">중단</option>
          </select>
        </FormRow>
        <FormRow label={text.isShipmentTarget}>
          <select
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-900 outline-none disabled:bg-[#f6f7f9] disabled:font-bold disabled:text-slate-900 focus:border-[#2f80ed]"
            disabled={disabled}
            onChange={(event) => onChange?.("isShipmentTarget", event.target.value)}
            value={form.isShipmentTarget}
          >
            <option value="N">N</option>
            <option value="Y">Y</option>
          </select>
        </FormRow>
        <FormRow label={text.startedAt}>
          <TextInput
            disabled={disabled}
            onChange={(value) => onChange?.("startedAt", value)}
            type="datetime-local"
            value={form.startedAt}
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
  min,
  onChange,
  required,
  type = "text",
  value,
}: {
  disabled: boolean;
  min?: number;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <input
      className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-900 outline-none disabled:bg-[#f6f7f9] disabled:font-bold disabled:text-slate-900 focus:border-[#2f80ed]"
      disabled={disabled}
      min={min}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      type={type}
      value={value}
    />
  );
}
