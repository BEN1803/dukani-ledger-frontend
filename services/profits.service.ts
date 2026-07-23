import api from "@/lib/api";
import type {
  DailyProfitResponse,
  MonthlyProfitResponse,
  ProductProfitResponse,
} from "@/types";

export const profitsService = {
  byProduct: () =>
    api.get<ProductProfitResponse[]>("/profits/products").then((r) => r.data),

  daily: (date?: string) =>
    api
      .get<DailyProfitResponse>("/profits/daily", { params: { date } })
      .then((r) => r.data),

  dailyHistory: (start?: string, end?: string) =>
    api
      .get<DailyProfitResponse[]>("/profits/daily/history", {
        params: { start, end },
      })
      .then((r) => r.data),

  monthly: (year?: number, month?: number) =>
    api
      .get<MonthlyProfitResponse>("/profits/monthly", {
        params: { year, month },
      })
      .then((r) => r.data),

  monthlyHistory: (year?: number) =>
    api
      .get<MonthlyProfitResponse[]>("/profits/monthly/history", {
        params: { year },
      })
      .then((r) => r.data),
};
