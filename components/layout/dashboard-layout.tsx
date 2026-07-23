"use client"
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { Breadcrumbs } from "./breadcrumbs";
import { AuthGuard } from "./auth-guard";
import { useSidebarStore } from "@/store/sidebar-store";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const open = useSidebarStore((s) => s.open);

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Navbar />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mb-4">
              <Breadcrumbs />
            </div>
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </AuthGuard>
  );
}
