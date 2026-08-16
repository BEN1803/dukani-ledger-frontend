import api from "@/lib/api";
import type { SaleRequest, SaleResponse, UpdateSaleRequest, PageResponse } from "@/types";

export const salesService = {
  create: (data: SaleRequest) =>
    api.post<SaleResponse>("/sales", data).then((r) => r.data),

  update: (id: number, data: UpdateSaleRequest) =>
    api.put<SaleResponse>(`/sales/${id}`, data).then((r) => r.data),

  list: (page = 0, size = 10) =>
    api
      .get<PageResponse<SaleResponse>>("/sales", {
        params: { page, size },
      })
      .then((r) => r.data),

  listForProduct: (productId: number, page = 0, size = 10) =>
    api
      .get<PageResponse<SaleResponse>>(`/sales/product/${productId}`, {
        params: { page, size },
      })
      .then((r) => r.data),
};
