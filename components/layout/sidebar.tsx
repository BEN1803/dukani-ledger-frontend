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
  section: "operations" | "management" | "account";
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["OWNER", "ADMIN", "WORKER"], section: "operations" },
  { label: "Products", href: "/products", icon: Package, roles: ["OWNER", "ADMIN", "WORKER"], section: "operations" },
  { label: "Sales", href: "/sales", icon: DollarSign, roles: ["OWNER", "ADMIN", "WORKER"], section: "operations" },
  { label: "Stock", href: "/stock", icon: Boxes, roles: ["OWNER", "ADMIN", "WORKER"], section: "operations" },
  { label: "Categories", href: "/categories", icon: Tags, roles: ["OWNER", "ADMIN"], section: "management" },
  { label: "Purchases", href: "/purchases", icon: ShoppingCart, roles: ["OWNER", "ADMIN"], section: "management" },
  { label: "Workers", href: "/workers", icon: Users, roles: ["OWNER"], section: "management" },
  { label: "Activity Logs", href: "/activity-logs", icon: ClipboardList, roles: ["OWNER", "ADMIN"], section: "management" },
  { label: "Reports", href: "/reports", icon: BarChart3, roles: ["OWNER", "ADMIN"], section: "management" },
  { label: "Profile", href: "/profile", icon: UserCircle, roles: ["OWNER", "ADMIN", "WORKER"], section: "account" },
];

const sectionTitles: Partial<Record<NavItem["section"], string>> = {
  operations: "Operations",
  management: "Management",
  account: "Account",
};

export function Sidebar() {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);
  const email = useAuthStore((s) => s.email);
  const { open, toggle, mobileOpen, setMobileOpen } = useSidebarStore();
  const logout = useAuthStore((s) => s.logout);

  const visibleItems = navItems.filter(
    (item) => role && item.roles.includes(role)
  );

  const roleLabel = role
    ? role === "ADMIN"
      ? "Administrator"
      : role.charAt(0) + role.slice(1).toLowerCase()
    : "—";

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
          "fixed top-0 left-0 z-50 flex h-screen flex-col overflow-y-auto bg-sidebar text-sidebar-foreground transition-all duration-300 lg:sticky lg:top-0 lg:z-auto",
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

        <nav className="space-y-4 p-3">
          {(["operations", "management", "account"] as const).map((section) => {
            const sectionItems = visibleItems.filter((item) => item.section === section);
            if (sectionItems.length === 0) return null;
            return (
              <div key={section} className="space-y-1">
                {open && (
                  <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-forest-300">
                    {sectionTitles[section]}
                  </p>
                )}
                {sectionItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href || pathname.startsWith(item.href + "/");
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
              </div>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 p-3">
          <div className="space-y-2">
            <div
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-lg bg-white/5 px-3 py-2.5 text-sm ring-1 ring-white/10",
                open ? "w-full" : "justify-center px-2"
              )}
              title={!open ? email ?? "Account" : undefined}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-950/45 text-sm font-semibold text-white shadow-inner ring-1 ring-white/10">
                {(email?.charAt(0) ?? "U").toUpperCase()}
              </div>
              {open && (
                <div className="min-w-0">
                  <p className="truncate font-semibold leading-5 text-forest-50">{email ?? "Signed in"}</p>
                  <p className="truncate text-xs font-medium leading-4 text-forest-300">{roleLabel}</p>
                </div>
              )}
            </div>
            <button
              onClick={() => { logout(); window.location.href = "/login"; }}
              className={cn(
                "flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-forest-100 transition-colors hover:bg-forest-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                !open && "justify-center px-2"
              )}
              title={!open ? "Logout" : undefined}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {open && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
