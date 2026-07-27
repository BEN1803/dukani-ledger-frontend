"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  products: "Products",
  categories: "Categories",
  purchases: "Purchases",
  sales: "Sales",
  stock: "Stock",
  workers: "Workers",
  "activity-logs": "Activity Logs",
  reports: "Reports",
  profile: "Profile",
  "change-password": "Change Password",
  new: "New",
  edit: "Edit",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1.5 text-sm text-forest-600 dark:text-muted-foreground">
      <Link
        href="/dashboard"
        className="hover:text-forest-700 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {segments.map((segment, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        const isLast = i === segments.length - 1;

        return (
          <span key={segment} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5" />
            {isLast ? (
              <span className="text-forest-900 dark:text-mint-100 font-medium">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-forest-700 transition-colors"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
