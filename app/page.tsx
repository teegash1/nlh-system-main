"use client"

import { AppShell } from "@/components/layout/app-shell"
import { StatCard } from "@/components/dashboard/stat-card"
import { StockChart } from "@/components/dashboard/stock-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { TaskSummary } from "@/components/dashboard/task-summary"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { LowStockAlert } from "@/components/dashboard/low-stock-alert"
import { CalendarWidget } from "@/components/dashboard/calendar-widget"
import { Package, TrendingUp, DollarSign, AlertTriangle } from "lucide-react"
import { useEffect } from "react"

export default function DashboardPage() {
  useEffect(() => {
    console.log("[v0] Dashboard page mounted")
  }, [])
  
  return (
    <AppShell title="Dashboard" subtitle="Welcome back! Here's your stock overview.">
      <div className="p-4 md:p-6 space-y-6">
        {/* Welcome Section - Mobile */}
        <div className="md:hidden">
          <h1 className="text-xl font-semibold text-foreground">Hi, Admin</h1>
          <p className="text-sm text-muted-foreground">
            Here's your stock overview for today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Items"
            value="156"
            change={12}
            changeLabel="vs last month"
            trend="up"
            icon={<Package className="h-5 w-5 text-chart-1" />}
          />
          <StatCard
            title="Stock Value"
            value="KES 89,240"
            change={3.89}
            changeLabel="vs last month"
            trend="up"
            icon={<DollarSign className="h-5 w-5 text-chart-2" />}
          />
          <StatCard
            title="Monthly Spend"
            value="KES 16,237"
            change={-5.2}
            changeLabel="vs last month"
            trend="down"
            icon={<TrendingUp className="h-5 w-5 text-chart-5" />}
          />
          <StatCard
            title="Low Stock Items"
            value="4"
            changeLabel="Requires attention"
            trend="neutral"
            icon={<AlertTriangle className="h-5 w-5 text-chart-3" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            <StockChart />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CategoryChart />
              <TaskSummary />
            </div>
          </div>

          {/* Right Column - Sidebar Content */}
          <div className="space-y-6">
            <CalendarWidget />
            <LowStockAlert />
            <ActivityFeed />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
