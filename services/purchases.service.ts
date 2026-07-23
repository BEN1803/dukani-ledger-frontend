import api from "@/lib/api";
import type { PurchaseRequest, PurchaseResponse, PageResponse } from "@/types";

export const purchasesService = {
  create: (data: PurchaseRequest) =>
    api.post<PurchaseResponse>("/purchases", data).then((r) => r.data),

  getById: (id: number) =>
    api.get<PurchaseResponse>(`/purchases/${id}`).then((r) => r.data),

  list: (page = 0, size = 10) =>
    api
      .get<PageResponse<PurchaseResponse>>("/purchases", {
        params: { page, size },
      })
      .then((r) => r.data),
};
