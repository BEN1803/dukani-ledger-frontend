"use client"
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/auth.service";
import type { LoginRequest, RegisterRequest, BusinessRequest, ChangePasswordRequest } from "@/types";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (res) => {
      setAuth(res.token, res.email, "OWNER");
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
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authService.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to change password");
    },
  });
}
