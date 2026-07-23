"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { purchasesService } from "@/services/purchases.service";
import type { PurchaseRequest } from "@/types";

export function usePurchases(page = 0, size = 10) {
  return useQuery({
    queryKey: ["purchases", page, size],
    queryFn: () => purchasesService.list(page, size),
  });
}

export function usePurchase(id: number) {
  return useQuery({
    queryKey: ["purchases", id],
    queryFn: () => purchasesService.getById(id),
    enabled: !!id,
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PurchaseRequest) => purchasesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      toast.success("Purchase recorded successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to record purchase");
    },
  });
}
