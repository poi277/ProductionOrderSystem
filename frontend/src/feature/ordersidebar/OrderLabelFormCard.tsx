import type { ReactNode } from "react";

export type OrderLabelForm = {
  productionOrderId: string;
  productionOrderNo: string;
  qrData: string;
  title: string;
  line1: string;
  line2: string;
  printedAt: string;
  createdAt: string;
  updatedAt: string;
};

type OrderLabelFormCardProps = {
  disabled?: boolean;
  form: OrderLabelForm;
  onChange?: (key: keyof OrderLabelForm, value: string) => void;
  title?: string;
};

const text = {
  createdAt: "등록일시",
  line1: "표시문구1",
  line2: "표시문구2",
  printedAt: "출력일시",
  productionOrderId: "생산지시ID",
  productionOrderNo: "생산지시번호",
  qrData: "QR 데이터",
  title: "라벨 제목",
  updatedAt: "수정일시",
};

export default function OrderLabelFormCard({
  disabled = false,
  form,
  onChange,
  title = "라벨 세부정보",
}: OrderLabelFormCardProps) {
  return (
    <section className="h-[560px] overflow-y-auto rounded-lg border border-slate-100 bg-white px-3 py-4">
      {title && (
        <header className="border-b border-slate-100 pb-2">
          <h2 className="mt-0.5 truncate text-base font-bold text-slate-950">{title}</h2>
        </header>
      )}

      <div className="mt-3 flex flex-col gap-3">
        <FormRow label={text.productionOrderId}>
          <TextInput
            disabled={disabled}
            onChange={(value) => onChange?.("productionOrderId", value)}
            value={form.productionOrderId}
          />
        </FormRow>
        <FormRow label={text.productionOrderNo}>
          <TextInput
            disabled={disabled}
            onChange={(value) => onChange?.("productionOrderNo", value)}
            value={form.productionOrderNo}
          />
        </FormRow>
        <FormRow label={text.qrData}>
          <TextInput
            disabled={disabled}
            onChange={(value) => onChange?.("qrData", value)}
            required
            value={form.qrData}
          />
        </FormRow>
        <FormRow label={text.title}>
          <TextInput disabled={disabled} onChange={(value) => onChange?.("title", value)} value={form.title} />
        </FormRow>
        <FormRow label={text.line1}>
          <TextInput disabled={disabled} onChange={(value) => onChange?.("line1", value)} value={form.line1} />
        </FormRow>
        <FormRow label={text.line2}>
          <TextInput disabled={disabled} onChange={(value) => onChange?.("line2", value)} value={form.line2} />
        </FormRow>
        <FormRow label={text.printedAt}>
          <TextInput
            disabled={disabled}
            onChange={(value) => onChange?.("printedAt", value)}
            type="datetime-local"
            value={form.printedAt}
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
