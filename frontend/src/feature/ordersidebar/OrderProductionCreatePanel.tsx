"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import OrderProductionFormCard from "./OrderProductionFormCard";
import type { OrderProductionForm } from "./OrderProductionFormCard";
import type { OrderNoOption } from "./OrderProductionFormCard";
import { orderEndpoints } from "../../../lib/endpoints";
import { apiClient, getApiErrorMessage } from "../../../util/apiClient";
import InlineNotice from "../common/InlineNotice";
import CreatePanelActionButtons from "./CreatePanelActionButtons";

type OrderProductionCreatePanelProps = {
  onCancel: () => void;
  submitButtonClassName: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type OrderProductionResponse = {
	purchaseDbId: number | null;
  purchaseId: string | null;
  productName: string | null;
  purchaseQuantity: number | null;
  instructionQuantity: number | null;
  productQrQuantity: number | null;
  completedQuantity: number | null;
  shippedQuantity: number | null;
  status: string | null;
};

type ProductionOrderSelection = {
  orderNo: string;
  productionQuantity: string;
};

const text = {
  cancel: "취소",
  saveError: "생산지시 저장에 실패했습니다.",
  saveSuccess: "생산지시가 생성되었습니다.",
  saveUnknownError: "생산지시 저장 중 오류가 발생했습니다.",
  submit: "입력하기",
  submitting: "제출 중",
  title: "새 생산지시 입력",
};

export default function OrderProductionCreatePanel({ onCancel, submitButtonClassName }: OrderProductionCreatePanelProps) {
  const initialForm = useMemo<OrderProductionForm>(
    () => ({
      orderNo: "",
      customer: "",
      product: "",
      productCodePrefix: "",
      lotNo: "",
      instructionQuantity: "",
      completedQuantity: "0",
      shippedQuantity: "0",
      dueDate: "",
      status: "지시대기",
    }),
    [],
  );
  const [form, setForm] = useState<OrderProductionForm>(initialForm);
  const [orderNoOptions, setOrderNoOptions] = useState<OrderNoOption[]>([]);
  const [selectedPurchaseDbId, setSelectedPurchaseDbId] = useState<number | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    const loadProductionOrderNumbers = async () => {
      try {
        const response = await apiClient(orderEndpoints.productions);

        if (!response.ok) {
          setOrderNoOptions([]);
          return;
        }

        const result = (await response.json()) as ApiResponse<OrderProductionResponse[]>;
		setOrderNoOptions(result.data.flatMap((order) =>
		  order.purchaseDbId !== null && order.purchaseId
			? [{ id: order.purchaseDbId, purchaseId: order.purchaseId, label: `${order.purchaseId}[${order.purchaseQuantity ?? 0}개]` }]
			: []));
      } catch {
        setOrderNoOptions([]);
      }
    };

    void loadProductionOrderNumbers();
  }, []);

  useEffect(() => {
    const handleOrderSelection = (event: Event) => {
      const selection = (event as CustomEvent<ProductionOrderSelection>).detail;
      setForm((current) => ({
        ...current,
        orderNo: selection.orderNo,
        instructionQuantity: selection.productionQuantity,
      }));
    };

    window.addEventListener("production-order-selected-for-create", handleOrderSelection);
    return () => window.removeEventListener("production-order-selected-for-create", handleOrderSelection);
  }, []);

  const updateForm = (key: keyof OrderProductionForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus("saving");
    setSubmitMessage("");

    try {
      const response = await apiClient(orderEndpoints.productions, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
		  purchaseDbId: selectedPurchaseDbId,
          productCodePrefix: form.productCodePrefix,
          lot: form.lotNo,
          productionQuantity: form.instructionQuantity ? Number(form.instructionQuantity) : null,
          productName: form.productCodePrefix,
          purchaseQuantity: form.instructionQuantity ? Number(form.instructionQuantity) : null,
          instructionQuantity: form.instructionQuantity ? Number(form.instructionQuantity) : null,
          productQrQuantity: form.instructionQuantity ? Number(form.instructionQuantity) : null,
          completedQuantity: 0,
          shippedQuantity: 0,
          status: "WAITING",
        }),
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, text.saveError));
      }

      await response.json();
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
	  <OrderProductionFormCard
        compactCreate
        form={form}
        onChange={updateForm}
		orderNoOptions={orderNoOptions}
		onOrderNoSelect={(option) => setSelectedPurchaseDbId(option.id)}
        title=""
      />

      <CreatePanelActionButtons cancelText={text.cancel} isSaving={submitStatus === "saving"} onCancel={onCancel} submitButtonClassName={submitButtonClassName} submitText={text.submit} submittingText={text.submitting} />

      <InlineNotice isError={submitStatus === "error"} message={submitMessage} />
    </form>
  );
}
