"use client"
import { useQuery } from "@tanstack/react-query";
import { profitsService } from "@/services/profits.service";

export function useProductProfits(enabled = true) {
  return useQuery({
    queryKey: ["profits", "products"],
    queryFn: () => profitsService.byProduct(),
    enabled,
  });
}

export function useDailyProfit(date?: string, enabled = true) {
  return useQuery({
    queryKey: ["profits", "daily", date],
    queryFn: () => profitsService.daily(date),
    enabled,
  });
}

export function useDailyProfitHistory(start?: string, end?: string, enabled = true) {
  return useQuery({
    queryKey: ["profits", "daily-history", start, end],
    queryFn: () => profitsService.dailyHistory(start, end),
    enabled,
  });
}

export function useMonthlyProfit(year?: number, month?: number, enabled = true) {
  return useQuery({
    queryKey: ["profits", "monthly", year, month],
    queryFn: () => profitsService.monthly(year, month),
    enabled,
  });
}

export function useMonthlyProfitHistory(year?: number, enabled = true) {
  return useQuery({
    queryKey: ["profits", "monthly-history", year],
    queryFn: () => profitsService.monthlyHistory(year),
    enabled,
  });
}
