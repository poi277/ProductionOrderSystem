"use client";

import { useState } from "react";

type OrderCreatePanelProps = {
  onCancel: () => void;
  onSave: (form: {
    customer: string;
    product: string;
    quantity: string;
    unitPrice: string;
    dueDate: string;
    memo: string;
  }) => void;
};

const initialForm = {
  customer: "",
  product: "",
  quantity: "",
  unitPrice: "",
  dueDate: "",
  memo: "",
};

export default function OrderCreatePanel({ onCancel, onSave }: OrderCreatePanelProps) {
  const [form, setForm] = useState(initialForm);

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <form
      className="flex min-h-[360px] flex-col gap-4 px-5 py-5 lg:min-h-screen"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
    >
      <header>
        <p className="text-sm font-bold text-[#1f4f9a]">주문 생성</p>
        <h2 className="mt-1 text-2xl font-bold">새 발주서 입력</h2>
      </header>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4">
          <Field label="고객사">
            <input
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#2f80ed]"
              onChange={(event) => updateForm("customer", event.target.value)}
              value={form.customer}
            />
          </Field>
          <Field label="품명">
            <input
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#2f80ed]"
              onChange={(event) => updateForm("product", event.target.value)}
              value={form.product}
            />
          </Field>
          <Field label="발주수량">
            <input
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#2f80ed]"
              onChange={(event) => updateForm("quantity", event.target.value)}
              type="number"
              value={form.quantity}
            />
          </Field>
          <Field label="단가">
            <input
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#2f80ed]"
              onChange={(event) => updateForm("unitPrice", event.target.value)}
              type="number"
              value={form.unitPrice}
            />
          </Field>
          <Field label="납기">
            <input
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-[#2f80ed]"
              onChange={(event) => updateForm("dueDate", event.target.value)}
              type="date"
              value={form.dueDate}
            />
          </Field>
          <Field label="메모">
            <textarea
              className="min-h-28 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#2f80ed]"
              onChange={(event) => updateForm("memo", event.target.value)}
              value={form.memo}
            />
          </Field>
        </div>
      </div>

      <div className="mt-auto flex gap-2">
        <button className="h-10 flex-1 rounded-lg bg-[#143f80] text-sm font-bold text-white" type="submit">
          저장
        </button>
        <button
          className="h-10 flex-1 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-500"
          onClick={onCancel}
          type="button"
        >
          취소
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-bold text-slate-600">
      {label}
      {children}
    </label>
  );
}
