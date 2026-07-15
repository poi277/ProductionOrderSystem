import type { ReactNode } from "react";
import { ReadonlyFieldRow, SelectFieldRow, TextFieldRow } from "./DetailFieldRows";

export type OrderHistoryForm = {
  historyId: string;
  productionOrderNo: string;
  productQr: string;
  productName: string;
  processName: string;
  judgment: string;
  defectType: string;
  worker: string;
  equipment: string;
  status: string;
  memo: string;
};

type OrderHistoryFormCardProps = {
  disabled?: boolean;
  form: OrderHistoryForm;
  onChange?: (key: keyof OrderHistoryForm, value: string) => void;
  title?: string;
};

const text = {
  defectType: "불량유형",
  equipment: "설비",
  historyId: "이력번호",
  judgment: "판정",
  memo: "비고",
  processName: "공정명",
  productName: "제품명",
  productQr: "제품 QR",
  productionOrderNo: "생산지시번호",
  status: "상태",
  worker: "작업자",
};

export default function OrderHistoryFormCard({
  disabled = false,
  form,
  onChange,
  title = "이력 세부정보",
}: OrderHistoryFormCardProps) {
  return (
    <section className="h-[560px] overflow-y-auto rounded-lg border border-slate-100 bg-white px-3 py-4">
      {title && (
        <header className="border-b border-slate-100 pb-2">
          <h2 className="mt-0.5 truncate text-base font-bold text-slate-950">{title}</h2>
        </header>
      )}

      <div className="mt-3 flex flex-col gap-3">
        {form.historyId && (
          <ReadonlyFieldRow label={text.historyId} value={form.historyId} />
        )}
        <TextFieldRow disabled={disabled} label={text.productionOrderNo} onChange={(value) => onChange?.("productionOrderNo", value)} value={form.productionOrderNo} />
        <TextFieldRow disabled={disabled} label={text.productQr} onChange={(value) => onChange?.("productQr", value)} required value={form.productQr} />
        <TextFieldRow disabled={disabled} label={text.productName} onChange={(value) => onChange?.("productName", value)} value={form.productName} />
        <TextFieldRow disabled={disabled} label={text.processName} onChange={(value) => onChange?.("processName", value)} value={form.processName} />
        <TextFieldRow disabled={disabled} label={text.judgment} onChange={(value) => onChange?.("judgment", value)} value={form.judgment} />
        <TextFieldRow disabled={disabled} label={text.defectType} onChange={(value) => onChange?.("defectType", value)} value={form.defectType} />
        <TextFieldRow disabled={disabled} label={text.worker} onChange={(value) => onChange?.("worker", value)} value={form.worker} />
        <TextFieldRow disabled={disabled} label={text.equipment} onChange={(value) => onChange?.("equipment", value)} value={form.equipment} />
        <SelectFieldRow disabled={disabled} label={text.status} onChange={(value) => onChange?.("status", value)} value={form.status}>
            <option value="정상">정상</option>
            <option value="불량">불량</option>
        </SelectFieldRow>
        <FormRow label={text.memo}>
          <textarea
            className="min-h-20 w-full resize-none rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-900 outline-none disabled:bg-[#f6f7f9] disabled:font-bold disabled:text-slate-900 focus:border-[#2f80ed]"
            disabled={disabled}
            onChange={(event) => onChange?.("memo", event.target.value)}
            value={form.memo}
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
