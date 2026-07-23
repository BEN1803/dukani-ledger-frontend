"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { salesService } from "@/services/sales.service";
import type { SaleRequest } from "@/types";

export function useSales(page = 0, size = 10) {
  return useQuery({
    queryKey: ["sales", page, size],
    queryFn: () => salesService.list(page, size),
  });
}

export function useSalesForProduct(productId: number, page = 0, size = 10) {
  return useQuery({
    queryKey: ["sales", "product", productId, page, size],
    queryFn: () => salesService.listForProduct(productId, page, size),
    enabled: !!productId,
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SaleRequest) => salesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["profits"] });
      toast.success("Sale completed successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Sale failed");
    },
  });
}
