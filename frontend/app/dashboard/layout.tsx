import ProtectedRoute from "@/lib/utils/protectedRoute";
import DashboardSidebar from "@/components/mysidebar/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SidebarProvider>
        <DashboardSidebar />
        <main>
          <SidebarTrigger />
          <div className="p-6" style={{ width:"82vw" }}>
            <ProtectedRoute>{children}</ProtectedRoute>
          </div>
        </main>
      </SidebarProvider>
    </>
  );
}
