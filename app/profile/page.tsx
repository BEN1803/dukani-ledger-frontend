"use client"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/auth-store";
import { useWorkers } from "@/hooks/use-workers";
import { useBusinessProfile, useChangePassword } from "@/hooks/use-auth";
import { formatDateSafe } from "@/lib/dates";
import { Mail, Phone, MapPin, User, ShieldCheck, KeyRound, Store } from "lucide-react";

const passwordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

type PasswordForm = z.infer<typeof passwordSchema>;

const roleLabels: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Administrator",
  WORKER: "Worker",
};

export default function ProfilePage() {
  const email = useAuthStore((s) => s.email);
  const role = useAuthStore((s) => s.role);
  const isWorker = role === "WORKER";
  const isOwner = role === "OWNER";
  const { data: workers } = useWorkers(isWorker);
  const { data: business, isLoading: businessLoading } = useBusinessProfile(isOwner);
  const changePassword = useChangePassword();

  const worker = isWorker
    ? workers?.find((w) => w.email === email)
    : undefined;
  const displayName = worker?.fullname || business?.fullname || email || "User";
  const displayEmail = worker?.email || business?.email || email;

  const initials = displayName.charAt(0).toUpperCase();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = (data: PasswordForm) => {
    changePassword.mutate(data, { onSuccess: () => reset() });
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-forest-600 dark:text-muted-foreground">
            Your account details
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-mint-100 text-xl text-forest-700 dark:bg-forest-900 dark:text-muted-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                {isWorker ? (
                  worker ? (
                    <>
                      <h2 className="text-xl font-semibold">{worker.fullname}</h2>
                      <p className="text-sm text-muted-foreground">{worker.email}</p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold">{email}</h2>
                      <p className="text-sm text-muted-foreground">
                        <Skeleton className="h-4 w-40" />
                      </p>
                    </>
                  )
                ) : isOwner && businessLoading ? (
                  <>
                    <Skeleton className="h-6 w-44" />
                    <Skeleton className="mt-2 h-4 w-52" />
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold">{displayName}</h2>
                    {displayEmail && (
                      <p className="text-sm text-muted-foreground">{displayEmail}</p>
                    )}
                  </>
                )}
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary">{roleLabels[role ?? ""] ?? role}</Badge>
                  {isWorker && worker && (
                    <Badge
                      variant={
                        worker.status === "ACTIVE"
                          ? "success"
                          : worker.status === "INACTIVE"
                          ? "warning"
                          : "destructive"
                      }
                    >
                      {worker.status}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-forest-600" />
                Owner Details
              </CardTitle>
              <CardDescription>Your business owner profile information</CardDescription>
            </CardHeader>
            <CardContent>
              {businessLoading ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      Full Name
                    </p>
                    <p className="font-medium">{business?.fullname || "—"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Store className="h-4 w-4" />
                      Shop Name
                    </p>
                    <p className="font-medium">{business?.shopName || "—"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      Email
                    </p>
                    <p className="font-medium">{business?.email || email || "—"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      Phone
                    </p>
                    <p className="font-medium">{business?.phone || "—"}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShieldCheck className="h-4 w-4" />
                      Registered
                    </p>
                    <p className="font-medium">
                      {business?.createdAt
                        ? formatDateSafe(business.createdAt, "MMM d, yyyy")
                        : "—"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Location
                    </p>
                    <p className="font-medium">{business?.location || "—"}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isWorker && worker && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-forest-600" />
                Personal Details
              </CardTitle>
              <CardDescription>Your worker profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="font-medium">{worker.email || "—"}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    Phone
                  </p>
                  <p className="font-medium">{worker.phone || "—"}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    Gender
                  </p>
                  <p className="font-medium capitalize">
                    {(worker.gender || "—").toLowerCase()}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    Started
                  </p>
                  <p className="font-medium">
                    {worker.createdAt
                      ? formatDateSafe(worker.createdAt, "MMM d, yyyy")
                      : "—"}
                  </p>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Address
                  </p>
                  <p className="font-medium">{worker.address || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-forest-600" />
              Change Password
            </CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Current Password</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  placeholder="Enter current password"
                  {...register("oldPassword")}
                />
                {errors.oldPassword && (
                  <p className="text-xs text-red-500">{errors.oldPassword.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Min. 8 characters"
                  {...register("newPassword")}
                />
                {errors.newPassword && (
                  <p className="text-xs text-red-500">{errors.newPassword.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={changePassword.isPending}>
                {changePassword.isPending ? "Updating..." : "Change Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
