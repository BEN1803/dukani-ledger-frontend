"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoriesService } from "@/services/categories.service";
import posthog from "@/lib/posthog";
import type { CategoryRequest } from "@/types";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesService.list(),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CategoryRequest) => categoriesService.create(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      posthog.capture("category_created", { name: variables.name });
      toast.success("Category created successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to create category");
    },
  });
}
