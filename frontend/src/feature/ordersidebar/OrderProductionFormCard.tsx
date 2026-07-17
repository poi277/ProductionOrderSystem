"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { NumberFieldRow, SelectFieldRow, TextFieldRow } from "./DetailFieldRows";

export type OrderProductionForm = {
  completedQuantity: string;
  customer: string;
  dueDate: string;
  instructionQuantity: string;
  lotNo: string;
  orderNo: string;
  product: string;
  productCodePrefix: string;
  shippedQuantity: string;
  status: string;
};

export type OrderNoOption = { id: number; label: string; purchaseId: string };

type OrderProductionFormCardProps = {
  compactCreate?: boolean;
  disabled?: boolean;
  form: OrderProductionForm;
  onChange?: (key: keyof OrderProductionForm, value: string) => void;
  onOrderNoSelect?: (option: OrderNoOption) => void;
  orderNoOptions?: OrderNoOption[];
  title?: string;
};

const text = {
  completedQuantity: "\uc644\ub8cc\uc218\ub7c9",
  customer: "\uace0\uac1d\uc0ac",
  dueDate: "\ub0a9\uae30\uc77c",
  instructionQuantity: "\uc9c0\uc2dc\uc218\ub7c9",
  lotNo: "LOT",
  orderNo: "\ubc1c\uc8fc\ubc88\ud638",
  product: "\ud488\uba85",
  productCodePrefix: "제품코드 앞자리",
  productionQuantity: "생산수량",
  shippedQuantity: "\ucd9c\ud558\uc218\ub7c9",
  status: "\uc0c1\ud0dc",
  title: "\uc0dd\uc0b0\uc9c0\uc2dc\u0020\uc138\ubd80\uc815\ubcf4",
};

export default function OrderProductionFormCard({
  compactCreate = false,
  disabled = false,
  form,
  onChange,
  onOrderNoSelect,
  orderNoOptions = [],
  title = text.title,
}: OrderProductionFormCardProps) {
  return (
    <section className="h-[560px] overflow-y-auto rounded-lg border border-slate-100 bg-white px-3 py-4">
      {title && (
        <header className="border-b border-slate-100 pb-2">
          <h2 className="mt-0.5 truncate text-base font-bold text-slate-950">{title}</h2>
        </header>
      )}

      <div className="mt-3 flex flex-col gap-3">
        {compactCreate ? (
          <PreviewFormRow label={text.orderNo}>
            <OrderNoPreviewInput
              disabled={disabled}
			  onChange={(value) => onChange?.("orderNo", value)}
			  onSelect={onOrderNoSelect}
              options={orderNoOptions}
              value={form.orderNo}
            />
          </PreviewFormRow>
        ) : (
          <TextFieldRow disabled={disabled} label={text.orderNo} onChange={(value) => onChange?.("orderNo", value)} required value={form.orderNo} />
        )}
        {compactCreate ? (
          <>
            <TextFieldRow disabled={disabled} label={text.productCodePrefix} onChange={(value) => onChange?.("productCodePrefix", value)} required value={form.productCodePrefix} />
            <TextFieldRow disabled={disabled} label={text.lotNo} onChange={(value) => onChange?.("lotNo", value)} required value={form.lotNo} />
            <NumberFieldRow disabled={disabled} label={text.productionQuantity} min={1} onChange={(value) => onChange?.("instructionQuantity", value)} required value={form.instructionQuantity} />
          </>
        ) : (
          <>
        <TextFieldRow disabled={disabled} label={text.customer} onChange={(value) => onChange?.("customer", value)} value={form.customer} />
        <TextFieldRow disabled={disabled} label={text.product} onChange={(value) => onChange?.("product", value)} required value={form.product} />
        <NumberFieldRow disabled={disabled} label={text.instructionQuantity} min={1} onChange={(value) => onChange?.("instructionQuantity", value)} required value={form.instructionQuantity} />
        <NumberFieldRow disabled={disabled} label={text.completedQuantity} min={0} onChange={(value) => onChange?.("completedQuantity", value)} value={form.completedQuantity} />
        <NumberFieldRow disabled={disabled} label={text.shippedQuantity} min={0} onChange={(value) => onChange?.("shippedQuantity", value)} value={form.shippedQuantity} />
        <TextFieldRow disabled={disabled} label={text.dueDate} onChange={(value) => onChange?.("dueDate", value)} type="date" value={form.dueDate} />
        <SelectFieldRow disabled={disabled} label={text.status} onChange={(value) => onChange?.("status", value)} value={form.status}>
            <option value="지시대기">지시대기</option>
            <option value="생산중">생산중</option>
            <option value="완료">완료</option>
            <option value="출하완료">출하완료</option>
            <option value="마감">마감</option>
            <option value="취소">취소</option>
        </SelectFieldRow>
          </>
        )}
      </div>
    </section>
  );
}

function PreviewFormRow({ label, children }: { children: ReactNode; label: string }) {
  return (
    <div className="grid grid-cols-[84px_minmax(0,1fr)] items-start gap-2 text-xs">
      <span className="pt-2 font-extrabold text-slate-900">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function OrderNoPreviewInput({
  disabled,
  onChange,
  onSelect,
  options,
  value,
}: {
  disabled: boolean;
  onChange: (value: string) => void;
  onSelect?: (option: OrderNoOption) => void;
  options: OrderNoOption[];
  value: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const visibleOptions = useMemo(() => {
    const keyword = value.trim().toLowerCase();

    if (!keyword) {
      return options;
    }

	return options.filter((option) => option.label.toLowerCase().includes(keyword));
  }, [options, value]);

  return (
    <div className="relative">
      <input
        className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-900 outline-none disabled:bg-[#f6f7f9] disabled:font-bold disabled:text-slate-900 focus:border-[#2f80ed]"
        disabled={disabled}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onMouseDown={() => setIsOpen(true)}
        required
        type="text"
        value={value}
      />
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-10 z-30 max-h-40 overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {visibleOptions.length > 0 ? (
            visibleOptions.map((option) => (
              <button
                className="block h-8 w-full px-2.5 text-left text-xs font-bold text-slate-800 hover:bg-slate-100"
				key={option.id}
                onMouseDown={(event) => {
                  event.preventDefault();
				  onChange(option.purchaseId);
				  onSelect?.(option);
                  setIsOpen(false);
                }}
                type="button"
              >
				{option.label}
              </button>
            ))
          ) : (
            <p className="px-2.5 py-2 text-xs font-bold text-slate-400">미리보기 발주번호가 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
}
