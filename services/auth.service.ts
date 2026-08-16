import api from "@/lib/api";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  BusinessRequest,
  ChangePasswordRequest,
} from "@/types";

export const authService = {
  login: (data: LoginRequest) =>
    api.post<LoginResponse>("/auth/login", data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    api.post("/auth/register", data).then((r) => r.data),

  registerBusiness: (data: BusinessRequest) =>
    api.post("/business/registration", data).then((r) => r.data),

  changePassword: (data: ChangePasswordRequest) =>
    api.post("/auth/change-password", data).then((r) => r.data),
};
