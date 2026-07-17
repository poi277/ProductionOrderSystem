"use client";

import { useEffect, useMemo, useState } from "react";
import type { Order, ProductCategory, PurchaseOption } from "../order/OrdersTypes";
import ProductProcessProgress from "./ProductProcessProgress";
import ProductionProcessProgress from "./ProductionProcessProgress";
import { toProcessStatus } from "./processStatusUtils";
import {
  deleteProduct,
  deletePurchase,
  updateProductProcess,
  updateProductionProcesses,
  updatePurchaseDetail,
} from "./orderDetailApi";
import type { ProcessStatus, ProductDetail, PurchaseDetail } from "./orderDetailApi";
import { orderEndpoints } from "../../../lib/endpoints";
import { apiClient, getApiErrorMessage } from "../../../util/apiClient";
import { useAsyncAction } from "../common/useAsyncAction";
import type { CategoryActiveKey } from "../common/categoryActiveStyles";
import DrawerActionButtons from "./DrawerActionButtons";
import type { SidebarNotification } from "./OrderSidebarContext";

type PurchaseForm = {
  productCategory: ProductCategory | null;
  purchaseId: string;
  customer: string;
  productName: string;
  quantity: string;
  dueDate: string;
  note: string;
};
type ProductionForm = { purchaseId: string; productCodePrefix: string; lot: string; quantity: string };

export enum DrawerCategory {
  DISABLED = "disabled",
  PURCHASE = "purchase",
  PRODUCTION = "production",
  PROCESS_OVERVIEW = "processOverview",
  PRODUCT = "product",
}

const DRAWER_CATEGORY_KEYS: Record<DrawerCategory, CategoryActiveKey> = {
  [DrawerCategory.DISABLED]: "settings",
  [DrawerCategory.PURCHASE]: "order",
  [DrawerCategory.PRODUCTION]: "production",
  [DrawerCategory.PROCESS_OVERVIEW]: "processOverview",
  [DrawerCategory.PRODUCT]: "process",
};

type Props = {
  category: DrawerCategory;
  onClose: () => void;
  processEditable: boolean;
  selectedItem: Order | null;
  purchaseOptions: PurchaseOption[];
  externalNotification: SidebarNotification;
};

const EMPTY_PURCHASE: PurchaseDetail = {
  id: 0,
  purchaseId: "",
  customer: "",
  productName: "",
  quantity: null,
  dueDate: "",
  status: "PURCHASESUBMIT",
  note: "",
  createdTime: null,
  productCategory: null,
};

export default function OrderUnifiedDetailDrawer({
  category,
  externalNotification,
  onClose,
  processEditable,
  selectedItem,
  purchaseOptions,
}: Props) {
  const order = selectedItem;
  const purchaseId = order?.productionOrderNo ?? order?.orderNo ?? null;
  const purchaseDbId = order?.purchaseDbId ?? null;
  const selectedProductQr = useMemo(() => {
    if (!order?.productQr) return null;
    if (order.processUpdateScope === "product" || order.detailType === "label" || order.detailType === "shipment") {
      return order.productQr;
    }
    return null;
  }, [order]);

  const purchaseEditable = category === DrawerCategory.PURCHASE;
  const productionEditable = category === DrawerCategory.PRODUCTION;
  const processOverviewEditable = category === DrawerCategory.PROCESS_OVERVIEW;
  const productEditable = category === DrawerCategory.PRODUCT;
  const drawerDisabled = category === DrawerCategory.DISABLED;

  const [purchase, setPurchase] = useState<PurchaseDetail | null>(null);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [form, setForm] = useState<PurchaseForm>(toForm(EMPTY_PURCHASE));
  const [productionForm, setProductionForm] = useState<ProductionForm>({ purchaseId: "", productCodePrefix: "", lot: "", quantity: "" });
  const [loadedPurchaseDbId, setLoadedPurchaseDbId] = useState<number | null>(null);
  const [loadedProductionId, setLoadedProductionId] = useState<number | null>(null);
  const [loadedProductQr, setLoadedProductQr] = useState<string | null>(null);
  const [pendingProcess, setPendingProcess] = useState<ProcessStatus | null>(null);
  const [pendingDefect, setPendingDefect] = useState<boolean | null>(null);
  const [pendingOrderProcess, setPendingOrderProcess] = useState<ProcessStatus | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { isPending: isActionPending, run: runAction } = useAsyncAction();

  useEffect(() => {
    const handleNotification = (event: Event) => {
      const detail = (event as CustomEvent<{ error?: boolean; message?: string }>).detail;
      setError(detail?.error ? detail.message ?? "" : "");
      setMessage(detail?.error ? "" : detail?.message ?? "");
    };

    window.addEventListener("order-sidebar-notification", handleNotification);
    return () => window.removeEventListener("order-sidebar-notification", handleNotification);
  }, []);

  const selectPurchaseForProduction = async (nextPurchaseDbId: string) => {
    const selectedOption = purchaseOptions.find((option) => String(option.id) === nextPurchaseDbId);
    const nextPurchaseId = selectedOption?.purchaseId ?? "";
    setProductionForm((current) => ({ ...current, purchaseId: nextPurchaseId }));
    setPurchase(null);
    setForm(toForm(EMPTY_PURCHASE));
    setLoadedPurchaseDbId(null);
    if (!nextPurchaseDbId || !selectedOption) return;
    setError("");
    setPurchase(selectedOption);
    setForm(toForm(selectedOption));
    setLoadedPurchaseDbId(selectedOption.id);
    setPendingOrderProcess(selectedOption.status);
    setProductionForm((current) => ({
      ...current,
      purchaseId: nextPurchaseId,
      quantity: selectedOption.quantity == null ? "" : String(selectedOption.quantity),
    }));
  };

  /* Drawer selection changes must clear stale linked data before starting the next request. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setPurchase(null);
    setProduct(null);
    setForm(toForm(EMPTY_PURCHASE));
    setProductionForm({ purchaseId: "", productCodePrefix: "", lot: "", quantity: "" });
    setLoadedPurchaseDbId(null);
    setLoadedProductionId(null);
    setLoadedProductQr(null);
    setPendingProcess(null);
    setPendingDefect(null);
    setPendingOrderProcess(null);
    // 저장 후 선택 항목이 닫힐 때는 하단 알림 카드를 유지한다.
    // 다른 항목을 새로 선택한 경우에만 이전 알림을 초기화한다.
    if (order) {
      setError("");
      setMessage("");
    }
    if (!order) {
      setPendingOrderProcess("PURCHASESUBMIT");
    } else {
      const purchaseDetail = toPurchaseDetail(order);
      setPurchase(purchaseDetail);
      setForm(toForm(purchaseDetail));
      setLoadedPurchaseDbId(purchaseDetail.id || null);
      setPendingOrderProcess(
        purchaseDetail.status
          ?? toProcessStatus(order.productProcessStatus)
          ?? null,
      );
      setProductionForm({
        purchaseId: purchaseId ?? "",
        productCodePrefix: productCodePrefix(order?.productQr, purchaseId),
        lot: order?.lotNo ?? "",
        quantity: order?.instructionQuantity ?? "",
      });
      if (order?.productionDbId) setLoadedProductionId(order.productionDbId);
      if (selectedProductQr) {
        const detail = toProductDetail(order, selectedProductQr);
        setProduct(detail);
        setLoadedProductQr(selectedProductQr);
        setPendingProcess(detail.process);
        setPendingDefect(Boolean(detail.isDefect));
      }
    }
  }, [purchaseDbId, purchaseId, selectedProductQr, order]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const hasPurchase = loadedPurchaseDbId !== null;
  const hasProduction = loadedProductionId !== null;
  const hasProduct = Boolean(loadedProductQr);
  const purchaseChanged = Boolean(purchase && JSON.stringify(form) !== JSON.stringify(toForm(purchase)));
  const initialProductionForm = {
    purchaseId: purchaseId ?? "",
    productCodePrefix: productCodePrefix(order?.productQr, purchaseId),
    lot: order?.lotNo ?? "",
    quantity: order?.instructionQuantity ?? "",
  };
  const productionDetailChanged = JSON.stringify(productionForm) !== JSON.stringify(initialProductionForm);
  const productionProcessChanged = Boolean(purchase && pendingOrderProcess !== purchase.status);
  const productChanged = Boolean(product && (pendingProcess !== product.process || pendingDefect !== Boolean(product.isDefect)));
  const hasChanges = purchaseEditable
    ? !hasPurchase || purchaseChanged
    : productionEditable
      ? !hasProduction || productionDetailChanged
      : processOverviewEditable
        ? hasProduction && productionProcessChanged
        : hasProduct && productChanged;

  const clearSavedSelection = () => {
    onClose();
    setPurchase(null);
    setProduct(null);
    setForm(toForm(EMPTY_PURCHASE));
    setProductionForm({ purchaseId: "", productCodePrefix: "", lot: "", quantity: "" });
    setLoadedPurchaseDbId(null);
    setLoadedProductionId(null);
    setLoadedProductQr(null);
    setPendingProcess(null);
    setPendingDefect(null);
    setPendingOrderProcess(purchaseEditable ? "PURCHASESUBMIT" : null);
  };

  const saveChanges = async () => {
    setError("");
    setMessage("");
    try {
      if (purchaseEditable) {
        if (hasPurchase && loadedPurchaseDbId !== null) {
          const previousPurchaseId = purchase?.purchaseId ?? form.purchaseId;
          const updated = await updatePurchaseDetail(loadedPurchaseDbId, {
            productCategory: form.productCategory,
            purchaseId: form.purchaseId,
            customer: form.customer,
            productName: form.productName,
            quantity: numberOrNull(form.quantity),
            dueDate: form.dueDate || null,
            status: purchase?.status ?? "PURCHASESUBMIT",
            note: form.note,
          });
          setPurchase(updated);
          setForm(toForm(updated));
          window.dispatchEvent(new CustomEvent("order-purchase-updated", { detail: { previousOrderNo: previousPurchaseId, order: updated } }));
          clearSavedSelection();
          setMessage("발주서가 저장되었습니다.");
        } else {
          const response = await apiClient(orderEndpoints.create, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productCategory: form.productCategory, purchaseId: form.purchaseId, customer: form.customer, productName: form.productName, quantity: numberOrNull(form.quantity), dueDate: form.dueDate || null, note: form.note }),
          });
          if (!response.ok) throw new Error(await getApiErrorMessage(response, "발주서를 입력하지 못했습니다."));
          const result = (await response.json()) as { data: PurchaseDetail };
          window.dispatchEvent(new CustomEvent("order-purchase-created", { detail: result.data }));
          clearSavedSelection();
          setMessage("발주서가 저장되었습니다.");
        }
        return;
      }

      if (productionEditable) {
        if (loadedPurchaseDbId === null) throw new Error("발주번호를 선택해 주세요.");
		const productionBody = {
		  purchaseDbId: loadedPurchaseDbId,
          productCodePrefix: productionForm.productCodePrefix || productionForm.purchaseId,
          lot: productionForm.lot,
          productionQuantity: numberOrNull(productionForm.quantity),
        };
        if (hasProduction && loadedProductionId) {
          const response = await apiClient(orderEndpoints.production(loadedProductionId), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productionBody),
          });
          if (!response.ok) throw new Error(await getApiErrorMessage(response, "생산지시를 수정하지 못했습니다."));
          await response.json();
        } else {
          const response = await apiClient(orderEndpoints.productions, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productionBody),
          });
          if (!response.ok) throw new Error(await getApiErrorMessage(response, "생산지시를 입력하지 못했습니다."));
          const result = (await response.json()) as { data?: { id?: number; purchaseId?: string; productQr?: string } };
          if (result.data?.id != null) setLoadedProductionId(result.data.id);
          if (result.data?.productQr) {
            const detail = toProductDetail(order, result.data.productQr);
            setProduct(detail);
            setLoadedProductQr(result.data.productQr);
            setPendingProcess(detail.process);
            setPendingDefect(Boolean(detail.isDefect));
          }
        }
        clearSavedSelection();
        setMessage("생산지시가 저장되었습니다.");
        return;
      }

      if (processOverviewEditable) {
        if (!hasProduction || !pendingOrderProcess || !productionProcessChanged) return;
		if (loadedPurchaseDbId === null) throw new Error("연결된 발주서를 찾을 수 없습니다.");
		await updateProductionProcesses(loadedPurchaseDbId, pendingOrderProcess);
        clearSavedSelection();
        setMessage("전체 공정 현황이 저장되었습니다.");
        return;
      }

      if (productEditable) {
        if (!hasProduct || !loadedProductQr || !product) return;
        if (productChanged) {
          const updated = await updateProductProcess(loadedProductQr, {
            processName: pendingProcess,
            isDefect: Boolean(pendingDefect),
          });
          setProduct(updated);
          setPendingProcess(updated.process);
          setPendingDefect(Boolean(updated.isDefect));
        }
        clearSavedSelection();
        setMessage("제품 공정이 저장되었습니다.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "변경사항을 저장하지 못했습니다.");
    }
  };

  const handleDelete = async () => {
    const productionEntityEditable = productionEditable || processOverviewEditable;
    const deleteId = productEditable ? loadedProductQr : productionEntityEditable ? loadedProductionId : loadedPurchaseDbId;
    if (!deleteId || !window.confirm(productEditable ? "선택한 제품을 삭제하시겠습니까?" : productionEntityEditable ? "이 생산지시를 삭제하시겠습니까?" : "이 발주서를 삭제하시겠습니까?")) return;
    setError("");
    try {
      if (productEditable && loadedProductQr) {
        await deleteProduct(loadedProductQr);
        window.dispatchEvent(new CustomEvent<number>("product-process-deleted", { detail: order?.id ?? 0 }));
      } else if (productionEntityEditable && loadedProductionId) {
        const response = await apiClient(orderEndpoints.production(loadedProductionId), { method: "DELETE" });
        if (!response.ok) throw new Error(await getApiErrorMessage(response, "생산지시를 삭제하지 못했습니다."));
        window.dispatchEvent(new CustomEvent<string>("production-order-deleted", { detail: purchase?.purchaseId ?? productionForm.purchaseId }));
      } else if (loadedPurchaseDbId !== null) {
        await deletePurchase(loadedPurchaseDbId);
        window.dispatchEvent(new CustomEvent<string>("order-purchase-deleted", { detail: purchase?.purchaseId ?? form.purchaseId }));
      }
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "삭제하지 못했습니다.");
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#f6f7f9] text-slate-950">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="flex min-h-full flex-1 flex-col divide-y divide-slate-200 overflow-hidden bg-white">
          <PurchaseOrderSection
            active={purchaseEditable}
            form={form}
            productionMode={productionEditable}
            purchaseOptions={purchaseOptions}
            selectedPurchaseDbId={loadedPurchaseDbId}
            onPurchaseSelect={(value) => void selectPurchaseForProduction(value)}
            onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))}
            onCategoryChange={(productCategory) => setForm((current) => ({ ...current, productCategory }))}
          />
          <ProductionSection
            active={productionEditable}
            processActive={processOverviewEditable}
            processDisplayEnabled={processOverviewEditable || order?.detailType === "process"}
            form={productionForm}
            hasProduction={hasProduction}
            pending={pendingOrderProcess}
            processEditable={processEditable}
            purchase={purchase}
            onFormChange={(key, value) => setProductionForm((current) => ({ ...current, [key]: value }))}
            onChange={setPendingOrderProcess}
          />
          <ProductArea active={productEditable} product={product} pending={pendingProcess} pendingDefect={pendingDefect} onChange={setPendingProcess} onDefectChange={setPendingDefect} />
          <NotificationCard
            error={externalNotification?.error ?? Boolean(error)}
            message={externalNotification?.message ?? (error || message)}
          />
        </div>
      </div>

      <DrawerActionButtons
        canSave={!drawerDisabled && hasChanges}
        categoryKey={DRAWER_CATEGORY_KEYS[category]}
        deletable={!drawerDisabled && (hasPurchase || hasProduction || hasProduct)}
        isPending={isActionPending}
        onDelete={() => runAction(handleDelete)}
        onSave={() => runAction(saveChanges)}
      />
    </div>
  );
}

function PurchaseOrderSection({ active, form, productionMode, purchaseOptions, selectedPurchaseDbId, onPurchaseSelect, onChange, onCategoryChange }: {
  active: boolean;
  form: PurchaseForm;
  productionMode: boolean;
  purchaseOptions: PurchaseOption[];
  selectedPurchaseDbId: number | null;
  onPurchaseSelect: (value: string) => void;
  onChange: (key: keyof PurchaseForm, value: string) => void;
  onCategoryChange: (value: ProductCategory | null) => void;
}) {
  return (
    <Section active={active} category="purchase" height="h-[370px] shrink-0" title="발주 기본 정보">
      <InformationGrid form={form} editing={active} purchaseOptions={productionMode ? purchaseOptions : undefined} selectedPurchaseDbId={selectedPurchaseDbId} onPurchaseSelect={productionMode ? onPurchaseSelect : undefined} onChange={onChange} onCategoryChange={onCategoryChange} />
    </Section>
  );
}

function ProductionSection({ active, processActive, processDisplayEnabled, form, hasProduction, pending, processEditable, purchase, onFormChange, onChange }: {
  active: boolean;
  processActive: boolean;
  processDisplayEnabled: boolean;
  form: ProductionForm;
  hasProduction: boolean;
  pending: ProcessStatus | null;
  processEditable: boolean;
  purchase: PurchaseDetail | null;
  onFormChange: (key: keyof ProductionForm, value: string) => void;
  onChange: (value: ProcessStatus) => void;
}) {
  return (
    <>
      <Section active={active} category="production" height="h-[155px] shrink-0" title="생산지시 정보">
        <div className="grid gap-y-3">
          <EditableRow active={active} category="production" label="QR갯수" type="number" value={form.quantity} onChange={(value) => onFormChange("quantity", value)} />
          <EditableRow active={active} category="production" label="LOT" value={form.lot} onChange={(value) => onFormChange("lot", value)} />
        </div>
      </Section>
      <Section active={processActive} category="processOverview" height="h-[120px] shrink-0" title="전체 공정 현황">
        <div className="overflow-x-auto py-2"><ProductionProcessProgress active={processActive} displayEnabled={processDisplayEnabled} editable={processEditable} hasProduction={hasProduction} status={purchase?.status} pendingStatus={pending} onChange={onChange} /></div>
      </Section>
    </>
  );
}

function ProductArea({ active, product, pending, pendingDefect, onChange, onDefectChange }: {
  active: boolean;
  product: ProductDetail | null;
  pending: ProcessStatus | null;
  pendingDefect: boolean | null;
  onChange: (value: ProcessStatus) => void;
  onDefectChange: (value: boolean) => void;
}) {
  return (
    <Section active={active} category="product" height="min-h-[195px] flex-1" title="제품 기본 정보 및 제품 공정 현황">
      <ProductSection product={product} editing={active && Boolean(product)} pending={pending} pendingDefect={pendingDefect} onChange={onChange} onDefectChange={onDefectChange} />
    </Section>
  );
}

function Section({ active, category, children, height, title }: {
  active: boolean;
  category: "purchase" | "production" | "processOverview" | "product";
  children: React.ReactNode;
  height: string;
  title: string;
}) {
  const activeStyle = {
    purchase: "border-l-sky-500",
    production: "border-l-amber-500",
    processOverview: "border-l-orange-500",
    product: "border-l-violet-500",
  }[category];
  const titleStyle = {
    purchase: "text-sky-700",
    production: "text-amber-700",
    processOverview: "text-orange-700",
    product: "text-violet-700",
  }[category];
  return (
    <section className={`${height} flex flex-col overflow-y-auto border-l-4 bg-white p-4 transition-colors ${active ? activeStyle : "border-l-slate-300"}`}>
      <h3 className={`mb-4 text-xs ${active ? `font-extrabold ${titleStyle}` : "font-semibold text-slate-600"}`}>{title}</h3>
      {children}
    </section>
  );
}

function EditableRow({ active, category, label, onChange, type = "text", value }: {
  active: boolean;
  category: "purchase" | "production" | "product";
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return <label className="grid grid-cols-[88px_1fr] items-center gap-2"><span className="text-[13px] font-bold text-slate-600">{label}</span><input className={active ? editableFieldClass(category) : readonlyFieldClass} disabled={!active} min={type === "number" ? 1 : undefined} onChange={(event) => onChange(event.target.value)} required type={type} value={value} /></label>;
}

function InformationGrid({ form, editing, purchaseOptions, selectedPurchaseDbId, onPurchaseSelect, onChange, onCategoryChange }: {
  form: PurchaseForm;
  editing: boolean;
  purchaseOptions?: PurchaseOption[];
  selectedPurchaseDbId?: number | null;
  onPurchaseSelect?: (value: string) => void;
  onChange: (key: keyof PurchaseForm, value: string) => void;
  onCategoryChange: (value: ProductCategory | null) => void;
}) {
  const items: Array<[string, keyof PurchaseForm | null, string]> = [
    ["발주번호", "purchaseId", form.purchaseId],
    ["고객명", "customer", form.customer],
    ["품명", "productName", form.productName],
    ["납기일", "dueDate", form.dueDate],
    ["비고", "note", form.note],
  ];
  const renderItem = ([label, key, value]: [string, keyof PurchaseForm | null, string]) => {
    if (key === "purchaseId" && purchaseOptions && onPurchaseSelect) {
      return <div className="grid grid-cols-[88px_1fr] items-center gap-2" key={label}><dt className="text-[13px] font-bold text-slate-600">{label}</dt><dd><select className={editableFieldClass("production")} onChange={(event) => onPurchaseSelect(event.target.value)} value={selectedPurchaseDbId ?? ""}><option value="">발주번호 선택</option>{purchaseOptions.map((option) => <option key={option.id} value={option.id}>{option.purchaseId}({option.customer || "고객명 없음"})[{option.quantity ?? 0}개]</option>)}</select></dd></div>;
    }
    const canEdit = editing && key !== null;
    const displayValue = value || "-";
    return <div className="grid grid-cols-[88px_1fr] items-center gap-2" key={label}><dt className="text-[13px] font-bold text-slate-600">{label}</dt><dd><input className={canEdit ? editableFieldClass("purchase") : readonlyFieldClass} readOnly={!canEdit} type={canEdit && key === "dueDate" ? "date" : "text"} value={canEdit ? value : displayValue} onChange={(event) => key && onChange(key, event.target.value)} /></dd></div>;
  };
  return <dl className="grid grid-cols-1 gap-y-3">
    <div className="grid grid-cols-[88px_1fr] items-center gap-2">
      <dt className="text-[13px] font-bold text-slate-600">제품 카테고리</dt>
      <dd>
        <select className={editing ? editableFieldClass("purchase") : readonlyFieldClass} disabled={!editing} onChange={(event) => onCategoryChange(event.target.value ? event.target.value as ProductCategory : null)} value={form.productCategory ?? ""}>
          <option value="">제품 카테고리 선택</option>
          {PRODUCT_CATEGORIES.map(({ label, value }) => <option key={value} value={value}>{label}</option>)}
        </select>
      </dd>
    </div>
    {items.slice(0, 3).map(renderItem)}
    <EditableRow active={editing} category="purchase" label="발주수량" type="number" value={form.quantity} onChange={(value) => onChange("quantity", value)} />
    {items.slice(3).map(renderItem)}
  </dl>;
}

function ProductSection({ product, editing, pending, pendingDefect, onChange, onDefectChange }: { product: ProductDetail | null; editing: boolean; pending: ProcessStatus | null; pendingDefect: boolean | null; onChange: (value: ProcessStatus) => void; onDefectChange: (value: boolean) => void }) {
  return <div><dl className="grid grid-cols-1 gap-y-3"><div className="grid grid-cols-[88px_1fr] items-center gap-2"><dt className="text-[13px] font-bold text-slate-600">제품 QR</dt><dd><input className={readonlyFieldClass} disabled={!product} readOnly value={product?.productQr ?? ""} /></dd></div><div className="grid grid-cols-[88px_1fr] items-center gap-2"><dt className="text-[13px] font-bold text-slate-600">판정</dt><dd className="grid grid-cols-2 gap-2"><button className={`h-8 rounded-md border text-xs font-bold ${editing && pendingDefect === false ? "border-violet-400 bg-violet-50 text-violet-700" : "border-slate-200 bg-white text-slate-500"} disabled:cursor-not-allowed`} disabled={!editing} onClick={() => onDefectChange(false)} type="button">정상</button><button className={`h-8 rounded-md border text-xs font-bold ${editing && pendingDefect === true ? "border-rose-400 bg-rose-50 text-rose-700" : "border-slate-200 bg-white text-slate-500"} disabled:cursor-not-allowed`} disabled={!editing} onClick={() => onDefectChange(true)} type="button">불량</button></dd></div></dl><div className="mt-4 overflow-x-auto"><ProductProcessProgress editing={editing} status={product?.process} pendingStatus={pending} onChange={onChange} /></div></div>;
}

function toPurchaseDetail(order: Order): PurchaseDetail {
  return {
    id: order.purchaseDbId ?? 0,
    purchaseId: order.productionOrderNo ?? order.orderNo,
    customer: order.customer && order.customer !== "-" ? order.customer : null,
    productName: order.product && order.product !== "-" ? order.product : null,
    quantity: toNullableNumber(order.quantity),
    dueDate: order.purchaseDueDate ?? null,
    status: toProcessStatus(order.purchaseStatus),
    note: order.purchaseNote ?? null,
    createdTime: order.purchaseCreatedTime ?? order.createdAt ?? null,
    productCategory: order.productCategory ?? null,
  };
}

function toNullableNumber(value: string | undefined) {
  if (!value || value === "-") return null;
  const parsed = Number(value.replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function toProductDetail(order: Order | null, productQr: string): ProductDetail {
  const process = toProcessStatus(order?.productProcessStatus);
  const parsedQuantity = Number(order?.quantity);
  return {
    productQr,
    productionId: order?.productionOrderNo ?? order?.orderNo ?? null,
    customer: order?.customer && order.customer !== "-" ? order.customer : null,
    productName: order?.product && order.product !== "-" ? order.product : null,
    quantity: Number.isFinite(parsedQuantity) ? parsedQuantity : null,
    lot: order?.lotNo && order.lotNo !== "-" ? order.lotNo : null,
    process,
    processName: order?.processName ?? null,
    processSequence: order?.processSequence ?? null,
    isDefect: order?.isDefect ?? order?.judgment === "불량",
    createdTime: order?.createdAt ?? order?.orderDate ?? null,
  };
}

function NotificationCard({ error, message }: { error: boolean; message: string }) {
  const active = Boolean(message);
  return (
    <section
      aria-live="polite"
      className={`min-h-[53px] shrink-0 border-y border-l-4 border-y-slate-200 p-4 transition-colors ${
        !active
          ? "border-l-slate-300 bg-slate-50"
          : error
            ? "border-l-red-500 bg-white"
            : "border-l-emerald-500 bg-white"
      }`}
    >
      {active && (
        <p className={`text-[13px] font-bold leading-5 ${error ? "text-red-700" : "text-emerald-700"}`}>
          {message}
        </p>
      )}
    </section>
  );
}

const readonlyFieldClass = "h-8 w-full min-w-0 cursor-default rounded-md border border-slate-200 bg-slate-100 px-2 text-[13px] font-semibold text-slate-700 outline-none";
function editableFieldClass(category: "purchase" | "production" | "product") {
  const focus = { purchase: "focus:border-sky-500", production: "focus:border-amber-500", product: "focus:border-violet-500" }[category];
  return `h-8 w-full min-w-0 rounded-md border border-slate-300 bg-white px-2 text-[13px] font-semibold outline-none ${focus}`;
}
function toForm(purchase: PurchaseDetail): PurchaseForm { return { productCategory: purchase.productCategory ?? null, purchaseId: purchase.purchaseId, customer: purchase.customer ?? "", productName: purchase.productName ?? "", quantity: String(purchase.quantity ?? ""), dueDate: purchase.dueDate ?? "", note: purchase.note ?? "" }; }
const PRODUCT_CATEGORIES: Array<{ value: ProductCategory; label: string }> = [
  { value: "AUTOMATIC_DAMPER", label: "오토댐퍼" },
  { value: "LEAK_SENSOR", label: "리크센서" },
  { value: "DISPENSER", label: "디스펜서" },
  { value: "GATE", label: "게이트" },
];
function numberOrNull(value: string) { return value === "" ? null : Number(value); }
function productCodePrefix(productQr?: string | null, fallback?: string | null) {
  if (!productQr) return fallback ?? "";
  const separatorIndex = productQr.lastIndexOf("-");
  return separatorIndex > 0 ? productQr.slice(0, separatorIndex) : productQr;
}
