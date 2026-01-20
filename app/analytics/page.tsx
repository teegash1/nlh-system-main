import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StockChart } from "@/components/dashboard/stock-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { StatCard } from "@/components/dashboard/stat-card"
import { TrendingUp, TrendingDown, BarChart3, PieChart } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <AppShell title="Analytics" subtitle="Insights and data visualization">
      <div className="p-4 md:p-6 space-y-6">
        {/* Page Header - Mobile */}
        <div className="md:hidden">
          <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Track inventory trends and patterns
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Avg Monthly Spend"
            value="KES 5,849"
            change={3.89}
            changeLabel="vs prev. quarter"
            trend="up"
            icon={<TrendingUp className="h-5 w-5 text-chart-2" />}
          />
          <StatCard
            title="Stock Turnover"
            value="4.2x"
            change={12}
            changeLabel="improvement"
            trend="up"
            icon={<BarChart3 className="h-5 w-5 text-chart-1" />}
          />
          <StatCard
            title="Waste Reduction"
            value="15%"
            change={-8}
            changeLabel="vs last year"
            trend="down"
            icon={<TrendingDown className="h-5 w-5 text-chart-4" />}
          />
          <StatCard
            title="Category Balance"
            value="Good"
            changeLabel="Optimized"
            trend="neutral"
            icon={<PieChart className="h-5 w-5 text-chart-5" />}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StockChart />
          <CategoryChart />
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">
                Top Consumed Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Coffee Sachets", consumption: 85, color: "chart-1" },
                  { name: "Sugar", consumption: 72, color: "chart-2" },
                  { name: "Tissue Rolls", consumption: 68, color: "chart-3" },
                  { name: "Teabags", consumption: 54, color: "chart-5" },
                  { name: "Plastic Cups", consumption: 45, color: "chart-4" },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{item.name}</span>
                      <span className="text-sm font-medium text-muted-foreground">
                        {item.consumption}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-${item.color}`}
                        style={{ width: `${item.consumption}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">
                Monthly Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { month: "January", value: 4600, change: 8.5 },
                  { month: "December", value: 5100, change: 12.3 },
                  { month: "November", value: 3800, change: -5.2 },
                  { month: "October", value: 4200, change: 3.1 },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.month}</p>
                      <p className="text-xs text-muted-foreground">2025/2026</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        KES {item.value.toLocaleString()}
                      </p>
                      <p className={`text-xs ${item.change > 0 ? "text-chart-2" : "text-chart-4"}`}>
                        {item.change > 0 ? "+" : ""}{item.change}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
