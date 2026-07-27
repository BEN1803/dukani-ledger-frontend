"use client"
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";

export default function ProfilePage() {
  const email = useAuthStore((s) => s.email);
  const role = useAuthStore((s) => s.role);

  const initials = email?.charAt(0).toUpperCase() || "U";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-forest-600 dark:text-muted-foreground">Your account details</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-mint-100 text-forest-700 text-xl dark:bg-forest-900 dark:text-muted-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{email}</h2>
                <Badge variant="secondary" className="mt-1">{role}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
