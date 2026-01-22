"use client"

import dynamic from "next/dynamic"

import {
  ActivityFeedSkeleton,
  CalendarWidgetSkeleton,
  CategoryChartSkeleton,
  LowStockAlertSkeleton,
  ShoppingListSkeleton,
  StockChartSkeleton,
  TaskSummarySkeleton,
} from "@/components/dashboard/dashboard-skeletons"

const StockChart = dynamic(
  () => import("@/components/dashboard/stock-chart").then((mod) => mod.StockChart),
  { ssr: false, loading: () => <StockChartSkeleton /> }
)
const CategoryChart = dynamic(
  () =>
    import("@/components/dashboard/category-chart").then(
      (mod) => mod.CategoryChart
    ),
  { ssr: false, loading: () => <CategoryChartSkeleton /> }
)
const TaskSummary = dynamic(
  () => import("@/components/dashboard/task-summary").then((mod) => mod.TaskSummary),
  { ssr: false, loading: () => <TaskSummarySkeleton /> }
)
const CalendarWidget = dynamic(
  () =>
    import("@/components/dashboard/calendar-widget").then(
      (mod) => mod.CalendarWidget
    ),
  { ssr: false, loading: () => <CalendarWidgetSkeleton /> }
)
const LowStockAlert = dynamic(
  () =>
    import("@/components/dashboard/low-stock-alert").then(
      (mod) => mod.LowStockAlert
    ),
  { ssr: false, loading: () => <LowStockAlertSkeleton /> }
)
const ActivityFeed = dynamic(
  () =>
    import("@/components/dashboard/activity-feed").then(
      (mod) => mod.ActivityFeed
    ),
  { ssr: false, loading: () => <ActivityFeedSkeleton /> }
)
const ShoppingList = dynamic(
  () =>
    import("@/components/dashboard/shopping-list").then(
      (mod) => mod.ShoppingList
    ),
  { ssr: false, loading: () => <ShoppingListSkeleton /> }
)

type Activity = {
  id: string
  type: "stock_update" | "low_stock" | "report" | "increase" | "completed"
  title: string
  description: string
  time: string
}

type CategoryDatum = {
  name: string
  value: number
  color: string
}

type ShoppingListItem = {
  id: string
  name: string
  current: number
  threshold: number
  unit: string
  category: string
  source?: "low" | "manual"
}

type ShoppingListOverride = {
  item_id: string
  desired_qty: number | null
  unit_price: number | null
  notes?: string | null
  excluded?: boolean | null
}

type CalendarEvent = {
  date: string
  colorClass: string
}

type CalendarTask = {
  id: string
  title: string
  type: string
  time: string
  color: string
  date: string
}

type ReminderRow = {
  id: string
  title: string
  notes: string | null
  start_at: string
  recurrence: string | null
  color: string | null
}

export function DashboardClientSections({
  stockChartData,
  stockChartRange,
  stockChartTotal,
  categoryChartData,
  totalItems,
  pendingCounts,
  inProgressCounts,
  completedCounts,
  completionRate,
  calendarLabel,
  calendarEvents,
  upcomingTasks,
  initialWeekStartIso,
  reminders,
  lowStockItems,
  activities,
  shoppingListItems,
  shoppingOverrides,
  catalogItems,
}: {
  stockChartData: Array<{ month: string; value: number; highlight: boolean }>
  stockChartRange: string
  stockChartTotal: string
  categoryChartData: CategoryDatum[]
  totalItems: number
  pendingCounts: number
  inProgressCounts: number
  completedCounts: number
  completionRate: number
  calendarLabel: string
  calendarEvents: CalendarEvent[]
  upcomingTasks: CalendarTask[]
  initialWeekStartIso: string
  reminders: ReminderRow[]
  lowStockItems: ShoppingListItem[]
  activities: Activity[]
  shoppingListItems: ShoppingListItem[]
  shoppingOverrides: ShoppingListOverride[]
  catalogItems: ShoppingListItem[]
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <StockChart
          data={stockChartData}
          rangeLabel={stockChartRange}
          totalLabel={stockChartTotal}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CategoryChart data={categoryChartData} totalCount={totalItems} />
          <TaskSummary
            pending={pendingCounts}
            inProgress={inProgressCounts}
            completed={completedCounts}
            completionRate={completionRate}
          />
        </div>
        <ShoppingList
          items={shoppingListItems}
          overrides={shoppingOverrides}
          catalogItems={catalogItems}
        />
      </div>

      <div className="space-y-6">
        <CalendarWidget
          todayLabel={calendarLabel}
          events={calendarEvents}
          upcomingTasks={upcomingTasks}
          initialWeekStart={new Date(initialWeekStartIso)}
          reminders={reminders}
        />
        <LowStockAlert items={lowStockItems} />
        <ActivityFeed activities={activities} />
      </div>
    </div>
  )
}
