import type { ReactNode } from "react";

export type OrderPurchaseForm = {
  purchaseId: string;
  customer: string;
  product: string;
  quantity: string;
  unitPrice: string;
  dueDate: string;
  memo: string;
  status?: string;
};

type OrderPurchaseFormCardProps = {
  compact?: boolean;
  disabled?: boolean;
  disablePurchaseId?: boolean;
  eyebrow: string;
  form: OrderPurchaseForm;
  hideMemo?: boolean;
  onChange: (key: keyof OrderPurchaseForm, value: string) => void;
  showStatus?: boolean;
  title: string;
};

const text = {
  customer: "\uace0\uac1d\uc0ac",
  dueDate: "\ub0a9\uae30\uc77c",
  memo: "\ube44\uace0",
  product: "\uc81c\ud488\uba85",
  purchaseId: "\ubc1c\uc8fc\ubc88\ud638",
  quantity: "\ubc1c\uc8fc\uc218\ub7c9",
  status: "\uc0c1\ud0dc",
  statusCanceled: "\ucde8\uc18c",
  statusCompleted: "\uc644\ub8cc",
  statusInstruction: "\uc9c0\uc2dc\ub300\uae30",
  statusProducing: "\uc0dd\uc0b0\uc911",
  statusShipped: "\ucd9c\ud558\uc644\ub8cc",
  unitPrice: "\ub2e8\uac00",
};

export default function OrderPurchaseFormCard({
  compact = false,
  disabled = false,
  disablePurchaseId = false,
  eyebrow,
  form,
  hideMemo = false,
  onChange,
  showStatus = false,
  title,
}: OrderPurchaseFormCardProps) {
  const adjustNumber = (key: "quantity" | "unitPrice", step: number, minValue: number) => {
    const currentValue = Number(form[key] || 0);
    const nextValue = Math.max(minValue, currentValue + step);

    onChange(key, String(nextValue));
  };

  return (
    <section className={`rounded-lg border border-slate-100 bg-white px-3 ${compact ? "h-auto overflow-visible py-2 [&_input]:h-7 [&_select]:h-7 [&_textarea]:min-h-12" : "h-[560px] overflow-y-auto py-4"}`}>
      {(eyebrow || title) && (
        <header className="border-b border-slate-100 pb-2">
          {eyebrow && <p className="text-[11px] font-bold text-[#1f4f9a]">{eyebrow}</p>}
          {title && <h2 className="mt-0.5 truncate text-base font-bold text-slate-950">{title}</h2>}
        </header>
      )}

      <div className={`flex flex-col ${compact ? "mt-1.5 gap-1.5" : "mt-3 gap-3"}`}>
        <FormRow label={text.purchaseId}>
          <TextInput
            disabled={disabled || disablePurchaseId}
            onChange={(value) => onChange("purchaseId", value)}
            required
            value={form.purchaseId}
          />
        </FormRow>
        <FormRow label={text.customer}>
          <TextInput disabled={disabled} onChange={(value) => onChange("customer", value)} value={form.customer} />
        </FormRow>
        <FormRow label={text.product}>
          <TextInput disabled={disabled} onChange={(value) => onChange("product", value)} required value={form.product} />
        </FormRow>
        <FormRow label={text.unitPrice}>
          <NumberField
            disabled={disabled}
            min={0}
            onChange={(value) => onChange("unitPrice", value)}
            onMinus={() => adjustNumber("unitPrice", -100, 0)}
            onPlus={() => adjustNumber("unitPrice", 100, 0)}
            value={form.unitPrice}
          />
        </FormRow>
        <FormRow label={text.quantity}>
          <NumberField
            disabled={disabled}
            min={1}
            onChange={(value) => onChange("quantity", value)}
            onMinus={() => adjustNumber("quantity", -1, 1)}
            onPlus={() => adjustNumber("quantity", 1, 1)}
            required
            value={form.quantity}
          />
        </FormRow>
        <FormRow label={text.dueDate}>
          <TextInput
            disabled={disabled}
            onChange={(value) => onChange("dueDate", value)}
            type="date"
            value={form.dueDate}
          />
        </FormRow>
        {!hideMemo && (
          <FormRow label={text.memo}>
            <textarea
              className="min-h-20 w-full resize-none rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-900 outline-none disabled:bg-[#f6f7f9] disabled:font-bold disabled:text-slate-900 focus:border-[#2f80ed]"
              disabled={disabled}
              onChange={(event) => onChange("memo", event.target.value)}
              value={form.memo}
            />
          </FormRow>
        )}
        {showStatus && (
          <FormRow label={text.status}>
            <select
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-900 outline-none disabled:bg-[#f6f7f9] disabled:font-bold disabled:text-slate-900 focus:border-[#2f80ed]"
              disabled={disabled}
              onChange={(event) => onChange("status", event.target.value)}
              value={form.status ?? "WAITING"}
            >
              <option value="WAITING">{text.statusInstruction}</option>
              <option value="IN_PROGRESS">{text.statusProducing}</option>
              <option value="COMPLETED">{text.statusCompleted}</option>
              <option value="SHIPPED">{text.statusShipped}</option>
              <option value="CANCELED">{text.statusCanceled}</option>
            </select>
          </FormRow>
        )}
      </div>
    </section>
  );
}

function FormRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid grid-cols-[64px_minmax(0,1fr)] items-start gap-2 text-xs">
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

function NumberField({
  disabled,
  min,
  onChange,
  onMinus,
  onPlus,
  required,
  value,
}: {
  disabled: boolean;
  min: number;
  onChange: (value: string) => void;
  onMinus: () => void;
  onPlus: () => void;
  required?: boolean;
  value: string;
}) {
  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_48px] overflow-hidden rounded-md border border-slate-200 ${
        disabled ? "bg-[#f6f7f9]" : "bg-white"
      }`}
    >
      <input
        className="h-9 min-w-0 bg-transparent px-2.5 text-left text-xs font-bold text-slate-900 outline-none disabled:font-bold disabled:text-slate-900"
        disabled={disabled}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type="number"
        value={value}
      />
      <div className="grid grid-cols-2 border-l border-slate-200 bg-[#f6f7f9] text-slate-500">
        <button
          className="border-r border-slate-200 text-base font-bold disabled:text-slate-300"
          disabled={disabled}
          onClick={onMinus}
          type="button"
        >
          -
        </button>
        <button
          className="text-base font-bold disabled:text-slate-300"
          disabled={disabled}
          onClick={onPlus}
          type="button"
        >
          +
        </button>
      </div>
    </div>
  );
}
