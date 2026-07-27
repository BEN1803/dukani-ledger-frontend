"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  DollarSign,
  Boxes,
  Users,
  ClipboardList,
  BarChart3,
  UserCircle,
  ChevronLeft,
  Store,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useSidebarStore } from "@/store/sidebar-store";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["OWNER", "ADMIN", "WORKER"] },
  { label: "Products", href: "/products", icon: Package, roles: ["OWNER", "ADMIN", "WORKER"] },
  { label: "Categories", href: "/categories", icon: Tags, roles: ["OWNER", "ADMIN", "WORKER"] },
  { label: "Purchases", href: "/purchases", icon: ShoppingCart, roles: ["OWNER", "ADMIN", "WORKER"] },
  { label: "Sales", href: "/sales", icon: DollarSign, roles: ["OWNER", "ADMIN", "WORKER"] },
  { label: "Stock", href: "/stock", icon: Boxes, roles: ["OWNER", "ADMIN", "WORKER"] },
  { label: "Workers", href: "/workers", icon: Users, roles: ["OWNER"] },
  { label: "Activity Logs", href: "/activity-logs", icon: ClipboardList, roles: ["OWNER", "ADMIN"] },
  { label: "Reports", href: "/reports", icon: BarChart3, roles: ["OWNER", "ADMIN"] },
  { label: "Profile", href: "/profile", icon: UserCircle, roles: ["OWNER", "ADMIN", "WORKER"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);
  const { open, toggle, mobileOpen, setMobileOpen } = useSidebarStore();
  const logout = useAuthStore((s) => s.logout);

  const visibleItems = navItems.filter(
    (item) => role && item.roles.includes(role)
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 lg:static lg:z-auto",
          open ? "w-64" : "w-16",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div
          className={cn(
          "flex h-16 items-center border-b border-forest-700 px-4",
          open ? "justify-between" : "justify-center"
        )}
      >
        {open && (
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <Store className="h-6 w-6" />
              <span>Dukani Ledger</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="hidden lg:flex text-sidebar-foreground hover:bg-forest-700"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                !open && "rotate-180"
              )}
            />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-forest-700 text-white"
                    : "text-forest-100 hover:bg-forest-700/50 hover:text-white",
                  !open && "justify-center px-2"
                )}
                title={!open ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {open && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-forest-700 p-3">
          <button
            onClick={() => { logout(); window.location.href = "/login"; }}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-forest-100 transition-colors hover:bg-forest-700 hover:text-white",
              !open && "justify-center px-2"
            )}
            title={!open ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {open && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
