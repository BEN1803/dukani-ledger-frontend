"use client"
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { workersService } from "@/services/workers.service";
import type { WorkerRequest } from "@/types";

export function useAddWorker() {
  return useMutation({
    mutationFn: (data: WorkerRequest) => workersService.add(data),
    onSuccess: () => {
      toast.success("Worker added successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to add worker");
    },
  });
}
