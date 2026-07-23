"use client"
import { useQuery } from "@tanstack/react-query";
import { profitsService } from "@/services/profits.service";

export function useProductProfits() {
  return useQuery({
    queryKey: ["profits", "products"],
    queryFn: () => profitsService.byProduct(),
  });
}

export function useDailyProfit(date?: string) {
  return useQuery({
    queryKey: ["profits", "daily", date],
    queryFn: () => profitsService.daily(date),
  });
}

export function useDailyProfitHistory(start?: string, end?: string) {
  return useQuery({
    queryKey: ["profits", "daily-history", start, end],
    queryFn: () => profitsService.dailyHistory(start, end),
  });
}

export function useMonthlyProfit(year?: number, month?: number) {
  return useQuery({
    queryKey: ["profits", "monthly", year, month],
    queryFn: () => profitsService.monthly(year, month),
  });
}

export function useMonthlyProfitHistory(year?: number) {
  return useQuery({
    queryKey: ["profits", "monthly-history", year],
    queryFn: () => profitsService.monthlyHistory(year),
  });
}
