"use client"
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { Breadcrumbs } from "./breadcrumbs";
import { AuthGuard } from "./auth-guard";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
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
        </div>
      </div>
    </AuthGuard>
  );
}
