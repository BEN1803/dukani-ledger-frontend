"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { purchasesService } from "@/services/purchases.service";
import { useAuthStore } from "@/store/auth-store";
import { useWorkers } from "@/hooks/use-workers";
import posthog from "@/lib/posthog";
import type { PageResponse, PurchaseRequest, PurchaseResponse } from "@/types";

const WORKER_PURCHASES_PAGE_SIZE = 100;

const normalizeIdentity = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

function getWorkerIdentifiers(workerName: string | null, email: string | null) {
  const identifiers = new Set<string>();
  const normalizedName = workerName ? normalizeIdentity(workerName) : "";
  const normalizedEmail = email ? normalizeIdentity(email) : "";
  const emailLocal = email ? normalizeIdentity(email.split("@")[0] ?? "") : "";

  if (normalizedName) identifiers.add(normalizedName);
  if (normalizedEmail) identifiers.add(normalizedEmail);
  if (emailLocal) identifiers.add(emailLocal);

  for (const part of normalizedName.split(" ")) {
    if (part) identifiers.add(part);
  }

  return identifiers;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  if (error instanceof Error) return error.message;

  return fallback;
}

function paginatePurchases(
  purchases: PurchaseResponse[],
  page: number,
  size: number
): PageResponse<PurchaseResponse> {
  const totalElements = purchases.length;
  const totalPages = Math.ceil(totalElements / size);
  const start = page * size;
  const content = purchases.slice(start, start + size);

  return {
    content,
    totalPages,
    totalElements,
    size,
    number: page,
    first: page === 0,
    last: totalPages === 0 || page >= totalPages - 1,
    empty: content.length === 0,
  };
}

async function listAllPurchasePages() {
  const firstPage = await purchasesService.list(0, WORKER_PURCHASES_PAGE_SIZE);
  if (firstPage.totalPages <= 1) return firstPage.content;

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
      purchasesService.list(index + 1, WORKER_PURCHASES_PAGE_SIZE)
    )
  );

  return [
    ...firstPage.content,
    ...remainingPages.flatMap((pageData) => pageData.content),
  ];
}

export function usePurchases(page = 0, size = 10, enabled = true) {
  const role = useAuthStore((s) => s.role);
  const email = useAuthStore((s) => s.email);
  const { data: workers } = useWorkers(enabled && role === "WORKER");
  const workerName =
    role === "WORKER"
      ? workers?.find((worker) => worker.email === email)?.fullname ?? email
      : null;
  const workerIdentifiers = getWorkerIdentifiers(workerName, email);

  return useQuery({
    queryKey: ["purchases", role, workerName, email, page, size],
    queryFn: async () => {
      if (role !== "WORKER") {
        return purchasesService.list(page, size);
      }

      const purchases = await listAllPurchasePages();
      const ownPurchases = purchases.filter(
        (purchase) =>
          workerIdentifiers.has(normalizeIdentity(purchase.purchasedByName))
      );

      return paginatePurchases(ownPurchases, page, size);
    },
    enabled: enabled && !!role && (role !== "WORKER" || !!workerName),
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      posthog.capture("purchase_created", { productName: variables.productName, quantity: variables.quantity, costPrice: variables.costPrice });
      toast.success("Purchase recorded successfully");
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, "Failed to record purchase"));
    },
  });
}
