"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import OrderLabelFormCard from "./OrderLabelFormCard";
import type { OrderLabelForm } from "./OrderLabelFormCard";
import { orderEndpoints } from "../../../lib/endpoints";
import { apiClient, getApiErrorMessage } from "../../../util/apiClient";
import InlineNotice from "../common/InlineNotice";
import CreatePanelActionButtons from "./CreatePanelActionButtons";

type OrderLabelCreatePanelProps = {
  onCancel: () => void;
  submitButtonClassName: string;
};

const text = {
  cancel: "취소",
  saveError: "라벨 저장에 실패했습니다.",
  saveSuccess: "라벨이 생성되었습니다.",
  saveUnknownError: "라벨 저장 중 오류가 발생했습니다.",
  submit: "입력하기",
  submitting: "제출 중",
  title: "새 라벨 입력",
};

function createQrData() {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const sequence = String(now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()).padStart(5, "0");

  return `LABEL-${date}-${sequence}`;
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

export default function OrderLabelCreatePanel({ onCancel, submitButtonClassName }: OrderLabelCreatePanelProps) {
  const initialForm = useMemo<OrderLabelForm>(() => {
    const now = getCurrentDateTime();

    return {
      productionOrderId: "",
      productionOrderNo: "",
      qrData: createQrData(),
      title: "",
      line1: "",
      line2: "",
      printedAt: "",
      createdAt: now,
      updatedAt: now,
    };
  }, []);
  const [form, setForm] = useState<OrderLabelForm>(initialForm);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const updateForm = (key: keyof OrderLabelForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus("saving");
    setSubmitMessage("");

    try {
      const response = await apiClient(orderEndpoints.labels, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toLabelRequest(form)),
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, text.saveError));
      }

      window.dispatchEvent(new CustomEvent<OrderLabelForm>("label-created", { detail: form }));

      const now = getCurrentDateTime();
      setSubmitStatus("success");
      setSubmitMessage(text.saveSuccess);
      setForm({ ...initialForm, qrData: createQrData(), createdAt: now, updatedAt: now });
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : text.saveUnknownError);
    }
  };

  return (
    <form className="mx-5 mt-4 flex flex-col gap-2" onSubmit={handleSubmit}>
      <OrderLabelFormCard form={form} onChange={updateForm} title="" />

      <CreatePanelActionButtons cancelText={text.cancel} isSaving={submitStatus === "saving"} onCancel={onCancel} submitButtonClassName={submitButtonClassName} submitText={text.submit} submittingText={text.submitting} />

      <InlineNotice isError={submitStatus === "error"} message={submitMessage} />
    </form>
  );
}

function toLabelRequest(form: OrderLabelForm) {
  return {
    productQr: form.qrData,
    productionOrderId: form.productionOrderId || null,
    productionOrderNo: form.productionOrderNo || null,
    productName: form.title || null,
    title: form.title,
    line1: form.line1,
    line2: form.line2,
    printedAt: form.printedAt || null,
    createdAt: form.createdAt || null,
    updatedAt: form.updatedAt || null,
  };
}
