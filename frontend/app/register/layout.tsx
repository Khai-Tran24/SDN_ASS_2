import MyHeader from "@/components/myheader/header";

export default function layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <MyHeader />
      <div>{children}</div>
    </>
  );
}
