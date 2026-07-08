"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { Order } from "../order/OrdersTypes";
import OrderHistoryFormCard from "./OrderHistoryFormCard";
import type { OrderHistoryForm } from "./OrderHistoryFormCard";
import OrderLabelFormCard from "./OrderLabelFormCard";
import type { OrderLabelForm } from "./OrderLabelFormCard";
import OrderProcessFormCard from "./OrderProcessFormCard";
import type { OrderProcessForm } from "./OrderProcessFormCard";
import OrderProductionFormCard from "./OrderProductionFormCard";
import type { OrderProductionForm } from "./OrderProductionFormCard";
import OrderPurchaseFormCard from "./OrderPurchaseFormCard";
import type { OrderPurchaseForm } from "./OrderPurchaseFormCard";
import OrderShipmentFormCard from "./OrderShipmentFormCard";
import type { OrderShipmentForm } from "./OrderShipmentFormCard";

type OrderDetailPanelProps = {
  order: Order | null;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type OrderPurchaseResponse = {
  purchaseId: string;
  customer: string | null;
  productName: string | null;
  quantity: number | null;
  price: number | null;
  purchaseDate: string | null;
  dueDate: string | null;
  status: string | null;
  note: string | null;
};

const orderApiBaseUrl = process.env.NEXT_PUBLIC_ORDER_API_BASE_URL ?? "http://localhost:8080/order";

const productProcessLabels: Record<string, string> = {
  PRODUCTION_INSTRUCTION_CHECK: "생산지시",
  ASSEMBLY: "조립",
  FUNCTION_TEST: "기능검사",
  SHIPMENT_INSPECTION: "출하검사",
  SHIPMENT: "출하완료",
};

const text = {
  emptyDescription:
    "\ubaa9\ub85d\uc5d0\uc11c\u0020\ubc1c\uc8fc\uc11c\ub97c\u0020\uc120\ud0dd\ud558\uac70\ub098\u0020\uc8fc\ubb38\u0020\uc0dd\uc131\uc744\u0020\uc2dc\uc791\ud558\uc138\uc694\u002e",
  emptyTitle: "\uc120\ud0dd\ub41c\u0020\ubc1c\uc8fc\uc11c\uac00\u0020\uc5c6\uc2b5\ub2c8\ub2e4\u002e",
  saveError: "\ubc1c\uc8fc\uc11c\u0020\uc218\uc815\uc5d0\u0020\uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4\u002e",
  saveSuccess: "\ubc1c\uc8fc\uc11c\uac00\u0020\uc218\uc815\ub418\uc5c8\uc2b5\ub2c8\ub2e4\u002e",
  saveUnknownError:
    "\ubc1c\uc8fc\uc11c\u0020\uc218\uc815\u0020\uc911\u0020\uc624\ub958\uac00\u0020\ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4\u002e",
  delete: "\uc0ad\uc81c\ud558\uae30",
  deleteConfirm: "\uc815\ub9d0\ub85c\u0020\uc0ad\uc81c\ud558\uc2dc\uaca0\uc5b4\uc694\u003f",
  deleteError: "\ubc1c\uc8fc\uc11c\u0020\uc0ad\uc81c\uc5d0\u0020\uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4\u002e",
  deleteSuccess: "\ubc1c\uc8fc\uc11c\uac00\u0020\uc0ad\uc81c\ub418\uc5c8\uc2b5\ub2c8\ub2e4\u002e",
  no: "\uc544\ub2c8\uc624",
  title: "\ubc1c\uc8fc\uc11c\u0020\uc138\ubd80\uc815\ubcf4",
  update: "\uc218\uc815\ud558\uae30",
  updating: "\uc218\uc815\u0020\uc911",
  updateComplete: "\uc218\uc815\u0020\uc644\ub8cc",
  yes: "\uc608",
};

function toForm(order: Order): OrderPurchaseForm {
  return {
    purchaseId: order.orderNo,
    orderDate: order.orderDate === "-" ? "" : order.orderDate.replaceAll(".", "-"),
    customer: order.customer === "-" ? "" : order.customer,
    product: order.product === "-" ? "" : order.product,
    quantity: order.quantity === "-" ? "" : order.quantity.replaceAll(",", ""),
    unitPrice: order.unitPrice === "-" ? "" : order.unitPrice.replaceAll(",", ""),
    dueDate: order.dueDate === "-" ? "" : order.dueDate.replaceAll(".", "-"),
    memo: order.memo === "-" ? "" : order.memo,
    status: toPurchaseStatus(order.status),
  };
}

function toProductionForm(order: Order): OrderProductionForm {
  return {
    orderNo: order.orderNo,
    customer: order.customer === "-" ? "" : order.customer,
    product: order.product === "-" ? "" : order.product,
    productCodePrefix: "",
    lotNo: order.lotNo ?? "",
    instructionQuantity: (order.instructionQuantity ?? order.quantity).replaceAll(",", ""),
    completedQuantity: (order.completedQuantity ?? "0").replaceAll(",", ""),
    shippedQuantity: (order.shippedQuantity ?? "0").replaceAll(",", ""),
    dueDate: order.dueDate === "-" ? "" : order.dueDate.replaceAll(".", "-"),
    status: order.status,
  };
}

function toProcessForm(order: Order): OrderProcessForm {
  return {
    productionOrderNo: order.productionOrderNo ?? order.orderNo,
    productQr: order.productQr ?? "",
    productName: order.product === "-" ? "" : order.product,
    lotNo: order.lotNo ?? "",
    processName: order.processName ?? "",
    processSequence: toProductProcessCode(order.processSequence ?? order.processName ?? ""),
    status: order.status,
    isShipmentTarget: order.isShipmentTarget ?? "N",
    startedAt: toDateTimeInputValue(order.startedAt ?? ""),
  };
}

function toShipmentForm(order: Order): OrderShipmentForm {
  return {
    productionOrderNo: order.productionOrderNo ?? order.orderNo,
    productProcessNo: order.productProcessNo ?? "",
    productQr: order.productQr ?? order.product,
    processName: order.processName ?? "",
    isCompleted: order.status,
    shippedAt: toDateTimeInputValue(order.shippedAt ?? order.dueDate),
    memo: order.memo === "-" ? "" : order.memo,
    createdAt: toDateTimeInputValue(order.createdAt ?? order.orderDate),
    updatedAt: toDateTimeInputValue(order.updatedAt ?? ""),
  };
}

function toLabelForm(order: Order): OrderLabelForm {
  return {
    productionOrderId: order.productionOrderId ?? "",
    productionOrderNo: order.productionOrderNo ?? order.orderNo,
    qrData: order.qrData ?? order.productQr ?? "",
    title: order.title ?? order.product,
    line1: order.line1 ?? "",
    line2: order.line2 ?? "",
    printedAt: toDateTimeInputValue(order.printedAt ?? order.dueDate),
    createdAt: toDateTimeInputValue(order.createdAt ?? order.orderDate),
    updatedAt: toDateTimeInputValue(order.updatedAt ?? ""),
  };
}

function toHistoryForm(order: Order): OrderHistoryForm {
  return {
    historyId: order.historyId ? String(order.historyId) : "",
    productionOrderNo: order.productionOrderNo ?? order.orderNo,
    productQr: order.productQr ?? "",
    productName: order.product === "-" ? "" : order.product,
    processName: order.processName ?? "",
    judgment: order.judgment ?? "",
    defectType: order.defectType ?? "",
    worker: order.worker ?? "",
    equipment: order.equipment ?? "",
    status: order.status,
    memo: order.memo === "-" ? "" : order.memo,
  };
}

function toDateTimeInputValue(value: string) {
  if (!value || value === "-") {
    return "";
  }

  if (value.includes("T")) {
    return value;
  }

  return value.replaceAll(".", "-").replace(" ", "T");
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

function toProductProcessCode(value: string) {
  if (productProcessLabels[value]) {
    return value;
  }

  const found = Object.entries(productProcessLabels).find(([, label]) => label === value);
  return found?.[0] ?? "PRODUCTION_INSTRUCTION_CHECK";
}

export default function OrderDetailPanel({ order }: OrderDetailPanelProps) {
  const [form, setForm] = useState<OrderPurchaseForm | null>(order ? toForm(order) : null);
  const [productionForm, setProductionForm] = useState<OrderProductionForm | null>(
    order?.detailType === "production" ? toProductionForm(order) : null,
  );
  const [processForm, setProcessForm] = useState<OrderProcessForm | null>(
    order?.detailType === "process" ? toProcessForm(order) : null,
  );
  const [shipmentForm, setShipmentForm] = useState<OrderShipmentForm | null>(
    order?.detailType === "shipment" ? toShipmentForm(order) : null,
  );
  const [labelForm, setLabelForm] = useState<OrderLabelForm | null>(
    order?.detailType === "label" ? toLabelForm(order) : null,
  );
  const [historyForm, setHistoryForm] = useState<OrderHistoryForm | null>(
    order?.detailType === "history" ? toHistoryForm(order) : null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  if (!order || !form) {
    return (
      <div className="px-5 py-4">
        <section className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-700">{text.emptyTitle}</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">{text.emptyDescription}</p>
        </section>
      </div>
    );
  }

  if (order.detailType === "label") {
    const initialLabelForm = toLabelForm(order);
    const hasLabelChanges =
      labelForm !== null &&
      (Object.keys(initialLabelForm) as Array<keyof OrderLabelForm>).some(
        (key) => (labelForm[key] ?? "") !== (initialLabelForm[key] ?? ""),
      );

    const updateLabelForm = (key: keyof OrderLabelForm, value: string) => {
      setLabelForm((current) => (current ? { ...current, [key]: value } : current));
    };

    const handleLabelSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!isEditing) {
        setIsEditing(true);
        return;
      }

      if (!labelForm || !hasLabelChanges) {
        return;
      }

      setSubmitStatus("saving");
      setSubmitMessage("");

      try {
        const response = await fetch(`${orderApiBaseUrl}/labels/${encodeURIComponent(order.qrData ?? order.productQr ?? "")}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(toLabelRequest(labelForm)),
        });

        if (!response.ok) {
          throw new Error("라벨 수정에 실패했습니다.");
        }

        setSubmitStatus("success");
        setSubmitMessage("라벨이 수정되었습니다.");
        setIsEditing(false);
        window.dispatchEvent(
          new CustomEvent<{ labelId: number; order: OrderLabelForm }>("label-updated", {
            detail: {
              labelId: order.id,
              order: labelForm,
            },
          }),
        );
      } catch (error) {
        setSubmitStatus("error");
        setSubmitMessage(error instanceof Error ? error.message : "라벨 수정 중 오류가 발생했습니다.");
      } finally {
        setSubmitStatus((current) => (current === "saving" ? "idle" : current));
      }
    };

    const handleLabelDelete = async () => {
      setSubmitStatus("saving");
      setSubmitMessage("");

      try {
        const response = await fetch(`${orderApiBaseUrl}/labels/${encodeURIComponent(order.qrData ?? order.productQr ?? "")}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("라벨 삭제에 실패했습니다.");
        }

        setSubmitStatus("success");
        setSubmitMessage("라벨이 삭제되었습니다.");
        setIsDeleteConfirmOpen(false);
        window.dispatchEvent(new CustomEvent<number>("label-deleted", { detail: order.id }));
      } catch (error) {
        setSubmitStatus("error");
        setSubmitMessage(error instanceof Error ? error.message : "라벨 삭제 중 오류가 발생했습니다.");
      } finally {
        setSubmitStatus((current) => (current === "saving" ? "idle" : current));
      }
    };

    return (
      <form className="mx-5 mt-4 flex flex-col gap-2" onSubmit={handleLabelSubmit}>
        <OrderLabelFormCard
          disabled={!isEditing}
          form={labelForm ?? initialLabelForm}
          onChange={updateLabelForm}
        />

        <div className="flex gap-2">
          <button
            className="h-8 flex-1 rounded-md bg-black text-xs font-bold text-white disabled:bg-slate-300"
            disabled={submitStatus === "saving" || (isEditing && !hasLabelChanges)}
            type="submit"
          >
            {isEditing ? text.updateComplete : text.update}
          </button>
          <button
            className="h-8 flex-1 rounded-md border border-red-100 bg-white text-xs font-bold text-red-600 disabled:text-slate-300"
            disabled={submitStatus === "saving"}
            onClick={() => setIsDeleteConfirmOpen(true)}
            type="button"
          >
            {text.delete}
          </button>
        </div>

        {submitMessage && (
          <p className={`text-xs font-bold ${submitStatus === "error" ? "text-red-600" : "text-emerald-600"}`}>
            {submitMessage}
          </p>
        )}

        <DeleteConfirmDialog
          disabled={submitStatus === "saving"}
          isOpen={isDeleteConfirmOpen}
          onCancel={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleLabelDelete}
        />
      </form>
    );
  }

  if (order.detailType === "history") {
    const initialHistoryForm = toHistoryForm(order);
    const hasHistoryChanges =
      historyForm !== null &&
      (Object.keys(initialHistoryForm) as Array<keyof OrderHistoryForm>).some(
        (key) => (historyForm[key] ?? "") !== (initialHistoryForm[key] ?? ""),
      );

    const updateHistoryForm = (key: keyof OrderHistoryForm, value: string) => {
      setHistoryForm((current) => (current ? { ...current, [key]: value } : current));
    };

    const handleHistorySubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!isEditing) {
        setIsEditing(true);
        return;
      }

      if (!historyForm || !hasHistoryChanges || !order.historyId) {
        return;
      }

      setSubmitStatus("saving");
      setSubmitMessage("");

      try {
        const response = await fetch(`${orderApiBaseUrl}/histories/${order.historyId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(toHistoryRequest(historyForm)),
        });

        if (!response.ok) {
          throw new Error("이력 수정에 실패했습니다.");
        }

        setSubmitStatus("success");
        setSubmitMessage("이력이 수정되었습니다.");
        setIsEditing(false);
        window.dispatchEvent(
          new CustomEvent<{ historyId: number; order: OrderHistoryForm }>("history-updated", {
            detail: {
              historyId: order.id,
              order: historyForm,
            },
          }),
        );
      } catch (error) {
        setSubmitStatus("error");
        setSubmitMessage(error instanceof Error ? error.message : "이력 수정 중 오류가 발생했습니다.");
      } finally {
        setSubmitStatus((current) => (current === "saving" ? "idle" : current));
      }
    };

    const handleHistoryDelete = async () => {
      if (!order.historyId) {
        return;
      }

      setSubmitStatus("saving");
      setSubmitMessage("");

      try {
        const response = await fetch(`${orderApiBaseUrl}/histories/${order.historyId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("이력 삭제에 실패했습니다.");
        }

        setSubmitStatus("success");
        setSubmitMessage("이력이 삭제되었습니다.");
        setIsDeleteConfirmOpen(false);
        window.dispatchEvent(new CustomEvent<number>("history-deleted", { detail: order.id }));
      } catch (error) {
        setSubmitStatus("error");
        setSubmitMessage(error instanceof Error ? error.message : "이력 삭제 중 오류가 발생했습니다.");
      } finally {
        setSubmitStatus((current) => (current === "saving" ? "idle" : current));
      }
    };

    return (
      <form className="mx-5 mt-4 flex flex-col gap-2" onSubmit={handleHistorySubmit}>
        <OrderHistoryFormCard
          disabled={!isEditing}
          form={historyForm ?? initialHistoryForm}
          onChange={updateHistoryForm}
          title=""
        />

        <div className="flex gap-2">
          <button
            className="h-8 flex-1 rounded-md bg-black text-xs font-bold text-white disabled:bg-slate-300"
            disabled={submitStatus === "saving" || (isEditing && !hasHistoryChanges)}
            type="submit"
          >
            {isEditing ? text.updateComplete : text.update}
          </button>
          <button
            className="h-8 flex-1 rounded-md border border-red-100 bg-white text-xs font-bold text-red-600 disabled:text-slate-300"
            disabled={submitStatus === "saving"}
            onClick={() => setIsDeleteConfirmOpen(true)}
            type="button"
          >
            {text.delete}
          </button>
        </div>

        {submitMessage && (
          <p className={`text-xs font-bold ${submitStatus === "error" ? "text-red-600" : "text-emerald-600"}`}>
            {submitMessage}
          </p>
        )}

        <DeleteConfirmDialog
          disabled={submitStatus === "saving"}
          isOpen={isDeleteConfirmOpen}
          onCancel={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleHistoryDelete}
        />
      </form>
    );
  }

  if (order.detailType === "shipment") {
    const initialShipmentForm = toShipmentForm(order);
    const hasShipmentChanges =
      shipmentForm !== null &&
      (Object.keys(initialShipmentForm) as Array<keyof OrderShipmentForm>).some(
        (key) => (shipmentForm[key] ?? "") !== (initialShipmentForm[key] ?? ""),
      );

    const updateShipmentForm = (key: keyof OrderShipmentForm, value: string) => {
      setShipmentForm((current) => (current ? { ...current, [key]: value } : current));
    };

    const handleShipmentSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!isEditing) {
        setIsEditing(true);
        return;
      }

      if (!shipmentForm || !hasShipmentChanges) {
        return;
      }

      setSubmitStatus("saving");
      setSubmitMessage("");

      try {
        const response = await fetch(`${orderApiBaseUrl}/shipments/${encodeURIComponent(order.productProcessNo ?? "")}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(toShipmentRequest(shipmentForm)),
        });

        if (!response.ok) {
          throw new Error("납품출하 수정에 실패했습니다.");
        }

        setSubmitStatus("success");
        setSubmitMessage("납품출하가 수정되었습니다.");
        setIsEditing(false);
        window.dispatchEvent(
          new CustomEvent<{ shipmentId: number; order: OrderShipmentForm }>("shipment-updated", {
            detail: {
              shipmentId: order.id,
              order: shipmentForm,
            },
          }),
        );
      } catch (error) {
        setSubmitStatus("error");
        setSubmitMessage(error instanceof Error ? error.message : "납품출하 수정 중 오류가 발생했습니다.");
      }
    };

    const handleShipmentDelete = async () => {
      setSubmitStatus("saving");
      setSubmitMessage("");

      try {
        const response = await fetch(`${orderApiBaseUrl}/shipments/${encodeURIComponent(order.productProcessNo ?? "")}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("납품출하 삭제에 실패했습니다.");
        }

        setSubmitStatus("success");
        setSubmitMessage("납품출하가 삭제되었습니다.");
        setIsDeleteConfirmOpen(false);
        window.dispatchEvent(new CustomEvent<number>("shipment-deleted", { detail: order.id }));
      } catch (error) {
        setSubmitStatus("error");
        setSubmitMessage(error instanceof Error ? error.message : "납품출하 삭제 중 오류가 발생했습니다.");
      }
    };

    return (
      <form className="mx-5 mt-4 flex flex-col gap-2" onSubmit={handleShipmentSubmit}>
        <OrderShipmentFormCard
          disabled={!isEditing}
          form={shipmentForm ?? initialShipmentForm}
          onChange={updateShipmentForm}
          title=""
        />

        <div className="flex gap-2">
          <button
            className="h-8 flex-1 rounded-md bg-black text-xs font-bold text-white disabled:bg-slate-300"
            disabled={submitStatus === "saving" || (isEditing && !hasShipmentChanges)}
            type="submit"
          >
            {isEditing ? text.updateComplete : text.update}
          </button>
          <button
            className="h-8 flex-1 rounded-md border border-red-100 bg-white text-xs font-bold text-red-600 disabled:text-slate-300"
            disabled={submitStatus === "saving"}
            onClick={() => setIsDeleteConfirmOpen(true)}
            type="button"
          >
            {text.delete}
          </button>
        </div>

        {submitMessage && (
          <p className={`text-xs font-bold ${submitStatus === "error" ? "text-red-600" : "text-emerald-600"}`}>
            {submitMessage}
          </p>
        )}

        <DeleteConfirmDialog
          disabled={submitStatus === "saving"}
          isOpen={isDeleteConfirmOpen}
          onCancel={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleShipmentDelete}
        />
      </form>
    );
  }

  if (order.detailType === "process") {
    const initialProcessForm = toProcessForm(order);
    const hasProcessChanges =
      processForm !== null &&
      (Object.keys(initialProcessForm) as Array<keyof OrderProcessForm>).some(
        (key) => (processForm[key] ?? "") !== (initialProcessForm[key] ?? ""),
      );

    const updateProcessForm = (key: keyof OrderProcessForm, value: string) => {
      setProcessForm((current) => (current ? { ...current, [key]: value } : current));
    };

    const handleProcessSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!isEditing) {
        setIsEditing(true);
        return;
      }

      if (!processForm || !hasProcessChanges) {
        return;
      }

      setSubmitStatus("saving");
      setSubmitMessage("");

      try {
        const response = await fetch(`${orderApiBaseUrl}/product-processes/${encodeURIComponent(order.productQr ?? "")}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(toProductProcessRequest(processForm)),
        });

        if (!response.ok) {
          throw new Error("생산현황 수정에 실패했습니다.");
        }

        setSubmitStatus("success");
        setSubmitMessage("생산현황이 수정되었습니다.");
        setIsEditing(false);
        window.dispatchEvent(
          new CustomEvent<{ processId: number; order: OrderProcessForm }>("product-process-updated", {
            detail: {
              processId: order.id,
              order: processForm,
            },
          }),
        );
      } catch (error) {
        setSubmitStatus("error");
        setSubmitMessage(error instanceof Error ? error.message : "생산현황 수정 중 오류가 발생했습니다.");
      }
    };

    const handleProcessDelete = async () => {
      setSubmitStatus("saving");
      setSubmitMessage("");

      try {
        const response = await fetch(`${orderApiBaseUrl}/product-processes/${encodeURIComponent(order.productQr ?? "")}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("생산현황 삭제에 실패했습니다.");
        }

        setSubmitStatus("success");
        setSubmitMessage("생산현황이 삭제되었습니다.");
        setIsDeleteConfirmOpen(false);
        window.dispatchEvent(new CustomEvent<number>("product-process-deleted", { detail: order.id }));
      } catch (error) {
        setSubmitStatus("error");
        setSubmitMessage(error instanceof Error ? error.message : "생산현황 삭제 중 오류가 발생했습니다.");
      }
    };

    return (
      <form className="mx-5 mt-4 flex flex-col gap-2" onSubmit={handleProcessSubmit}>
        <OrderProcessFormCard
          disabled={!isEditing}
          form={processForm ?? initialProcessForm}
          onChange={updateProcessForm}
          title=""
        />

        <div className="flex gap-2">
          <button
            className="h-8 flex-1 rounded-md bg-black text-xs font-bold text-white disabled:bg-slate-300"
            disabled={submitStatus === "saving" || (isEditing && !hasProcessChanges)}
            type="submit"
          >
            {isEditing ? text.updateComplete : text.update}
          </button>
          <button
            className="h-8 flex-1 rounded-md border border-red-100 bg-white text-xs font-bold text-red-600 disabled:text-slate-300"
            disabled={submitStatus === "saving"}
            onClick={() => setIsDeleteConfirmOpen(true)}
            type="button"
          >
            {text.delete}
          </button>
        </div>

        {submitMessage && (
          <p className={`text-xs font-bold ${submitStatus === "error" ? "text-red-600" : "text-emerald-600"}`}>
            {submitMessage}
          </p>
        )}

        <DeleteConfirmDialog
          disabled={submitStatus === "saving"}
          isOpen={isDeleteConfirmOpen}
          onCancel={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleProcessDelete}
        />
      </form>
    );
  }

  if (order.detailType === "production") {
    const initialProductionForm = toProductionForm(order);
    const hasProductionChanges =
      productionForm !== null &&
      (Object.keys(initialProductionForm) as Array<keyof OrderProductionForm>).some(
        (key) => (productionForm[key] ?? "") !== (initialProductionForm[key] ?? ""),
      );

    const updateProductionForm = (key: keyof OrderProductionForm, value: string) => {
      setProductionForm((current) => (current ? { ...current, [key]: value } : current));
    };

    const handleProductionSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!isEditing) {
        setIsEditing(true);
        return;
      }

      if (!productionForm || !hasProductionChanges) {
        return;
      }

      setSubmitStatus("success");
      setSubmitMessage("생산지시가 수정되었습니다.");
      setIsEditing(false);
      window.dispatchEvent(
        new CustomEvent<{ previousProductionOrderNo: string; order: OrderProductionForm }>(
          "production-order-updated",
          {
            detail: {
              previousProductionOrderNo: order.orderNo,
              order: productionForm,
            },
          },
        ),
      );
    };

    const handleProductionDelete = () => {
      setSubmitStatus("success");
      setSubmitMessage("생산지시가 삭제되었습니다.");
      setIsDeleteConfirmOpen(false);
      window.dispatchEvent(new CustomEvent<string>("production-order-deleted", { detail: order.orderNo }));
    };

    return (
      <form className="mx-5 mt-4 flex flex-col gap-2" onSubmit={handleProductionSubmit}>
        <OrderProductionFormCard
          disabled={!isEditing}
          form={productionForm ?? initialProductionForm}
          onChange={updateProductionForm}
          title=""
        />

        <div className="flex gap-2">
          <button
            className="h-8 flex-1 rounded-md bg-black text-xs font-bold text-white disabled:bg-slate-300"
            disabled={submitStatus === "saving" || (isEditing && !hasProductionChanges)}
            type="submit"
          >
            {isEditing ? text.updateComplete : text.update}
          </button>
          <button
            className="h-8 flex-1 rounded-md border border-red-100 bg-white text-xs font-bold text-red-600 disabled:text-slate-300"
            disabled={submitStatus === "saving"}
            onClick={() => setIsDeleteConfirmOpen(true)}
            type="button"
          >
            {text.delete}
          </button>
        </div>

        {submitMessage && (
          <p className={`text-xs font-bold ${submitStatus === "error" ? "text-red-600" : "text-emerald-600"}`}>
            {submitMessage}
          </p>
        )}

        <DeleteConfirmDialog
          disabled={submitStatus === "saving"}
          isOpen={isDeleteConfirmOpen}
          onCancel={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleProductionDelete}
        />
      </form>
    );
  }

  const updateForm = (key: keyof OrderPurchaseForm, value: string) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };
  const initialForm = toForm(order);
  const hasChanges = (Object.keys(initialForm) as Array<keyof OrderPurchaseForm>).some(
    (key) => (form[key] ?? "") !== (initialForm[key] ?? ""),
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (!hasChanges) {
      return;
    }

    setSubmitStatus("saving");
    setSubmitMessage("");

    try {
      const response = await fetch(`${orderApiBaseUrl}/${encodeURIComponent(order.orderNo)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          purchaseId: form.purchaseId,
          customer: form.customer,
          productName: form.product,
          quantity: Number(form.quantity),
          unitPrice: form.unitPrice ? Number(form.unitPrice) : null,
          purchaseDate: form.orderDate || null,
          dueDate: form.dueDate,
          note: form.memo,
        }),
      });

      if (!response.ok) {
        throw new Error(text.saveError);
      }

      const result = (await response.json()) as ApiResponse<OrderPurchaseResponse>;

      setSubmitStatus("success");
      setSubmitMessage(text.saveSuccess);
      setIsEditing(false);
      window.dispatchEvent(
        new CustomEvent<{ previousOrderNo: string; order: OrderPurchaseResponse }>("order-purchase-updated", {
          detail: { previousOrderNo: order.orderNo, order: result.data },
        }),
      );
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : text.saveUnknownError);
    } finally {
      setSubmitStatus((current) => (current === "saving" ? "idle" : current));
    }
  };

  const handleDelete = async () => {
    setSubmitStatus("saving");
    setSubmitMessage("");

    try {
      const response = await fetch(`${orderApiBaseUrl}/${encodeURIComponent(order.orderNo)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(text.deleteError);
      }

      setSubmitStatus("success");
      setSubmitMessage(text.deleteSuccess);
      window.dispatchEvent(new CustomEvent<string>("order-purchase-deleted", { detail: order.orderNo }));
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : text.deleteError);
    } finally {
      setSubmitStatus((current) => (current === "saving" ? "idle" : current));
    }
  };

  return (
    <form className="mx-5 mt-4 flex flex-col gap-2" onSubmit={handleSubmit}>
      <OrderPurchaseFormCard
        disabled={!isEditing}
        disablePurchaseId
        eyebrow=""
        form={form}
        onChange={updateForm}
        showOrderDate
        title=""
      />

      <div className="flex gap-2">
        <button
          className="h-8 flex-1 rounded-md bg-black text-xs font-bold text-white disabled:bg-slate-300"
          disabled={submitStatus === "saving" || (isEditing && !hasChanges)}
          type="submit"
        >
          {submitStatus === "saving" ? text.updating : isEditing ? text.updateComplete : text.update}
        </button>
        <button
          className="h-8 flex-1 rounded-md border border-red-100 bg-white text-xs font-bold text-red-600 disabled:text-slate-300"
          disabled={submitStatus === "saving"}
          onClick={() => setIsDeleteConfirmOpen(true)}
          type="button"
        >
          {text.delete}
        </button>
      </div>

      {submitMessage && (
        <p className={`text-xs font-bold ${submitStatus === "error" ? "text-red-600" : "text-emerald-600"}`}>
          {submitMessage}
        </p>
      )}

      <DeleteConfirmDialog
        disabled={submitStatus === "saving"}
        isOpen={isDeleteConfirmOpen}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </form>
  );
}

function toPurchaseStatus(status: string) {
  switch (status) {
    case "\uc9c0\uc2dc\ub300\uae30":
      return "WAITING";
    case "\uc0dd\uc0b0\uc911":
      return "IN_PROGRESS";
    case "\uc644\ub8cc":
      return "COMPLETED";
    case "\ucd9c\ud558\uc644\ub8cc":
      return "SHIPPED";
    case "\ucde8\uc18c":
      return "CANCELED";
    default:
      return status;
  }
}

function DeleteConfirmDialog({
  disabled,
  isOpen,
  onCancel,
  onConfirm,
}: {
  disabled: boolean;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4" onClick={onCancel}>
      <div
        className="w-full max-w-[280px] rounded-lg border border-slate-200 bg-white p-4 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-sm font-bold text-slate-900">{text.deleteConfirm}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            className="h-8 rounded-md bg-red-600 text-xs font-bold text-white disabled:bg-slate-300"
            disabled={disabled}
            onClick={onConfirm}
            type="button"
          >
            {text.yes}
          </button>
          <button
            className="h-8 rounded-md border border-slate-200 bg-white text-xs font-bold text-slate-600"
            onClick={onCancel}
            type="button"
          >
            {text.no}
          </button>
        </div>
      </div>
    </div>
  );
}
