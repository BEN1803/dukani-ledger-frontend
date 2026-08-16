"use client"
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth.service";
import { resolveRoleFromWorkers } from "@/lib/resolve-role";
import type { LoginRequest, RegisterRequest, BusinessRequest, ChangePasswordRequest } from "@/types";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setRole = useAuthStore((s) => s.setRole);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: async (res) => {
      setAuth(res.token, res.email, res.role ?? null);
      const role = res.role ?? (await resolveRoleFromWorkers(res.email));
      setRole(role);
      toast.success("Logged in successfully");
      router.push("/dashboard");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Login failed");
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: () => {
      toast.success("Registration successful");
      router.push("/login");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Registration failed");
    },
  });
}

export function useRegisterBusiness() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: BusinessRequest) => authService.registerBusiness(data),
    onSuccess: () => {
      toast.success("Business created successfully");
      router.push("/login");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Registration failed");
    },
  });
}

export function useChangePassword() {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authService.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully. Please sign in again.");
      logout();
      router.push("/login");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to change password");
    },
  });
}
