"use client"
import { useQuery } from "@tanstack/react-query";
import { activityLogsService } from "@/services/activity-logs.service";

export function useActivityLogs(page = 0, size = 20) {
  return useQuery({
    queryKey: ["activity-logs", page, size],
    queryFn: () => activityLogsService.list(page, size),
  });
}

export function useActivityLogsForUser(userId: number, page = 0, size = 20) {
  return useQuery({
    queryKey: ["activity-logs", "user", userId, page, size],
    queryFn: () => activityLogsService.forUser(userId, page, size),
    enabled: !!userId,
  });
}
