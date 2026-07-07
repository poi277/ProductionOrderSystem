"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import OrderHistoryFormCard from "./OrderHistoryFormCard";
import type { OrderHistoryForm } from "./OrderHistoryFormCard";

type OrderHistoryCreatePanelProps = {
  onCancel: () => void;
};

const orderApiBaseUrl = process.env.NEXT_PUBLIC_ORDER_API_BASE_URL ?? "http://localhost:8080/order";

const text = {
  cancel: "취소",
  saveError: "이력 저장에 실패했습니다.",
  saveSuccess: "이력이 생성되었습니다.",
  saveUnknownError: "이력 저장 중 오류가 발생했습니다.",
  submit: "제출하기",
  submitting: "제출 중",
  title: "이력",
};

export default function OrderHistoryCreatePanel({ onCancel }: OrderHistoryCreatePanelProps) {
  const initialForm = useMemo<OrderHistoryForm>(
    () => ({
      historyId: "",
      productionOrderNo: "",
      productQr: "",
      productName: "",
      processName: "",
      judgment: "",
      defectType: "",
      worker: "",
      equipment: "",
      status: "정상",
      memo: "",
    }),
    [],
  );
  const [form, setForm] = useState<OrderHistoryForm>(initialForm);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const updateForm = (key: keyof OrderHistoryForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus("saving");
    setSubmitMessage("");

    try {
      const response = await fetch(`${orderApiBaseUrl}/histories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toHistoryRequest(form)),
      });

      if (!response.ok) {
        throw new Error(text.saveError);
      }

      const result = (await response.json()) as { data?: { historyId?: number } };
      const savedForm = { ...form, historyId: result.data?.historyId ? String(result.data.historyId) : "" };

      window.dispatchEvent(new CustomEvent<OrderHistoryForm>("history-created", { detail: savedForm }));
      setSubmitStatus("success");
      setSubmitMessage(text.saveSuccess);
      setForm(initialForm);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : text.saveUnknownError);
    }
  };

  return (
    <form className="mx-5 mt-4 flex flex-col gap-2" onSubmit={handleSubmit}>
      <OrderHistoryFormCard form={form} onChange={updateForm} title={text.title} />

      <div className="flex gap-2">
        <button
          className="h-8 flex-1 rounded-md bg-[#143f80] text-xs font-bold text-white disabled:bg-slate-300"
          disabled={submitStatus === "saving"}
          type="submit"
        >
          {submitStatus === "saving" ? text.submitting : text.submit}
        </button>
        <button
          className="h-8 flex-1 rounded-md border border-slate-200 bg-white text-xs font-bold text-slate-500"
          onClick={onCancel}
          type="button"
        >
          {text.cancel}
        </button>
      </div>

      {submitMessage && (
        <p className={`text-xs font-bold ${submitStatus === "error" ? "text-red-600" : "text-emerald-600"}`}>
          {submitMessage}
        </p>
      )}
    </form>
  );
}

function toHistoryRequest(form: OrderHistoryForm) {
  return {
    productQr: form.productQr,
    productionId: form.productionOrderNo || null,
    productName: form.productName,
    processName: form.processName,
    judgment: form.judgment,
    defectType: form.defectType,
    worker: form.worker,
    equipment: form.equipment,
    note: form.memo,
    status: form.status === "불량" ? "DEFECTIVE" : "NORMAL",
  };
}
