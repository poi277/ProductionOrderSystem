"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { registerAction } from "./authActions";

export default function RegisterPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const result = await registerAction(id.trim(), name.trim(), password);
      if (!result.success) {
        setError(result.message || "회원가입에 실패했습니다.");
        return;
      }
      window.alert("회원가입 완료. 내부 사람한테 알려주세요.");
      router.replace("/login");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "회원가입에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-5 py-10 text-slate-950">
      <div className="pointer-events-none absolute -left-24 top-[-7rem] size-80 rounded-full bg-rose-100/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-[-6rem] size-96 rounded-full bg-slate-200/70 blur-3xl" />

      <section className="relative w-full max-w-[420px] rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_24px_70px_-28px_rgba(15,23,42,0.35)] sm:p-10">
        <div className="mb-7">
          <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-rose-100 text-base font-extrabold text-rose-700">
            관
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-500">Production Manager</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight">회원가입</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">QR 이력관리 시스템에서 사용할 계정을 등록해주세요.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <RegisterInput
            autoComplete="username"
            disabled={isSubmitting}
            label="아이디"
            onChange={setId}
            placeholder="아이디를 입력해주세요"
            value={id}
          />
          <RegisterInput
            autoComplete="name"
            disabled={isSubmitting}
            label="이름"
            onChange={setName}
            placeholder="이름을 입력해주세요"
            value={name}
          />
          <RegisterInput
            autoComplete="new-password"
            disabled={isSubmitting}
            label="비밀번호"
            onChange={setPassword}
            placeholder="비밀번호를 입력해주세요"
            type="password"
            value={password}
          />
          <RegisterInput
            autoComplete="new-password"
            disabled={isSubmitting}
            label="비밀번호 확인"
            onChange={setPasswordConfirm}
            placeholder="비밀번호를 다시 입력해주세요"
            type="password"
            value={passwordConfirm}
          />

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
            {isSubmitting ? "가입 중..." : "회원가입"}
          </button>

          <p className="text-center text-sm text-slate-500">
            이미 계정이 있나요?{" "}
            <Link className="font-bold text-rose-500 transition hover:text-rose-600" href="/login">
              로그인
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}

type RegisterInputProps = {
  label: string;
  value: string;
  placeholder: string;
  autoComplete: string;
  disabled: boolean;
  type?: "text" | "password";
  onChange: (value: string) => void;
};

function RegisterInput({
  label,
  value,
  placeholder,
  autoComplete,
  disabled,
  type = "text",
  onChange,
}: RegisterInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <input
        autoComplete={autoComplete}
        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required
        type={type}
        value={value}
      />
    </label>
  );
}
