"use client"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddWorker } from "@/hooks/use-workers";
import { Users } from "lucide-react";

const workerSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  gender: z.enum(["MALE", "FEMALE"]),
});

type WorkerForm = z.infer<typeof workerSchema>;

export default function WorkersPage() {
  const addWorker = useAddWorker();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<WorkerForm>({
    resolver: zodResolver(workerSchema),
    defaultValues: { gender: "MALE" },
  });

  const onSubmit = (data: WorkerForm) => {
    addWorker.mutate(data, {
      onSuccess: () => {
        reset();
        setSuccess(true);
      },
    });
  };

  return (
    <DashboardLayout>
      <RoleGuard allowedRoles={["OWNER"]}>
        <div className="mx-auto max-w-lg space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Workers</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Add workers to your business
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Worker</CardTitle>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-emerald-100 p-3 mb-4 dark:bg-emerald-900">
                    <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium">Worker added successfully!</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSuccess(false)}
                  >
                    Add Another
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input id="fullname" placeholder="Jane Doe" {...register("fullname")} />
                    {errors.fullname && <p className="text-xs text-red-500">{errors.fullname.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="worker@example.com" {...register("email")} />
                      {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" placeholder="Min. 6 chars" {...register("password")} />
                      {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" placeholder="+254 700 000 000" {...register("phone")} />
                      {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select onValueChange={(v: "MALE" | "FEMALE") => setValue("gender", v)} defaultValue="MALE">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" placeholder="Nairobi, Kenya" {...register("address")} />
                    {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={addWorker.isPending}>
                    {addWorker.isPending ? "Adding..." : "Add Worker"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </RoleGuard>
    </DashboardLayout>
  );
}
