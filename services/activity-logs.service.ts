import api from "@/lib/api";
import type { ActivityLogResponse, PageResponse } from "@/types";

export const activityLogsService = {
  list: (page = 0, size = 20) =>
    api
      .get<PageResponse<ActivityLogResponse>>("/activity-logs", {
        params: { page, size },
      })
      .then((r) => r.data),

  forUser: (userId: number, page = 0, size = 20) =>
    api
      .get<PageResponse<ActivityLogResponse>>(`/activity-logs/user/${userId}`, {
        params: { page, size },
      })
      .then((r) => r.data),
};
