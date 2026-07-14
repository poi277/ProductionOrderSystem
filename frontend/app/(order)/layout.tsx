import OrderLayout from "@/src/feature/layout/OrderLayout";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <OrderLayout>{children}</OrderLayout>;
}
