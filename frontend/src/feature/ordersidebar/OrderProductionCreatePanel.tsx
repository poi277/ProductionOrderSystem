"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import OrderProductionFormCard from "./OrderProductionFormCard";
import type { OrderProductionForm } from "./OrderProductionFormCard";

type OrderProductionCreatePanelProps = {
  onCancel: () => void;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type OrderProductionResponse = {
  productionId: string;
  purchaseId: string | null;
  productName: string | null;
  purchaseQuantity: number | null;
  instructionQuantity: number | null;
  productQrQuantity: number | null;
  completedQuantity: number | null;
  shippedQuantity: number | null;
  status: string | null;
};

const orderApiBaseUrl = process.env.NEXT_PUBLIC_ORDER_API_BASE_URL ?? "http://localhost:8080/order";

const text = {
  cancel: "취소",
  saveError: "생산지시 저장에 실패했습니다.",
  saveSuccess: "생산지시가 생성되었습니다.",
  saveUnknownError: "생산지시 저장 중 오류가 발생했습니다.",
  submit: "제출하기",
  submitting: "제출 중",
  title: "새 생산지시 입력",
};

function createProductionOrderNo() {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const sequence = String(now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()).padStart(5, "0");

  return `PRD-${date}-${sequence}`;
}

export default function OrderProductionCreatePanel({ onCancel }: OrderProductionCreatePanelProps) {
  const initialForm = useMemo<OrderProductionForm>(
    () => ({
      orderNo: "",
      productionOrderNo: createProductionOrderNo(),
      customer: "",
      product: "",
      instructionQuantity: "",
      completedQuantity: "0",
      shippedQuantity: "0",
      dueDate: "",
      status: "지시대기",
    }),
    [],
  );
  const [form, setForm] = useState<OrderProductionForm>(initialForm);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const updateForm = (key: keyof OrderProductionForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus("saving");
    setSubmitMessage("");

    try {
      const response = await fetch(`${orderApiBaseUrl}/productions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productionId: form.productionOrderNo,
          purchaseId: form.orderNo || null,
          productName: form.product,
          purchaseQuantity: form.instructionQuantity ? Number(form.instructionQuantity) : null,
          instructionQuantity: form.instructionQuantity ? Number(form.instructionQuantity) : null,
          productQrQuantity: form.instructionQuantity ? Number(form.instructionQuantity) : null,
          completedQuantity: form.completedQuantity ? Number(form.completedQuantity) : 0,
          shippedQuantity: form.shippedQuantity ? Number(form.shippedQuantity) : 0,
          status: toProductionStatus(form.status),
        }),
      });

      if (!response.ok) {
        throw new Error(text.saveError);
      }

      const result = (await response.json()) as ApiResponse<OrderProductionResponse>;

      window.dispatchEvent(new CustomEvent<OrderProductionResponse>("production-order-created", { detail: result.data }));
      setSubmitStatus("success");
      setSubmitMessage(text.saveSuccess);
      setForm({ ...initialForm, productionOrderNo: createProductionOrderNo() });
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : text.saveUnknownError);
    }
  };

  return (
    <form className="mx-5 mt-4 flex flex-col gap-2" onSubmit={handleSubmit}>
      <OrderProductionFormCard form={form} onChange={updateForm} title={text.title} />

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

function toProductionStatus(status: string) {
  switch (status) {
    case "지시대기":
      return "WAITING";
    case "생산중":
      return "IN_PROGRESS";
    case "완료":
      return "COMPLETED";
    case "출하완료":
      return "SHIPPED";
    case "취소":
      return "CANCELED";
    default:
      return "WAITING";
  }
}
