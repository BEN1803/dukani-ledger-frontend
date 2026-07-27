"use client"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRegister } from "@/hooks/use-auth";
import type { Role } from "@/types";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["OWNER", "ADMIN", "WORKER"] as const),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const registerMut = useRegister();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "WORKER" },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMut.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 dark:bg-forest-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-mint-100 dark:bg-forest-900">
            <Store className="h-6 w-6 text-forest-600 dark:text-mint-400" />
          </div>
          <CardTitle className="text-2xl">Create account</CardTitle>
          <CardDescription>Register for a Dukani account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                onValueChange={(v: Role) => setValue("role", v)}
                defaultValue="WORKER"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OWNER">Owner</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="WORKER">Worker</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={registerMut.isPending}
            >
              {registerMut.isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="text-forest-600 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
