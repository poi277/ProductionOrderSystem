"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import OrderProcessFormCard from "./OrderProcessFormCard";
import type { OrderProcessForm } from "./OrderProcessFormCard";

type OrderProcessCreatePanelProps = {
  onCancel: () => void;
  submitButtonClassName: string;
};

const orderApiBaseUrl = process.env.NEXT_PUBLIC_ORDER_API_BASE_URL ?? "http://localhost:8080/order";

const text = {
  cancel: "취소",
  saveError: "생산현황 저장에 실패했습니다.",
  saveSuccess: "생산현황이 생성되었습니다.",
  saveUnknownError: "생산현황 저장 중 오류가 발생했습니다.",
  submit: "제출하기",
  submitting: "제출 중",
  title: "새 생산현황 입력",
};

function createProductQr() {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const sequence = String(now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()).padStart(5, "0");

  return `QR-${date}-${sequence}`;
}

export default function OrderProcessCreatePanel({ onCancel, submitButtonClassName }: OrderProcessCreatePanelProps) {
  const initialForm = useMemo<OrderProcessForm>(
    () => ({
      productionOrderNo: "",
      productQr: createProductQr(),
      productName: "",
      lotNo: "",
      processName: "",
      processSequence: "PRODUCTION_INSTRUCTION_CHECK",
      status: "대기",
      isShipmentTarget: "N",
      startedAt: "",
    }),
    [],
  );
  const [form, setForm] = useState<OrderProcessForm>(initialForm);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const updateForm = (key: keyof OrderProcessForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus("saving");
    setSubmitMessage("");

    try {
      const response = await fetch(`${orderApiBaseUrl}/product-processes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toProductProcessRequest(form)),
      });

      if (!response.ok) {
        throw new Error(text.saveError);
      }

      window.dispatchEvent(new CustomEvent<OrderProcessForm>("product-process-created", { detail: form }));
      setSubmitStatus("success");
      setSubmitMessage(text.saveSuccess);
      setForm({ ...initialForm, productQr: createProductQr() });
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : text.saveUnknownError);
    }
  };

  return (
    <form className="mx-5 mt-4 flex flex-col gap-2" onSubmit={handleSubmit}>
      <OrderProcessFormCard form={form} onChange={updateForm} title="" />

      <div className="flex gap-2">
        <button
          className={`h-8 flex-1 rounded-md ${submitButtonClassName} text-xs font-bold disabled:bg-slate-300`}
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

function toProductProcessRequest(form: OrderProcessForm) {
  return {
    productQr: form.productQr,
    productionId: form.productionOrderNo || null,
    productName: form.productName,
    lot: form.lotNo,
    process: form.processSequence,
  };
}
