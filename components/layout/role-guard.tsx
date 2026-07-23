"use client"
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import type { Role } from "@/types";

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const role = useAuthStore((s) => s.role);
  const router = useRouter();

  if (!role || !allowedRoles.includes(role)) {
    router.push("/unauthorized");
    return null;
  }

  return <>{children}</>;
}
