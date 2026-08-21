"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { workersService } from "@/services/workers.service";
import posthog from "@/lib/posthog";
import type { WorkerRequest, UpdateWorkerRequest } from "@/types";

export function useWorkers(enabled = true) {
  return useQuery({
    queryKey: ["workers"],
    queryFn: () => workersService.getAll(),
    enabled,
  });
}

export function useAddWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WorkerRequest) => workersService.add(data),
    onSuccess: (_data, variables) => {
      toast.success("Worker added successfully");
      posthog.capture("worker_added", { fullname: variables.fullname, email: variables.email, gender: variables.gender });
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to add worker");
    },
  });
}

export function useUpdateWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWorkerRequest }) =>
      workersService.update(id, data),
    onSuccess: (_data, { id, data }) => {
      toast.success("Worker updated successfully");
      posthog.capture("worker_updated", { workerId: id, ...data });
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to update worker");
    },
  });
}

export function useUpdateWorkerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      workersService.updateStatus(id, status),
    onSuccess: (_data, { id, status }) => {
      toast.success("Worker status updated");
      posthog.capture("worker_status_changed", { workerId: id, status });
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to update status");
    },
  });
}
