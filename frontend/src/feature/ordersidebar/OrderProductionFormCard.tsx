"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";

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

type OrderProductionFormCardProps = {
  compactCreate?: boolean;
  disabled?: boolean;
  form: OrderProductionForm;
  onChange?: (key: keyof OrderProductionForm, value: string) => void;
  orderNoOptions?: string[];
  title?: string;
};

const text = {
  completedQuantity: "\uc644\ub8cc\uc218\ub7c9",
  customer: "\uace0\uac1d\uc0ac",
  dueDate: "\ub0a9\uae30",
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
              options={orderNoOptions}
              value={form.orderNo}
            />
          </PreviewFormRow>
        ) : (
          <FormRow label={text.orderNo}>
            <TextInput
              disabled={disabled}
              onChange={(value) => onChange?.("orderNo", value)}
              required
              value={form.orderNo}
            />
          </FormRow>
        )}
        {compactCreate ? (
          <>
            <FormRow label={text.productCodePrefix}>
              <TextInput
                disabled={disabled}
                onChange={(value) => onChange?.("productCodePrefix", value)}
                required
                value={form.productCodePrefix}
              />
            </FormRow>
            <FormRow label={text.lotNo}>
              <TextInput disabled={disabled} onChange={(value) => onChange?.("lotNo", value)} required value={form.lotNo} />
            </FormRow>
            <FormRow label={text.productionQuantity}>
              <TextInput
                disabled={disabled}
                min={1}
                onChange={(value) => onChange?.("instructionQuantity", value)}
                required
                type="number"
                value={form.instructionQuantity}
              />
            </FormRow>
          </>
        ) : (
          <>
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
          </>
        )}
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
  options,
  value,
}: {
  disabled: boolean;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const visibleOptions = useMemo(() => {
    const keyword = value.trim().toLowerCase();

    if (!keyword) {
      return options;
    }

    return options.filter((option) => option.toLowerCase().includes(keyword));
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
                key={option}
                onMouseDown={(event) => {
                  event.preventDefault();
                  onChange(option);
                  setIsOpen(false);
                }}
                type="button"
              >
                {option}
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
