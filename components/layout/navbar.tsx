"use client"
import { useTheme } from "@/lib/theme-provider";
import { useAuthStore } from "@/store/auth-store";
import { useSidebarStore } from "@/store/sidebar-store";
import { usePathname } from "next/navigation";
import {
  Menu,
  Moon,
  Sun,
  LogOut,
  User,
  Settings,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/products": "Products Inventory",
  "/categories": "Categories",
  "/purchases": "Purchases",
  "/sales": "Sales Records",
  "/stock": "Stock Levels",
  "/workers": "Workers",
  "/activity-logs": "Activity Logs",
  "/reports": "Business Reports",
  "/profile": "Profile",
  "/change-password": "Change Password",
};

const roleLabels: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Administrator",
  WORKER: "Worker",
};

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { email, role, logout } = useAuthStore();
  const { setMobileOpen } = useSidebarStore();
  const router = useRouter();
  const pathname = usePathname();
  const [clock, setClock] = useState("");

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const update = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }));
      const nextMinute = new Date(now);
      nextMinute.setSeconds(0, 0);
      nextMinute.setMinutes(nextMinute.getMinutes() + 1);
      timeout = setTimeout(update, nextMinute.getTime() - now.getTime() + 100);
    };

    update();
    return () => clearTimeout(timeout);
  }, []);

  const initials = email?.charAt(0).toUpperCase() || "U";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const pageTitle = Object.entries(pageTitles).find(([path]) =>
    pathname === path || pathname.startsWith(path + "/")
  )?.[1] || "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-forest-700 bg-navbar px-4 text-navbar-foreground">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-navbar-foreground hover:bg-forest-700"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <h1 className="text-lg font-semibold">{pageTitle}</h1>

      <div className="flex-1" />

      <span className="text-sm text-forest-100">{clock}</span>

      <Button
        variant="ghost"
        size="icon"
        className="text-navbar-foreground hover:bg-forest-700 relative"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="text-navbar-foreground hover:bg-forest-700"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-forest-700">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-forest-700 text-white text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{email}</span>
              <span className="text-xs text-muted-foreground">
                {role ? roleLabels[role] ?? role : "—"}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile" className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/change-password" className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Change Password
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
