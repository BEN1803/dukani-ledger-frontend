"use client"
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useDailyProfit, useMonthlyProfit, useProductProfits, useDailyProfitHistory } from "@/hooks/use-profits";
import { format } from "date-fns";
import { BarChart3 } from "lucide-react";

const COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#047857", "#065f46", "#064e3b"];

export default function ReportsPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));

  const { data: dailyProfit, isLoading: dailyLoading } = useDailyProfit(date);
  const { data: monthlyProfit, isLoading: monthlyLoading } = useMonthlyProfit(Number(year), Number(month));
  const { data: productProfits, isLoading: productLoading } = useProductProfits();
  const { data: dailyHistory } = useDailyProfitHistory();

  return (
    <DashboardLayout>
      <RoleGuard allowedRoles={["OWNER", "ADMIN"]}>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Profit and performance analytics
            </p>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="products">By Product</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Daily Profit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                        />
                      </div>
                      {dailyLoading ? (
                        <Skeleton className="h-16 w-full" />
                      ) : (
                        <div className="rounded-lg bg-emerald-50 p-4 text-center dark:bg-emerald-900/20">
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Profit</p>
                          <p className="text-3xl font-bold text-emerald-600">
                            KSh {(dailyProfit?.totalProfit || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            {format(new Date(date), "MMM d, yyyy")}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Monthly Profit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="year">Year</Label>
                          <Input
                            id="year"
                            type="number"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="month">Month</Label>
                          <Input
                            id="month"
                            type="number"
                            min={1}
                            max={12}
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                          />
                        </div>
                      </div>
                      {monthlyLoading ? (
                        <Skeleton className="h-16 w-full" />
                      ) : (
                        <div className="rounded-lg bg-emerald-50 p-4 text-center dark:bg-emerald-900/20">
                          <p className="text-sm text-zinc-500">Total Profit</p>
                          <p className="text-3xl font-bold text-emerald-600">
                            KSh {(monthlyProfit?.totalProfit || 0).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Daily Profit Trend (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  {dailyHistory ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyHistory}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(d) => format(new Date(d), "MMM d")}
                            tick={{ fontSize: 12 }}
                            stroke="#a1a1aa"
                          />
                          <YAxis tick={{ fontSize: 12 }} stroke="#a1a1aa" />
                          <Tooltip
                            contentStyle={{ borderRadius: "12px", border: "1px solid #e5e5e5" }}
                            labelFormatter={(d) => format(new Date(d), "MMM d, yyyy")}
                            formatter={(value: number) => [`KSh ${value.toLocaleString()}`, "Profit"]}
                          />
                          <Bar dataKey="totalProfit" fill="#059669" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <Skeleton className="h-72 w-full" />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profit by Product</CardTitle>
                </CardHeader>
                <CardContent>
                  {productLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : productProfits && productProfits.length > 0 ? (
                    <div className="space-y-6">
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={productProfits.slice(0, 8)}
                              dataKey="totalProfit"
                              nameKey="productName"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={({ productName, percent }) =>
                                `${productName} (${(percent * 100).toFixed(0)}%)`
                              }
                            >
                              {productProfits.slice(0, 8).map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => [`KSh ${value.toLocaleString()}`, "Profit"]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-zinc-200 dark:border-zinc-800">
                              <th className="text-left py-3 px-2 font-medium text-zinc-500">Product</th>
                              <th className="text-right py-3 px-2 font-medium text-zinc-500">Sold</th>
                              <th className="text-right py-3 px-2 font-medium text-zinc-500">Revenue</th>
                              <th className="text-right py-3 px-2 font-medium text-zinc-500">Cost</th>
                              <th className="text-right py-3 px-2 font-medium text-zinc-500">Profit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productProfits.map((p) => (
                              <tr key={p.productId} className="border-b border-zinc-100 dark:border-zinc-800">
                                <td className="py-3 px-2 font-medium">{p.productName}</td>
                                <td className="py-3 px-2 text-right">{p.quantitySold}</td>
                                <td className="py-3 px-2 text-right">KSh {p.totalRevenue.toLocaleString()}</td>
                                <td className="py-3 px-2 text-right">KSh {p.totalCost.toLocaleString()}</td>
                                <td className="py-3 px-2 text-right font-semibold text-emerald-600">
                                  KSh {p.totalProfit.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                      <BarChart3 className="h-12 w-12 mb-3" />
                      <p className="text-sm">No profit data yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </RoleGuard>
    </DashboardLayout>
  );
}
