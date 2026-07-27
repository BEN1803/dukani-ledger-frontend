"use client"
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="rounded-full bg-red-100 p-4 mb-4 dark:bg-red-900/20">
          <ShieldAlert className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="mt-2 text-forest-600 dark:text-muted-foreground">
          You don&apos;t have permission to access this page.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </DashboardLayout>
  );
}
