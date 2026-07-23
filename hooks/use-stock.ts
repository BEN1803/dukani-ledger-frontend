"use client"
import { useQuery } from "@tanstack/react-query";
import { stockService } from "@/services/stock.service";

export function useStock() {
  return useQuery({
    queryKey: ["stock"],
    queryFn: () => stockService.list(),
  });
}
