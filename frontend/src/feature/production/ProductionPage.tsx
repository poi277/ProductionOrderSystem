const menuItems = [
  {
    title: "스캔 관리",
    description: "현장 스캔 이력과 처리 상태를 확인합니다.",
    count: "128건",
    status: "정상 처리",
  },
  {
    title: "발주서 관리",
    description: "입고 예정 발주서와 미처리 발주서를 관리합니다.",
    count: "24건",
    status: "검토 필요 3건",
  },
  {
    title: "생산지시 관리",
    description: "작업 지시 등록, 진행 상태, 완료 여부를 추적합니다.",
    count: "16건",
    status: "진행 중 8건",
  },
  {
    title: "제품공정 관리",
    description: "제품별 공정 단계와 작업 순서를 확인합니다.",
    count: "42개",
    status: "공정 등록 완료",
  },
];

const orders = [
  {
    no: "PO-20260706-001",
    product: "Leak Sensor Point-4C",
    quantity: "1,200개",
    dueDate: "2026-07-09",
    status: "생산 대기",
  },
  {
    no: "PO-20260706-002",
    product: "ECS200A-ORGANIC-000A",
    quantity: "860개",
    dueDate: "2026-07-11",
    status: "공정 진행",
  },
  {
    no: "PO-20260706-003",
    product: "DU-LK322-S3 커넥터 타입",
    quantity: "2,400개",
    dueDate: "2026-07-12",
    status: "스캔 확인",
  },
];

export default function ProductionPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-8 text-zinc-950">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-blue-700">Production</p>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">생산관리</h1>
              <p className="mt-2 text-base text-zinc-600">
                스캔, 발주서, 생산지시, 제품공정을 한 화면에서 확인하는 테스트 페이지입니다.
              </p>
            </div>
            <button className="h-11 rounded-md bg-zinc-950 px-5 text-sm font-semibold text-white">
              새 생산지시 등록
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {menuItems.map((item) => (
            <article
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
              key={item.title}
            >
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {item.count}
                </span>
              </div>
              <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-600">{item.description}</p>
              <p className="mt-4 text-sm font-medium text-zinc-900">{item.status}</p>
            </article>
          ))}
        </div>

        <section className="rounded-lg border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-5 py-4">
            <h2 className="text-lg font-semibold">최근 발주서</h2>
            <p className="mt-1 text-sm text-zinc-600">
              실제 API 연결 전 화면 확인을 위한 임시 데이터입니다.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="bg-zinc-100 text-zinc-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">발주 번호</th>
                  <th className="px-5 py-3 font-semibold">제품명</th>
                  <th className="px-5 py-3 font-semibold">수량</th>
                  <th className="px-5 py-3 font-semibold">납기일</th>
                  <th className="px-5 py-3 font-semibold">상태</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr className="border-t border-zinc-100" key={order.no}>
                    <td className="px-5 py-4 font-medium">{order.no}</td>
                    <td className="px-5 py-4">{order.product}</td>
                    <td className="px-5 py-4">{order.quantity}</td>
                    <td className="px-5 py-4">{order.dueDate}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
