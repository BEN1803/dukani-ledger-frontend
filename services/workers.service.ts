import api from "@/lib/api";
import type { WorkerRequest, WorkerResponse, UpdateWorkerRequest } from "@/types";

export const workersService = {
  add: (data: WorkerRequest) =>
    api.post("/workers", data).then((r) => r.data),

  getAll: () =>
    api.get<WorkerResponse[]>("/workers").then((r) => r.data),

  update: (id: number, data: UpdateWorkerRequest) =>
    api.put<WorkerResponse>(`/workers/${id}`, data).then((r) => r.data),

  updateStatus: (id: number, status: string) =>
    api.patch<WorkerResponse>(`/workers/${id}/status`, { status }).then((r) => r.data),
};
