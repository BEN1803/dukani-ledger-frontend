"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { salesService } from "@/services/sales.service";
import posthog from "@/lib/posthog";
import type { SaleRequest, UpdateSaleRequest } from "@/types";

export function useSales(page = 0, size = 10) {
  return useQuery({
    queryKey: ["sales", page, size],
    queryFn: () => salesService.list(page, size),
  });
}

export function useAllSales(date?: string) {
  return useQuery({
    queryKey: ["sales", "all", date],
    queryFn: async () => {
      const firstPage = await salesService.list(0, 100);
      if (firstPage.totalPages <= 1) return firstPage.content;

      const remaining = await Promise.all(
        Array.from({ length: firstPage.totalPages - 1 }, (_, i) =>
          salesService.list(i + 1, 100)
        )
      );

      return [
        ...firstPage.content,
        ...remaining.flatMap((p) => p.content),
      ];
    },
    select: (sales) => {
      if (!date) return sales;
      return sales.filter((sale) => {
        if (!sale.soldAt) return false;
        const saleDate = new Date(sale.soldAt);
        const target = new Date(date + "T00:00:00");
        return (
          saleDate.getFullYear() === target.getFullYear() &&
          saleDate.getMonth() === target.getMonth() &&
          saleDate.getDate() === target.getDate()
        );
      });
    },
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["profits"] });
      posthog.capture("sale_created", { productId: variables.productId, quantity: variables.quantity, sellingPrice: variables.sellingPrice });
      toast.success("Sale completed successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Sale failed");
    },
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSaleRequest }) =>
      salesService.update(id, data),
    onSuccess: (_data, { id, data }) => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["profits"] });
      posthog.capture("sale_updated", { saleId: id, sellingPrice: data.sellingPrice });
      toast.success("Sale updated successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to update sale");
    },
  });
}
