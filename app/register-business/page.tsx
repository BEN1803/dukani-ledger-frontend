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
import { useRegisterBusiness } from "@/hooks/use-auth";

const businessSchema = z.object({
  shopName: z.string().min(1, "Shop name is required"),
  fullname: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  location: z.string().min(1, "Location is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type BusinessForm = z.infer<typeof businessSchema>;

export default function RegisterBusinessPage() {
  const registerBusiness = useRegisterBusiness();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessForm>({
    resolver: zodResolver(businessSchema),
  });

  const onSubmit = (data: BusinessForm) => {
    registerBusiness.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-900">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900">
            <Store className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-2xl">Register your business</CardTitle>
          <CardDescription>
            Create your shop and owner account in one step
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop Name</Label>
                <Input id="shopName" placeholder="My Shop" {...register("shopName")} />
                {errors.shopName && (
                  <p className="text-xs text-red-500">{errors.shopName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullname">Your Full Name</Label>
                <Input id="fullname" placeholder="John Doe" {...register("fullname")} />
                {errors.fullname && (
                  <p className="text-xs text-red-500">{errors.fullname.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="shop@example.com" {...register("email")} />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+254 700 000 000" {...register("phone")} />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Nairobi, Kenya" {...register("location")} />
                {errors.location && (
                  <p className="text-xs text-red-500">{errors.location.message}</p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Min. 6 characters" {...register("password")} />
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={registerBusiness.isPending}>
              {registerBusiness.isPending ? "Creating..." : "Create Business"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-600 hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
