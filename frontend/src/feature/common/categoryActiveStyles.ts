export type CategoryActiveKey =
  | "dashboard"
  | "scan"
  | "order"
  | "production"
  | "processOverview"
  | "process"
  | "shipment"
  | "label"
  | "history"
  | "qr"
  | "settings";

const CATEGORY_ACTIVE_CLASSES: Record<CategoryActiveKey, string> = {
  dashboard: "bg-teal-400 text-white",
  scan: "bg-green-400 text-white",
  order: "bg-sky-400 text-white",
  production: "bg-amber-400 text-white",
  processOverview: "bg-orange-400 text-white",
  process: "bg-violet-400 text-white",
  shipment: "bg-teal-400 text-white",
  label: "bg-pink-400 text-white",
  history: "bg-gray-400 text-white",
  qr: "bg-indigo-400 text-white",
  settings: "bg-slate-400 text-white",
};

export function getCategoryActiveClass(key: CategoryActiveKey) {
  return CATEGORY_ACTIVE_CLASSES[key];
}
