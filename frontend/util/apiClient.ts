export type ApiClientOptions = RequestInit & {
  json?: unknown;
};

const inFlightMutations = new Set<string>();

export async function apiClient(url: string, options: ApiClientOptions = {}) {
  const { json, headers, ...requestOptions } = options;
  const body = json === undefined ? requestOptions.body : JSON.stringify(json);
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const method = (requestOptions.method ?? "GET").toUpperCase();
  const requestKey = `${method} ${url}`;
  const preventDuplicate = method !== "GET" && method !== "HEAD";

  if (preventDuplicate && inFlightMutations.has(requestKey)) {
    throw new Error("이미 처리 중인 요청입니다.");
  }

  if (preventDuplicate) inFlightMutations.add(requestKey);
  try {
    const response = await fetch(toApiUrl(url), {
      ...requestOptions,
      body,
      credentials: "include",
      headers: {
        ...(!isFormData && body != null ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
    });
    if (preventDuplicate && response.ok) notifyApiMutation();
    if (preventDuplicate && response.ok && typeof window !== "undefined") {
      void dispatchBackendMessage(response);
    }
    return response;
  } finally {
    if (preventDuplicate) inFlightMutations.delete(requestKey);
  }
}

async function dispatchBackendMessage(response: Response) {
  try {
    const result = (await response.clone().json()) as { message?: unknown };
    if (typeof result.message !== "string" || !result.message.trim()) return;
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("order-sidebar-notification", {
        detail: { error: false, message: result.message },
      }));
    }, 0);
  } catch {
    // JSON 응답이나 message가 없는 API는 별도 알림을 표시하지 않는다.
  }
}

function toApiUrl(url: string) {
  if (typeof window === "undefined") return url;

  try {
    const target = new URL(url);
    const configuredBackend = new URL(
      process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "http://localhost:8080",
    );
    if (target.origin !== configuredBackend.origin) return url;
    return `/api/backend${target.pathname}${target.search}`;
  } catch {
    return url;
  }
}

export async function readApiData<T>(response: Response): Promise<T> {
  const result = (await response.json()) as { success?: boolean; message?: string; data?: T };
  if (!response.ok || result.success === false) {
    throw new Error(result.message || `요청에 실패했습니다. (${response.status})`);
  }
  return (result.data ?? result) as T;
}

export async function getApiErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const result = (await response.clone().json()) as { message?: unknown };
    return typeof result.message === "string" && result.message.trim()
      ? result.message
      : fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}
import { notifyApiMutation } from "./apiMutationStore";
