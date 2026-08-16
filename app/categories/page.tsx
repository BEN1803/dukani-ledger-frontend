"use client"
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCategories, useCreateCategory } from "@/hooks/use-categories";
import { formatDateSafe } from "@/lib/dates";
import { Plus, Tags } from "lucide-react";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    createCategory.mutate(
      { name: name.trim() },
      { onSuccess: () => { setOpen(false); setName(""); } }
    );
  };

  return (
    <DashboardLayout>
      <RoleGuard allowedRoles={["OWNER", "ADMIN"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-sm text-forest-600 dark:text-muted-foreground">
              Organize your products
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter category name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreate} disabled={createCategory.isPending || !name.trim()} className="w-full">
                  {createCategory.isPending ? "Creating..." : "Create Category"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : categories && categories.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="text-left py-3 px-2 font-medium text-zinc-500">Name</th>
                      <th className="text-left py-3 px-2 font-medium text-zinc-500">Owner</th>
                      <th className="text-left py-3 px-2 font-medium text-zinc-500">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr
                        key={cat.id}
                        className="border-b border-zinc-100 dark:border-zinc-800"
                      >
                        <td className="py-3 px-2 font-medium">{cat.name}</td>
                        <td className="py-3 px-2 text-zinc-500">{cat.ownerName}</td>
                        <td className="py-3 px-2 text-zinc-500">
                          {formatDateSafe(cat.createdAt, "MMM d, yyyy")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                <Tags className="h-12 w-12 mb-3" />
                <p className="text-sm">No categories yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </RoleGuard>
    </DashboardLayout>
  );
}
