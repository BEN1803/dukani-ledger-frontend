import api from "@/lib/api";
import type { CategoryRequest, CategoryResponse } from "@/types";

export const categoriesService = {
  list: () =>
    api.get<CategoryResponse[]>("/categories").then((r) => r.data),

  create: (data: CategoryRequest) =>
    api.post<CategoryResponse>("/categories", data).then((r) => r.data),
};
