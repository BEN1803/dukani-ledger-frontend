import { workersService } from "@/services/workers.service";
import type { Role } from "@/types";

export async function resolveRoleFromWorkers(email: string): Promise<Role> {
  try {
    const workers = await workersService.getAll();
    return workers.some((w) => w.email === email) ? "WORKER" : "OWNER";
  } catch {
    return "OWNER";
  }
}