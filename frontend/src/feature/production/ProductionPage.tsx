import Link from "next/link";

const menuItems = [
  {
    href: "/orders",
    title: "발주서 관리",
    description: "발주서 목록을 조회하고 등록, 수정, 삭제를 진행합니다.",
  },
  {
    href: "/production-orders",
    title: "생산지시 관리",
    description: "발주서를 기준으로 생산지시를 관리합니다.",
  },
  {
    href: "/product-processes",
    title: "생산현황 관리",
    description: "제품 QR과 공정 진행 상태를 확인합니다.",
  },
  {
    href: "/shipments",
    title: "납품출하 관리",
    description: "출하 대상과 납품 완료 상태를 관리합니다.",
  },
];

export default function ProductionPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-8 text-zinc-950">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-blue-700">Production</p>
          <h1 className="text-3xl font-bold tracking-tight">생산관리</h1>
          <p className="text-base text-zinc-600">발주서, 생산지시, 생산현황, 납품출하 화면으로 이동합니다.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {menuItems.map((item) => (
            <Link
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50"
              href={item.href}
              key={item.href}
            >
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-600">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
