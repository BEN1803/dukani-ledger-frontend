"use client"
import { useMutation, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth.service";
import { resolveRoleFromWorkers } from "@/lib/resolve-role";
import type { LoginRequest, RegisterRequest, BusinessRequest, ChangePasswordRequest } from "@/types";

function getErrorMessage(err: unknown, fallback: string) {
  if (isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message || err.message || fallback;
  }

  if (err instanceof Error) {
    return err.message || fallback;
  }

  return fallback;
}

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
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Login failed"));
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
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Registration failed"));
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
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Registration failed"));
    },
  });
}

export function useBusinessProfile(enabled = true) {
  return useQuery({
    queryKey: ["business-profile"],
    queryFn: () => authService.getBusinessProfile(),
    enabled,
    retry: false,
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
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to change password"));
    },
  });
}
