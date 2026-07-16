const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "http://localhost:8080";
const ORDER_BASE = `${BACKEND_BASE}/order`;
const PURCHASE_HISTORY_BASE = `${BACKEND_BASE}/order-purchase-history`;
const AUTH_BASE = `${BACKEND_BASE}/auth`;
const USER_BASE = `${BACKEND_BASE}/users`;

const encoded = (value: string | number) => encodeURIComponent(String(value));

export const orderEndpoints = {
  root: ORDER_BASE,
  create: `${ORDER_BASE}/post`,
  detail: (id: string | number) => `${ORDER_BASE}/${encoded(id)}`,
  dashboard: `${ORDER_BASE}/getDashBoard`,
  productions: `${ORDER_BASE}/productions`,
  production: (id: string | number) => `${ORDER_BASE}/productions/${encoded(id)}`,
  productionProcesses: `${ORDER_BASE}/productions/product-processes`,
  productProcess: (productQr: string) => `${ORDER_BASE}/product-processes/${encoded(productQr)}`,
  productQrDetail: (productQr: string) => `${ORDER_BASE}/products/qr/${encoded(productQr)}`,
  productProcessesByProduction: (purchaseId: string) =>
    `${ORDER_BASE}/product-processes/by-production/${encoded(purchaseId)}`,
  histories: `${ORDER_BASE}/histories`,
  history: (id: string | number) => `${ORDER_BASE}/histories/${encoded(id)}`,
  labels: `${ORDER_BASE}/labels`,
  label: (id: string) => `${ORDER_BASE}/labels/${encoded(id)}`,
  shipments: `${ORDER_BASE}/shipments`,
  shipment: (productQr: string) => `${ORDER_BASE}/shipments/${encoded(productQr)}`,
  completeShipments: `${ORDER_BASE}/shipments/complete`,
  processHistories: `${ORDER_BASE}/process-histories`,
} as const;

export const purchaseHistoryEndpoints = {
  root: PURCHASE_HISTORY_BASE,
  item: (source: string, id: string | number) => `${PURCHASE_HISTORY_BASE}/${encoded(source)}/${encoded(id)}`,
} as const;

export const authEndpoints = {
  login: `${AUTH_BASE}/login`,
  logout: `${AUTH_BASE}/logout`,
  register: `${AUTH_BASE}/register`,
} as const;

export const userEndpoints = {
  root: USER_BASE,
  roles: `${USER_BASE}/roles`,
  me: `${USER_BASE}/me`,
  name: `${USER_BASE}/me/name`,
  password: `${USER_BASE}/me/password`,
} as const;
