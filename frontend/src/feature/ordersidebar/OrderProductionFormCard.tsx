import type { ReactNode } from "react";

export type OrderProductionForm = {
  completedQuantity: string;
  customer: string;
  dueDate: string;
  instructionQuantity: string;
  orderNo: string;
  product: string;
  productionOrderNo: string;
  shippedQuantity: string;
  status: string;
};

type OrderProductionFormCardProps = {
  disabled?: boolean;
  form: OrderProductionForm;
  onChange?: (key: keyof OrderProductionForm, value: string) => void;
  title?: string;
};

const text = {
  completedQuantity: "\uc644\ub8cc\uc218\ub7c9",
  customer: "\uace0\uac1d\uc0ac",
  dueDate: "\ub0a9\uae30",
  instructionQuantity: "\uc9c0\uc2dc\uc218\ub7c9",
  orderNo: "\ubc1c\uc8fc\ubc88\ud638",
  product: "\ud488\uba85",
  productionOrderNo: "\uc0dd\uc0b0\uc9c0\uc2dc\ubc88\ud638",
  shippedQuantity: "\ucd9c\ud558\uc218\ub7c9",
  status: "\uc0c1\ud0dc",
  title: "\uc0dd\uc0b0\uc9c0\uc2dc\u0020\uc138\ubd80\uc815\ubcf4",
};

export default function OrderProductionFormCard({
  disabled = false,
  form,
  onChange,
  title = text.title,
}: OrderProductionFormCardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white px-3 py-4 shadow-sm">
      <header className="border-b border-slate-100 pb-2">
        <h2 className="mt-0.5 truncate text-base font-bold text-slate-950">{title}</h2>
      </header>

      <div className="mt-3 flex flex-col gap-3">
        <FormRow label={text.orderNo}>
          <TextInput
            disabled={disabled}
            onChange={(value) => onChange?.("orderNo", value)}
            required
            value={form.orderNo}
          />
        </FormRow>
        <FormRow label={text.productionOrderNo}>
          <TextInput
            disabled={disabled}
            onChange={(value) => onChange?.("productionOrderNo", value)}
            required
            value={form.productionOrderNo}
          />
        </FormRow>
        <FormRow label={text.customer}>
          <TextInput disabled={disabled} onChange={(value) => onChange?.("customer", value)} value={form.customer} />
        </FormRow>
        <FormRow label={text.product}>
          <TextInput
            disabled={disabled}
            onChange={(value) => onChange?.("product", value)}
            required
            value={form.product}
          />
        </FormRow>
        <FormRow label={text.instructionQuantity}>
          <TextInput
            disabled={disabled}
            min={1}
            onChange={(value) => onChange?.("instructionQuantity", value)}
            required
            type="number"
            value={form.instructionQuantity}
          />
        </FormRow>
        <FormRow label={text.completedQuantity}>
          <TextInput
            disabled={disabled}
            min={0}
            onChange={(value) => onChange?.("completedQuantity", value)}
            type="number"
            value={form.completedQuantity}
          />
        </FormRow>
        <FormRow label={text.shippedQuantity}>
          <TextInput
            disabled={disabled}
            min={0}
            onChange={(value) => onChange?.("shippedQuantity", value)}
            type="number"
            value={form.shippedQuantity}
          />
        </FormRow>
        <FormRow label={text.dueDate}>
          <TextInput disabled={disabled} onChange={(value) => onChange?.("dueDate", value)} type="date" value={form.dueDate} />
        </FormRow>
        <FormRow label={text.status}>
          <select
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-900 outline-none disabled:bg-[#f6f7f9] disabled:font-bold disabled:text-slate-900 focus:border-[#2f80ed]"
            disabled={disabled}
            onChange={(event) => onChange?.("status", event.target.value)}
            value={form.status}
          >
            <option value="지시대기">지시대기</option>
            <option value="생산중">생산중</option>
            <option value="완료">완료</option>
            <option value="출하완료">출하완료</option>
            <option value="마감">마감</option>
            <option value="취소">취소</option>
          </select>
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
