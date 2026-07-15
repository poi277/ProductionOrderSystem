import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/src/feature/login/authConstants";

const BACKEND_API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL ?? "http://localhost:8080";
const FORWARDED_RESPONSE_HEADERS = ["content-type", "content-disposition"];

async function proxyRequest(request: Request) {
  const incomingUrl = new URL(request.url);
  const backendPath = incomingUrl.pathname.slice("/api/backend".length);
  const targetUrl = new URL(backendPath, BACKEND_API_BASE_URL);
  targetUrl.search = incomingUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("cookie");
  headers.delete("host");
  headers.delete("content-length");

  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const method = request.method.toUpperCase();
  const response = await fetch(targetUrl, {
    method,
    headers,
    body: method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer(),
    cache: "no-store",
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  for (const headerName of FORWARDED_RESPONSE_HEADERS) {
    const value = response.headers.get(headerName);
    if (value) responseHeaders.set(headerName, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
