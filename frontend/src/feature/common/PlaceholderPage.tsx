type PlaceholderPageProps = {
  title: string;
};

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-2 px-8 py-6">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="text-sm text-slate-500">임시 화면입니다.</p>
    </section>
  );
}
