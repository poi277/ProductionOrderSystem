import type { ProductCategory } from "../order/OrdersTypes";

const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  AUTOMATIC_DAMPER: "오토댐퍼",
  LEAK_SENSOR: "리크센서",
  DISPENSER: "디스펜서",
  GATE: "게이트",
};

export function productCategoryLabel(category: ProductCategory | string | null | undefined) {
  if (!category) return "-";
  return PRODUCT_CATEGORY_LABELS[category as ProductCategory] ?? category;
}

export function productCategoryBadgeClass(category: ProductCategory | string | null | undefined) {
  const colors: Record<ProductCategory, string> = {
    AUTOMATIC_DAMPER: "border-rose-300 bg-rose-50 text-rose-700",
    LEAK_SENSOR: "border-orange-300 bg-orange-50 text-orange-700",
    DISPENSER: "border-violet-300 bg-violet-50 text-violet-700",
    GATE: "border-emerald-300 bg-emerald-50 text-emerald-700",
  };
  return category ? colors[category as ProductCategory] ?? "border-slate-300 bg-slate-50 text-slate-700" : "border-slate-200 bg-slate-50 text-slate-500";
}
