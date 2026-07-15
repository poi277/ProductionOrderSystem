"use server";

import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "./authConstants";

const AUTH_API_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_API_URL
  ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth`
  : undefined)
  ?? "http://localhost:8080/auth";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type LoginTokenResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  name: string;
  role: AuthRole;
};

export type AuthRole = "USER" | "EMPLOYEE" | "ADMIN";

export type AuthUser = {
  userId: string;
  username: string;
  role: AuthRole;
};

export type LoginActionResult = {
  success: boolean;
  message?: string;
  data?: AuthUser;
};

export async function registerAction(
  id: string,
  name: string,
  password: string,
): Promise<LoginActionResult> {
  const response = await fetch(`${AUTH_API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, name, password }),
    cache: "no-store",
  });
  const result = await readResponse<unknown>(response);

  if (!response.ok || result.success === false) {
    return {
      success: false,
      message: result.message || `회원가입에 실패했습니다. (${response.status})`,
    };
  }

  return { success: true };
}

export async function loginAction(id: string, password: string): Promise<LoginActionResult> {
  const response = await fetch(`${AUTH_API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, password }),
    cache: "no-store",
  });
  const result = await readResponse<LoginTokenResponse>(response);

  if (!response.ok || result.success === false || !result.data?.accessToken) {
    return {
      success: false,
      message: result.message || `로그인에 실패했습니다. (${response.status})`,
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, result.data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: Math.max(1, Math.ceil(result.data.expiresIn / 1000)),
    path: "/",
    priority: "high",
  });

  return {
    success: true,
    data: {
      userId: result.data.userId,
      username: result.data.name,
      role: result.data.role,
    },
  };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  try {
    await fetch(`${AUTH_API_BASE_URL}/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      cache: "no-store",
    });
  } finally {
    cookieStore.delete(ACCESS_TOKEN_COOKIE);
  }
}

export async function checkAuthSession(): Promise<LoginActionResult> {
  const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) return { success: false };

  try {
    const [, payload] = accessToken.split(".");
    if (!payload) return { success: false };
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      exp?: number;
      sub?: string;
      name?: string;
      role?: AuthRole;
    };
    if (
      !claims.sub
      || !claims.name
      || !claims.role
      || (typeof claims.exp === "number" && claims.exp * 1000 <= Date.now())
    ) {
      return { success: false };
    }
    return {
      success: true,
      data: { userId: claims.sub, username: claims.name, role: claims.role },
    };
  } catch {
    return { success: false };
  }
}

async function readResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    return await response.json() as ApiResponse<T>;
  } catch {
    return {};
  }
}
