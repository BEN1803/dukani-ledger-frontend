import api from "@/lib/api";
import type { StockResponse } from "@/types";

export const stockService = {
  list: () =>
    api.get<StockResponse[]>("/stock").then((r) => r.data),
};
