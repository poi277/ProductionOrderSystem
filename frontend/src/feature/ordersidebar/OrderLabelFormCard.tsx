import { TextFieldRow } from "./DetailFieldRows";

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
        <TextFieldRow disabled={disabled} label={text.productionOrderId} onChange={(value) => onChange?.("productionOrderId", value)} value={form.productionOrderId} />
        <TextFieldRow disabled={disabled} label={text.productionOrderNo} onChange={(value) => onChange?.("productionOrderNo", value)} value={form.productionOrderNo} />
        <TextFieldRow disabled={disabled} label={text.qrData} onChange={(value) => onChange?.("qrData", value)} required value={form.qrData} />
        <TextFieldRow disabled={disabled} label={text.title} onChange={(value) => onChange?.("title", value)} value={form.title} />
        <TextFieldRow disabled={disabled} label={text.line1} onChange={(value) => onChange?.("line1", value)} value={form.line1} />
        <TextFieldRow disabled={disabled} label={text.line2} onChange={(value) => onChange?.("line2", value)} value={form.line2} />
        <TextFieldRow disabled={disabled} label={text.printedAt} onChange={(value) => onChange?.("printedAt", value)} type="datetime-local" value={form.printedAt} />
        <TextFieldRow disabled={disabled} label={text.createdAt} onChange={(value) => onChange?.("createdAt", value)} type="datetime-local" value={form.createdAt} />
        <TextFieldRow disabled={disabled} label={text.updatedAt} onChange={(value) => onChange?.("updatedAt", value)} type="datetime-local" value={form.updatedAt} />
      </div>
    </section>
  );
}
