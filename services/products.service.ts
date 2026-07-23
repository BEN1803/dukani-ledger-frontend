import api from "@/lib/api";
import type { ProductResponse, UpdateProductRequest } from "@/types";

export const productsService = {
  list: () =>
    api.get<ProductResponse[]>("/products").then((r) => r.data),

  getById: (id: number) =>
    api.get<ProductResponse>(`/products/${id}`).then((r) => r.data),

  update: (id: number, data: UpdateProductRequest) =>
    api.put<ProductResponse>(`/products/${id}`, data).then((r) => r.data),
};
