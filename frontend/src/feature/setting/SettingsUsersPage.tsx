"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userEndpoints } from "../../../lib/endpoints";
import { apiClient, getApiErrorMessage } from "../../../util/apiClient";
import SavingButtonContent from "../common/SavingButtonContent";
import { useAsyncAction } from "../common/useAsyncAction";
import { useAuth } from "../login/AuthContext";

type MyInfo = { id: string; name: string; role: "USER" | "ADMIN" };
type ApiResponse<T> = { success: boolean; message: string; data: T };

export default function SettingsUsersPage() {
  const router = useRouter();
  const { role, loading: authLoading } = useAuth();
  const { isPending, run } = useAsyncAction();
  const [info, setInfo] = useState<MyInfo | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && role !== "ADMIN") router.replace("/dashboard");
  }, [authLoading, role, router]);

  useEffect(() => {
    if (authLoading || role !== "ADMIN") return;
    let ignore = false;
    const loadMyInfo = async () => {
      const response = await apiClient(userEndpoints.me, { cache: "no-store" });
      if (!response.ok) {
        if (!ignore) setError(await getApiErrorMessage(response, "내 정보를 불러오지 못했습니다."));
        return;
      }
      const result = (await response.json()) as ApiResponse<MyInfo>;
      if (!ignore) {
        setInfo(result.data);
        setName(result.data.name);
      }
    };
    void loadMyInfo();
    return () => { ignore = true; };
  }, [authLoading, role]);

  const updatePassword = async () => {
    setError("");
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    const response = await apiClient(userEndpoints.password, { method: "PUT", json: { password } });
    if (!response.ok) {
      setError(await getApiErrorMessage(response, "비밀번호를 재설정하지 못했습니다."));
      return;
    }
    setPassword("");
    setPasswordConfirm("");
  };

  const updateName = async () => {
    setError("");
    const response = await apiClient(userEndpoints.name, { method: "PUT", json: { name: name.trim() } });
    if (!response.ok) {
      setError(await getApiErrorMessage(response, "이름을 변경하지 못했습니다."));
      return;
    }
    const result = (await response.json()) as ApiResponse<MyInfo>;
    setInfo(result.data);
    setName(result.data.name);
  };

  if (authLoading || role !== "ADMIN") return null;

  return (
    <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white px-5 py-5 text-slate-950">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-extrabold">내 정보</h2>
        <div className="mt-6 grid gap-5">
          <InfoField label="아이디" value={info?.id ?? "불러오는 중..."} />
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">이름</span>
            <div className="flex gap-2">
              <input className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#143f80]" disabled={isPending || !info} onChange={(event) => setName(event.target.value)} value={name} />
              <button className="h-11 shrink-0 rounded-xl bg-[#143f80] px-5 text-sm font-bold text-white disabled:bg-slate-300" disabled={isPending || !name.trim() || name.trim() === info?.name} onClick={() => void run(updateName)} type="button">
                이름 저장
              </button>
            </div>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">새 비밀번호</span>
            <input className="h-11 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#143f80]" disabled={isPending} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">새 비밀번호 확인</span>
            <input className="h-11 rounded-xl border border-slate-300 px-4 text-sm outline-none focus:border-[#143f80]" disabled={isPending} onChange={(event) => setPasswordConfirm(event.target.value)} required type="password" value={passwordConfirm} />
          </label>
          {error && <p className="text-sm font-bold text-rose-600">{error}</p>}
          <button className="h-11 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white disabled:bg-slate-300" disabled={isPending || !password || !passwordConfirm} onClick={() => void run(updatePassword)} type="button">
            <SavingButtonContent idleText="비밀번호 재설정" isSaving={isPending} savingText="재설정 중..." />
          </button>
        </div>
      </section>
    </main>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return <label className="grid gap-2"><span className="text-sm font-bold text-slate-700">{label}</span><input className="h-11 rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-600" disabled value={value} /></label>;
}
