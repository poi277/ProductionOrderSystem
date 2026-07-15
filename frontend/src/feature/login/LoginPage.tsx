"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);
    try {
      const result = await login(id.trim(), password);
      if (!result.success) {
        setError(result.message || "로그인에 실패했습니다.");
        return;
      }
      router.replace("/dashboard");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-5 py-10 text-slate-950">
      <div className="pointer-events-none absolute -left-24 top-[-7rem] size-80 rounded-full bg-rose-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-[-6rem] size-96 rounded-full bg-slate-200/70 blur-3xl" />

      <section className="relative w-full max-w-[420px] rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_70px_-28px_rgba(15,23,42,0.35)] sm:p-10">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight">인스테크 제품관리 로그인</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">회원가입시 내부 인원에게 알려 권한설정 해주세요.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 flex items-center justify-between text-sm font-bold text-slate-700">
              <span>아이디</span>
              <Link className="text-xs font-bold text-rose-500 transition hover:text-rose-600" href="/register">
                회원가입
              </Link>
            </span>
            <input
              autoComplete="username"
              autoFocus
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              disabled={isSubmitting}
              onChange={(event) => setId(event.target.value)}
              placeholder="아이디를 입력해주세요"
              required
              type="text"
              value={id}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">비밀번호</span>
            <input
              autoComplete="current-password"
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              disabled={isSubmitting}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="비밀번호를 입력해주세요"
              required
              type="password"
              value={password}
            />
          </label>

          {error && (
            <p className="rounded-xl border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            className="flex h-12 w-full items-center justify-center rounded-xl bg-rose-400 text-sm font-extrabold text-white shadow-sm transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-rose-300"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </section>
    </main>
  );
}
