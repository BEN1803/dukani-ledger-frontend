"use client"
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  Package,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useProducts } from "@/hooks/use-products";
import { useStock } from "@/hooks/use-stock";
import { useDailyProfitHistory, useMonthlyProfitHistory, useProductProfits, useDailyProfit } from "@/hooks/use-profits";
import { useSales } from "@/hooks/use-sales";
import { format } from "date-fns";

export default function DashboardPage() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: stockData, isLoading: stockLoading } = useStock();
  const { data: dailyHistory } = useDailyProfitHistory();
  const { data: monthlyHistory } = useMonthlyProfitHistory();
  const { data: profitByProduct } = useProductProfits();
  const { data: todayProfit } = useDailyProfit(format(new Date(), "yyyy-MM-dd"));
  const { data: recentSales } = useSales(0, 5);

  const totalProducts = products?.length || 0;
  const lowStockItems = stockData?.filter((s) => s.quantityAvailable <= 5) || [];
  const totalStock = stockData?.reduce((sum, s) => sum + s.quantityAvailable, 0) || 0;

  const statCards = [
    {
      title: "Today's Profit",
      value: todayProfit?.totalProfit
        ? `KSh ${todayProfit.totalProfit.toLocaleString()}`
        : "KSh 0",
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Total Stock",
      value: totalStock,
      icon: TrendingUp,
      color: "text-violet-600",
      bg: "bg-violet-50 dark:bg-violet-900/20",
    },
    {
      title: "Low Stock Items",
      value: lowStockItems.length,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Overview of your business
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`rounded-xl p-3 ${stat.bg}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Profit Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyHistory ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyHistory}>
                      <defs>
                        <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(d) => format(new Date(d), "MMM d")}
                        tick={{ fontSize: 12 }}
                        stroke="#a1a1aa"
                      />
                      <YAxis tick={{ fontSize: 12 }} stroke="#a1a1aa" />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e5e5e5",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        labelFormatter={(d) => format(new Date(d), "MMM d, yyyy")}
                        formatter={(value: number) => [`KSh ${value.toLocaleString()}`, "Profit"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="totalProfit"
                        stroke="#059669"
                        strokeWidth={2}
                        fill="url(#profitGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Skeleton className="h-72 w-full" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Profit</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyHistory ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                      <XAxis
                        dataKey="month"
                        tickFormatter={(m) => {
                          const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
                          return months[m - 1];
                        }}
                        tick={{ fontSize: 12 }}
                        stroke="#a1a1aa"
                      />
                      <YAxis tick={{ fontSize: 12 }} stroke="#a1a1aa" />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e5e5e5",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
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
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              {profitByProduct ? (
                <div className="space-y-3">
                  {profitByProduct.slice(0, 5).map((p) => (
                    <div
                      key={p.productId}
                      className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
                    >
                      <div>
                        <p className="text-sm font-medium">{p.productName}</p>
                        <p className="text-xs text-zinc-500">{p.quantitySold} sold</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-600">
                          KSh {p.totalProfit.toLocaleString()}
                        </p>
                        <p className="text-xs text-zinc-500">profit</p>
                      </div>
                    </div>
                  ))}
                  {profitByProduct.length === 0 && (
                    <p className="text-sm text-zinc-500 text-center py-8">No sales data yet</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              {recentSales ? (
                <div className="space-y-3">
                  {recentSales.content.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
                    >
                      <div>
                        <p className="text-sm font-medium">{sale.productName}</p>
                        <p className="text-xs text-zinc-500">
                          {format(new Date(sale.soldAt), "MMM d, HH:mm")} &middot; {sale.soldByName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          KSh {sale.totalPrice.toLocaleString()}
                        </p>
                        <p className="text-xs text-zinc-500">x{sale.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {recentSales.content.length === 0 && (
                    <p className="text-sm text-zinc-500 text-center py-8">No sales yet</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
