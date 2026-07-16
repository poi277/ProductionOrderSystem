"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import InlineNotice from "../common/InlineNotice";
import ProductQrDetailCard from "./ProductQrDetailCard";
import { fetchProductQrDetail } from "./qrSearchApi";
import type { ProductQrDetail } from "./qrSearchTypes";

export default function QrSearchPage({ title = "제품 QR 조회" }: { title?: string }) {
  const [productQr, setProductQr] = useState("");
  const [product, setProduct] = useState<ProductQrDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSequence = useRef(0);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedQr = productQr.trim();
    if (!normalizedQr || isLoading) return;

    const sequence = ++requestSequence.current;
    setIsLoading(true);
    setError(null);
    setProduct(null);

    try {
      const detail = await fetchProductQrDetail(normalizedQr);
      if (sequence === requestSequence.current) setProduct(detail);
    } catch (requestError) {
      if (sequence === requestSequence.current) {
        setError(requestError instanceof Error ? requestError.message : "제품 조회 중 서버 오류가 발생했습니다.");
      }
    } finally {
      if (sequence === requestSequence.current) setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-3 sm:px-6">
      <div className="mb-3">
        <h1 className="text-xl font-extrabold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">제품 QR을 입력하거나 스캔해 현재 제품과 출하 완료 제품을 조회하세요.</p>
      </div>

      <form className="mb-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm" onSubmit={handleSubmit}>
        <label className="text-xs font-bold text-slate-600" htmlFor="product-qr">제품 QR</label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            autoComplete="off"
            autoFocus
            className="h-10 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
            id="product-qr"
            onChange={(event) => setProductQr(event.target.value)}
            placeholder="제품 QR을 입력하세요"
            value={productQr}
          />
          <button className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:bg-slate-300" disabled={isLoading || !productQr.trim()} type="submit">
            {isLoading ? "조회 중..." : "조회"}
          </button>
        </div>
      </form>

      {error && <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-4"><InlineNotice isError message={error} /></div>}
      {!product && !error && !isLoading && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-center text-sm text-slate-400">조회할 제품 QR을 입력해주세요.</div>
      )}
      {isLoading && <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-center text-sm font-bold text-slate-500 shadow-sm">제품 정보를 조회하고 있습니다.</div>}
      {product && <ProductQrDetailCard product={product} />}
    </main>
  );
}
