"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import OrderShipmentFormCard from "./OrderShipmentFormCard";
import type { OrderShipmentForm } from "./OrderShipmentFormCard";

type OrderShipmentCreatePanelProps = {
  onCancel: () => void;
  submitButtonClassName: string;
};

const orderApiBaseUrl = process.env.NEXT_PUBLIC_ORDER_API_BASE_URL ?? "http://localhost:8080/order";

const text = {
  cancel: "취소",
  saveError: "납품출하 저장에 실패했습니다.",
  saveSuccess: "납품출하가 생성되었습니다.",
  saveUnknownError: "납품출하 저장 중 오류가 발생했습니다.",
  submit: "제출하기",
  submitting: "제출 중",
  title: "새 납품출하 입력",
};

function createProductProcessNo() {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const sequence = String(now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()).padStart(5, "0");

  return `PROC-${date}-${sequence}`;
}

function getCurrentDateTime() {
  const now = new Date();

  return [
    [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-"),
    [String(now.getHours()).padStart(2, "0"), String(now.getMinutes()).padStart(2, "0")].join(":"),
  ].join("T");
}

export default function OrderShipmentCreatePanel({ onCancel, submitButtonClassName }: OrderShipmentCreatePanelProps) {
  const initialForm = useMemo<OrderShipmentForm>(
    () => {
      const now = getCurrentDateTime();

      return {
        productionOrderNo: "",
        productProcessNo: createProductProcessNo(),
        productQr: "",
        processName: "FINAL_INSPECTION",
        isCompleted: "대기",
        shippedAt: "",
        memo: "",
        createdAt: now,
        updatedAt: now,
      };
    },
    [],
  );
  const [form, setForm] = useState<OrderShipmentForm>(initialForm);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const updateForm = (key: keyof OrderShipmentForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus("saving");
    setSubmitMessage("");

    try {
      const response = await fetch(`${orderApiBaseUrl}/shipments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toShipmentRequest(form)),
      });

      if (!response.ok) {
        throw new Error(text.saveError);
      }

      window.dispatchEvent(new CustomEvent<OrderShipmentForm>("shipment-created", { detail: form }));

      const now = getCurrentDateTime();
      setSubmitStatus("success");
      setSubmitMessage(text.saveSuccess);
      setForm({ ...initialForm, productProcessNo: createProductProcessNo(), createdAt: now, updatedAt: now });
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : text.saveUnknownError);
    }
  };

  return (
    <form className="mx-5 mt-4 flex flex-col gap-2" onSubmit={handleSubmit}>
      <OrderShipmentFormCard form={form} onChange={updateForm} title="" />

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

function toShipmentRequest(form: OrderShipmentForm) {
  return {
    shipmentId: form.productProcessNo,
    productQr: form.productQr,
    productionId: form.productionOrderNo || null,
    productProcessNo: form.productProcessNo,
    processName: form.processName,
    completed: form.isCompleted === "완료",
    shippedAt: form.shippedAt || null,
    memo: form.memo,
    createdAt: form.createdAt || null,
    updatedAt: form.updatedAt || null,
  };
}
