import MyHeader from "@/components/myheader/header";

export default function PerfumesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <MyHeader />
      <div>{children}</div>
    </>
  );
}
