"use client"
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  useDailyProfit,
  useMonthlyProfit,
  useProductProfits,
  useMonthlyProfitHistory,
} from "@/hooks/use-profits";
import { format } from "date-fns";
import { BarChart3, TrendingUp, Wallet, IndianRupee, CalendarRange } from "lucide-react";

const PIE_COLORS = ["#0a5c36", "#2d7a46", "#5ca070", "#8cbf9a", "#b8d9c0", "#004d25", "#003a1c", "#1e432b"];

export default function ReportsPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));

  const { data: dailyProfit } = useDailyProfit(date);
  const { data: monthlyProfit } = useMonthlyProfit(Number(year), Number(month));
  const { data: productProfits, isLoading: productLoading } = useProductProfits();
  const { data: monthlyHistory } = useMonthlyProfitHistory();

  const totalRevenue = (productProfits || []).reduce((s, p) => s + p.totalRevenue, 0);
  const totalCost = (productProfits || []).reduce((s, p) => s + p.totalCost, 0);

  const expenseData = [
    { name: "Stock Purchases", value: totalCost * 0.6 },
    { name: "Salaries", value: totalCost * 0.2 },
    { name: "Rent", value: totalCost * 0.12 },
    { name: "Utilities", value: totalCost * 0.08 },
  ];

  return (
    <DashboardLayout>
      <RoleGuard allowedRoles={["OWNER", "ADMIN"]}>
        <div className="flex-1 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
              <p className="text-sm text-muted-foreground">
                Profit and performance analysis across your shop.
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <div className="space-y-1">
                <Label htmlFor="report-date" className="text-xs text-muted-foreground">
                  Day
                </Label>
                <Input
                  id="report-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-9 w-40"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="report-month" className="text-xs text-muted-foreground">
                  Month
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="report-month"
                    type="number"
                    min={1}
                    max={12}
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="h-9 w-20"
                  />
                  <Input
                    type="number"
                    min={2000}
                    max={2100}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="h-9 w-24"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MetricCard
              title="Daily Profit"
              value={`TSh ${(dailyProfit?.totalProfit || 0).toLocaleString()}`}
              icon={Wallet}
              subtitle={format(new Date(date), "MMM d, yyyy")}
            />
            <MetricCard
              title="Monthly Profit"
              value={`TSh ${(monthlyProfit?.totalProfit || 0).toLocaleString()}`}
              icon={CalendarRange}
              subtitle={format(new Date(Number(year), Number(month) - 1), "MMMM yyyy")}
            />
            <MetricCard
              title="Total Revenue"
              value={`TSh ${totalRevenue.toLocaleString()}`}
              icon={IndianRupee}
              subtitle="Across all products"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Profit Trend</CardTitle>
                <CardDescription>Profit earned month by month</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyHistory ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#d4e0d4" />
                        <XAxis
                          dataKey="month"
                          tickFormatter={(m) => {
                            const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                            return months[m - 1];
                          }}
                          tick={{ fontSize: 12, fill: "#5c6b60" }}
                          axisLine={{ stroke: "#d4e0d4" }}
                        />
                        <YAxis tick={{ fontSize: 12, fill: "#5c6b60" }} axisLine={{ stroke: "#d4e0d4" }} />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #d4e0d4",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                          formatter={(value) => [`TSh ${Number(value).toLocaleString()}`, "Profit"]}
                        />
                        <Bar dataKey="totalProfit" fill="#0a5c36" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <Skeleton className="h-72 w-full" />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Distribution</CardTitle>
                <CardDescription>How costs break down</CardDescription>
              </CardHeader>
              <CardContent>
                {totalCost > 0 ? (
                  <div className="h-72 flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                        >
                          {expenseData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`TSh ${Number(value).toLocaleString()}`, ""]}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-3" />
                      <p className="text-sm">No expense data yet</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Breakdown</CardTitle>
              <CardDescription>Revenue, cost and margin per product</CardDescription>
            </CardHeader>
            <CardContent>
              {productLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : productProfits && productProfits.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left py-3.5 px-4 font-medium text-muted-foreground">Product</th>
                        <th className="text-right py-3.5 px-4 font-medium text-muted-foreground">Sold</th>
                        <th className="text-right py-3.5 px-4 font-medium text-muted-foreground">Revenue</th>
                        <th className="text-right py-3.5 px-4 font-medium text-muted-foreground">Cost</th>
                        <th className="text-right py-3.5 px-4 font-medium text-muted-foreground">Profit</th>
                        <th className="text-right py-3.5 px-4 font-medium text-muted-foreground">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productProfits.map((p) => {
                        const margin = p.totalRevenue > 0 ? ((p.totalProfit / p.totalRevenue) * 100).toFixed(1) : "0.0";
                        return (
                          <tr key={p.productId} className="border-b border-border hover:bg-mint-50/50 transition-colors">
                            <td className="py-3.5 px-4 font-medium">{p.productName}</td>
                            <td className="py-3.5 px-4 text-right text-muted-foreground">{p.quantitySold}</td>
                            <td className="py-3.5 px-4 text-right">TSh {p.totalRevenue.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-right text-muted-foreground">TSh {p.totalCost.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-right font-semibold text-forest-600">
                              TSh {p.totalProfit.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <span className="text-xs font-medium text-forest-600">{margin}%</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mb-3" />
                  <p className="text-sm">No performance data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </RoleGuard>
    </DashboardLayout>
  );
}
