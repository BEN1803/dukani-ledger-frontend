import api from "@/lib/api";
import type { WorkerRequest } from "@/types";

export const workersService = {
  add: (data: WorkerRequest) =>
    api.post("/workers", data).then((r) => r.data),
};
