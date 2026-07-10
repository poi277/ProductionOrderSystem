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

const processOptions = [
  { label: "생산", value: "ASSEMBLY" },
  { label: "TEST", value: "TEST" },
];

type OrderProcessFormCardProps = {
  disabled?: boolean;
  form: OrderProcessForm;
  onChange?: (key: keyof OrderProcessForm, value: string) => void;
  title?: string;
};

const text = {
  isShipmentTarget: "출하대상",
  lotNo: "LOT번호",
  processSequence: "공정순서",
  productName: "제품명",
  productQr: "제품 QR",
  title: "생산현황 세부정보",
};

export default function OrderProcessFormCard({
  disabled = false,
  form,
  onChange,
  title = text.title,
}: OrderProcessFormCardProps) {
  return (
    <section className="h-[560px] overflow-y-auto rounded-lg border border-slate-100 bg-white px-3 py-4">
      {title && (
        <header className="border-b border-slate-100 pb-2">
          <h2 className="mt-0.5 truncate text-base font-bold text-slate-950">{title}</h2>
        </header>
      )}

      <div className="mt-3 flex flex-col gap-3">
        <FormRow label={text.processSequence}>
          <div className="grid grid-cols-2 gap-2">
            {processOptions.map((option) => (
              <label
                className={`flex min-h-9 items-center gap-2 rounded-md border px-2.5 text-xs font-bold ${
                  form.processSequence === option.value
                    ? "border-sky-400 bg-sky-50 text-sky-800"
                    : "border-slate-200 bg-white text-slate-900"
                } ${disabled ? "opacity-80" : ""}`}
                key={option.value}
              >
                <input
                  checked={form.processSequence === option.value}
                  disabled={disabled}
                  onChange={() => onChange?.("processSequence", option.value)}
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
