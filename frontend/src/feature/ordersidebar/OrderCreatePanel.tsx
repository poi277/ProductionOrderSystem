"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import OrderPurchaseFormCard from "./OrderPurchaseFormCard";
import type { OrderPurchaseForm } from "./OrderPurchaseFormCard";
import { orderEndpoints } from "../../../lib/endpoints";
import { apiClient, getApiErrorMessage } from "../../../util/apiClient";
import InlineNotice from "../common/InlineNotice";
import SavingButtonContent from "../common/SavingButtonContent";

type OrderCreatePanelProps = {
  onCancel: () => void;
  onSave: (form: OrderPurchaseForm) => void;
  submitButtonClassName: string;
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
  dueDate: string | null;
  status: string | null;
  note: string | null;
};

const text = {
  cancel: "\ucde8\uc18c",
  saveError: "\ubc1c\uc8fc\uc11c\u0020\uc800\uc7a5\uc5d0\u0020\uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4\u002e",
  saveSuccess:
    "\ubc1c\uc8fc\uc11c\uac00\u0020\ubc31\uc5d4\ub4dc\uc5d0\u0020\uc800\uc7a5\ub418\uc5c8\uc2b5\ub2c8\ub2e4\u002e",
  saveUnknownError:
    "\ubc1c\uc8fc\uc11c\u0020\uc800\uc7a5\u0020\uc911\u0020\uc624\ub958\uac00\u0020\ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4\u002e",
  submit: "\uc785\ub825\ud558\uae30",
  submitting: "\uc81c\ucd9c\u0020\uc911",
  title: "\uc0c8\u0020\ubc1c\uc8fc\uc11c\u0020\uc785\ub825",
};

export default function OrderCreatePanel({ onCancel, onSave, submitButtonClassName }: OrderCreatePanelProps) {
  const initialForm = useMemo(
    () => ({
      purchaseId: "",
      customer: "",
      product: "",
      quantity: "",
      dueDate: "",
      memo: "",
    }),
    [],
  );
  const [form, setForm] = useState<OrderPurchaseForm>(initialForm);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const updateForm = (key: keyof OrderPurchaseForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitStatus("saving");
    setSubmitMessage("");

    try {
      const response = await apiClient(orderEndpoints.create, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          purchaseId: form.purchaseId,
          customer: form.customer,
          productName: form.product,
          quantity: Number(form.quantity),
          dueDate: form.dueDate,
          note: form.memo,
        }),
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, text.saveError));
      }

      const result = (await response.json()) as ApiResponse<OrderPurchaseResponse>;

      setSubmitStatus("success");
      setSubmitMessage(text.saveSuccess);
      window.dispatchEvent(new CustomEvent<OrderPurchaseResponse>("order-purchase-created", { detail: result.data }));
      onSave(form);
      setForm(initialForm);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : text.saveUnknownError);
    }
  };

  return (
    <form className="mx-3 mt-2 flex flex-col gap-1.5" onSubmit={handleSubmit}>
      <OrderPurchaseFormCard
        compact
        eyebrow=""
        form={form}
        onChange={updateForm}
        title=""
      />

      <div className="flex gap-2">
        <button
          className={`h-7 flex-1 rounded-md ${submitButtonClassName} text-xs font-bold disabled:bg-slate-300`}
          disabled={submitStatus === "saving"}
          type="submit"
        >
          <SavingButtonContent idleText={text.submit} isSaving={submitStatus === "saving"} savingText={text.submitting} />
        </button>
        <button
          className="h-7 flex-1 rounded-md border border-slate-200 bg-white text-xs font-bold text-slate-500"
          onClick={onCancel}
          type="button"
        >
          {text.cancel}
        </button>
      </div>

      <InlineNotice isError={submitStatus === "error"} message={submitMessage} />
    </form>
  );
}
