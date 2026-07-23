"use client"
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { format } from "date-fns";
import { ClipboardList } from "lucide-react";

export default function ActivityLogsPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useActivityLogs(page);

  return (
    <DashboardLayout>
      <RoleGuard allowedRoles={["OWNER", "ADMIN"]}>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Activity Logs</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Track all actions performed in the system
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : data && data.content.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                          <th className="text-left py-3 px-2 font-medium text-zinc-500">User</th>
                          <th className="text-left py-3 px-2 font-medium text-zinc-500">Action</th>
                          <th className="text-left py-3 px-2 font-medium text-zinc-500">Entity</th>
                          <th className="text-left py-3 px-2 font-medium text-zinc-500">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.content.map((log) => (
                          <tr key={log.id} className="border-b border-zinc-100 dark:border-zinc-800">
                            <td className="py-3 px-2">{log.userName}</td>
                            <td className="py-3 px-2">
                              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium dark:bg-zinc-800">
                                {log.action}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-zinc-500">{log.entity}</td>
                            <td className="py-3 px-2 text-zinc-500">
                              {format(new Date(log.timeStamp), "MMM d, yyyy HH:mm:ss")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-zinc-500">
                      Page {data.number + 1} of {data.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={data.first} onClick={() => setPage((p) => p - 1)}>
                        Previous
                      </Button>
                      <Button variant="outline" size="sm" disabled={data.last} onClick={() => setPage((p) => p + 1)}>
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                  <ClipboardList className="h-12 w-12 mb-3" />
                  <p className="text-sm">No activity logs yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </RoleGuard>
    </DashboardLayout>
  );
}
