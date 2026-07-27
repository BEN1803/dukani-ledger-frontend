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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWorkers, useAddWorker, useUpdateWorker, useUpdateWorkerStatus } from "@/hooks/use-workers";
import { Users, Search, Plus, Pencil } from "lucide-react";
import type { WorkerResponse, WorkerStatus } from "@/types";

const addWorkerSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  gender: z.enum(["MALE", "FEMALE"]),
});

const editWorkerSchema = z.object({
  fullname: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  gender: z.enum(["MALE", "FEMALE"]),
});

type AddWorkerForm = z.infer<typeof addWorkerSchema>;
type EditWorkerForm = z.infer<typeof editWorkerSchema>;

const statusBadgeVariant = (status: WorkerStatus): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "ACTIVE": return "default";
    case "INACTIVE": return "secondary";
    case "FIRED": return "destructive";
  }
};

export default function WorkersPage() {
  const { data: workers, isLoading } = useWorkers();
  const addWorker = useAddWorker();
  const updateWorker = useUpdateWorker();
  const updateStatus = useUpdateWorkerStatus();
  const [search, setSearch] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<WorkerResponse | null>(null);

  const addForm = useForm<AddWorkerForm>({
    resolver: zodResolver(addWorkerSchema),
    defaultValues: { gender: "MALE" },
  });

  const editForm = useForm<EditWorkerForm>({
    resolver: zodResolver(editWorkerSchema),
  });

  const filtered = (workers || []).filter((w) =>
    w.fullname.toLowerCase().includes(search.toLowerCase()) ||
    w.email.toLowerCase().includes(search.toLowerCase()) ||
    w.phone.toLowerCase().includes(search.toLowerCase())
  );

  const onAddSubmit = (data: AddWorkerForm) => {
    addWorker.mutate(data, {
      onSuccess: () => {
        addForm.reset();
        setAddDialogOpen(false);
      },
    });
  };

  const openEditDialog = (worker: WorkerResponse) => {
    setEditingWorker(worker);
    editForm.reset({
      fullname: worker.fullname,
      email: worker.email,
      phone: worker.phone,
      address: worker.address,
      gender: worker.gender,
    });
    setEditDialogOpen(true);
  };

  const onEditSubmit = (data: EditWorkerForm) => {
    if (!editingWorker) return;
    updateWorker.mutate(
      { id: editingWorker.id, data },
      { onSuccess: () => { setEditDialogOpen(false); setEditingWorker(null); } },
    );
  };

  return (
    <DashboardLayout>
      <RoleGuard allowedRoles={["OWNER"]}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-forest-800 dark:text-mint-200">Workers</h1>
              <p className="text-sm text-forest-600 dark:text-mint-400">
                Manage your workforce
              </p>
            </div>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Worker
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add Worker</DialogTitle>
                </DialogHeader>
                <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-fullname">Full Name</Label>
                    <Input id="add-fullname" placeholder="Jane Doe" {...addForm.register("fullname")} />
                    {addForm.formState.errors.fullname && <p className="text-xs text-red-500">{addForm.formState.errors.fullname.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="add-email">Email</Label>
                      <Input id="add-email" type="email" placeholder="worker@example.com" {...addForm.register("email")} />
                      {addForm.formState.errors.email && <p className="text-xs text-red-500">{addForm.formState.errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="add-password">Password</Label>
                      <Input id="add-password" type="password" placeholder="Min. 6 chars" {...addForm.register("password")} />
                      {addForm.formState.errors.password && <p className="text-xs text-red-500">{addForm.formState.errors.password.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="add-phone">Phone</Label>
                      <Input id="add-phone" placeholder="+254 700 000 000" {...addForm.register("phone")} />
                      {addForm.formState.errors.phone && <p className="text-xs text-red-500">{addForm.formState.errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select onValueChange={(v: "MALE" | "FEMALE") => addForm.setValue("gender", v)} defaultValue="MALE">
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
                    <Label htmlFor="add-address">Address</Label>
                    <Input id="add-address" placeholder="Nairobi, Kenya" {...addForm.register("address")} />
                    {addForm.formState.errors.address && <p className="text-xs text-red-500">{addForm.formState.errors.address.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={addWorker.isPending}>
                    {addWorker.isPending ? "Adding..." : "Add Worker"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search workers..."
              className="pl-9 max-w-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-forest-800 dark:text-mint-200">All Workers</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                  <Users className="h-12 w-12 mb-3 text-muted-foreground" />
                  <p className="text-sm">No workers found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border dark:border-forest-800">
                        <th className="text-left py-3 px-2 font-medium text-forest-700 dark:text-muted-foreground">Name</th>
                        <th className="text-left py-3 px-2 font-medium text-forest-700 dark:text-muted-foreground">Email</th>
                        <th className="text-left py-3 px-2 font-medium text-forest-700 dark:text-muted-foreground">Phone</th>
                        <th className="text-left py-3 px-2 font-medium text-forest-700 dark:text-muted-foreground">Gender</th>
                        <th className="text-center py-3 px-2 font-medium text-forest-700 dark:text-muted-foreground">Status</th>
                        <th className="text-right py-3 px-2 font-medium text-forest-700 dark:text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((worker) => (
                        <tr
                          key={worker.id}
                          className="border-b border-border hover:bg-mint-50/50 dark:border-forest-900 dark:hover:bg-forest-950/50 transition-colors"
                        >
                          <td className="py-3 px-2 font-medium text-forest-900 dark:text-mint-100">{worker.fullname}</td>
                          <td className="py-3 px-2 text-forest-700 dark:text-muted-foreground">{worker.email}</td>
                          <td className="py-3 px-2 text-forest-700 dark:text-muted-foreground">{worker.phone}</td>
                          <td className="py-3 px-2 text-forest-700 dark:text-muted-foreground">{worker.gender}</td>
                          <td className="py-3 px-2 text-center">
                            <Badge variant={statusBadgeVariant(worker.status)} className="capitalize">
                              {worker.status.toLowerCase()}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(worker)}>
                                <Pencil className="h-3.5 w-3.5 mr-1" />
                                Edit
                              </Button>
                              <Select
                                value={worker.status}
                                onValueChange={(v: WorkerStatus) =>
                                  updateStatus.mutate({ id: worker.id, status: v })
                                }
                              >
                                <SelectTrigger className="h-8 w-[130px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ACTIVE">Active</SelectItem>
                                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                                  <SelectItem value="FIRED">Fired</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Worker</DialogTitle>
              </DialogHeader>
              {editingWorker && (
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-fullname">Full Name</Label>
                    <Input id="edit-fullname" {...editForm.register("fullname")} />
                    {editForm.formState.errors.fullname && <p className="text-xs text-red-500">{editForm.formState.errors.fullname.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input id="edit-email" type="email" {...editForm.register("email")} />
                    {editForm.formState.errors.email && <p className="text-xs text-red-500">{editForm.formState.errors.email.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone</Label>
                      <Input id="edit-phone" {...editForm.register("phone")} />
                      {editForm.formState.errors.phone && <p className="text-xs text-red-500">{editForm.formState.errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select
                        value={editForm.watch("gender")}
                        onValueChange={(v: "MALE" | "FEMALE") => editForm.setValue("gender", v)}
                      >
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
                    <Label htmlFor="edit-address">Address</Label>
                    <Input id="edit-address" {...editForm.register("address")} />
                    {editForm.formState.errors.address && <p className="text-xs text-red-500">{editForm.formState.errors.address.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={updateWorker.isPending}>
                    {updateWorker.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </RoleGuard>
    </DashboardLayout>
  );
}
