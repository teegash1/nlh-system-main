import { AppShell } from "@/components/layout/app-shell"
import { StatCard } from "@/components/dashboard/stat-card"
import { StockChart } from "@/components/dashboard/stock-chart"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { TaskSummary } from "@/components/dashboard/task-summary"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { LowStockAlert } from "@/components/dashboard/low-stock-alert"
import { CalendarWidget } from "@/components/dashboard/calendar-widget"
import { Package, TrendingUp, DollarSign, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  endOfMonth,
  endOfWeek,
  format,
  formatDistanceToNow,
  isAfter,
  isBefore,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns"

const parseNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  const match = String(value ?? "").match(/-?\d+(\.\d+)?/)
  if (!match) return null
  return Number(match[0])
}

const parseCountValue = (value: unknown, rawValue?: string | null) => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  const raw = String(rawValue ?? "").trim().toLowerCase()
  if (!raw) return null
  if (raw === "nil" || raw === "none") return 0
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw)
  return null
}

type ReminderRow = {
  id: string
  title: string
  notes: string | null
  start_at: string
  recurrence: string | null
  color: string | null
}

const colorClassMap: Record<string, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
}

const recurrenceLabels: Record<string, string> = {
  none: "Reminder",
  weekly: "Weekly reminder",
  biweekly: "Bi-weekly reminder",
  monthly: "Monthly reminder",
  quarterly: "Quarterly reminder",
}

const buildOccurrences = (
  reminder: ReminderRow,
  rangeStart: Date,
  rangeEnd: Date
) => {
  const startAt = new Date(reminder.start_at)
  if (Number.isNaN(startAt.getTime())) return []

  const recurrence = reminder.recurrence ?? "none"
  if (recurrence === "none") {
    return isWithinInterval(startAt, { start: rangeStart, end: rangeEnd })
      ? [startAt]
      : []
  }

  const occurrences: Date[] = []
  if (recurrence === "weekly" || recurrence === "biweekly") {
    const interval = recurrence === "weekly" ? 1 : 2
    let occurrence = startAt
    if (isBefore(occurrence, rangeStart)) {
      const diffWeeks = differenceInCalendarWeeks(rangeStart, occurrence, {
        weekStartsOn: 1,
      })
      const steps = Math.floor(diffWeeks / interval) * interval
      occurrence = addWeeks(occurrence, steps)
      while (isBefore(occurrence, rangeStart)) {
        occurrence = addWeeks(occurrence, interval)
      }
    }
    while (!isAfter(occurrence, rangeEnd)) {
      occurrences.push(occurrence)
      occurrence = addWeeks(occurrence, interval)
    }
    return occurrences
  }

  if (recurrence === "monthly" || recurrence === "quarterly") {
    const interval = recurrence === "monthly" ? 1 : 3
    let occurrence = startAt
    if (isBefore(occurrence, rangeStart)) {
      const diffMonths = differenceInCalendarMonths(rangeStart, occurrence)
      const steps = Math.floor(diffMonths / interval) * interval
      occurrence = addMonths(occurrence, steps)
      while (isBefore(occurrence, rangeStart)) {
        occurrence = addMonths(occurrence, interval)
      }
    }
    while (!isAfter(occurrence, rangeEnd)) {
      occurrences.push(occurrence)
      occurrence = addMonths(occurrence, interval)
    }
    return occurrences
  }

  return []
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id ?? null
  let displayName = "there"
  let displayRole = "Viewer"

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", userId)
      .maybeSingle()
    if (profile?.full_name) {
      displayName = profile.full_name
    } else if (userData.user?.email) {
      displayName = userData.user.email.split("@")[0] ?? "there"
    }
    if (profile?.role) {
      displayRole = profile.role
    }
  }

  const now = new Date()
  const monthStart = startOfMonth(now)
  const prevMonthStart = startOfMonth(subMonths(now, 1))
  const chartStart = startOfMonth(subMonths(now, 3))
  const chartEnd = endOfMonth(now)
  const calendarStart = startOfWeek(subWeeks(now, 6), { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(addWeeks(now, 6), { weekStartsOn: 1 })

  const { data: itemsData, error: itemsError } = await supabase
    .from("inventory_items")
    .select("id, name, unit, reorder_level, category:inventory_categories(name)")
    .eq("is_active", true)
    .order("name")

  if (itemsError) throw new Error(itemsError.message)
  const items = itemsData ?? []
  const totalItems = items.length

  const categoryCounts = new Map<string, number>()
  items.forEach((item: any) => {
    const name = item.category?.name ?? "Uncategorized"
    categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1)
  })

  const categoryPalette = ["#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#f87171"]
  const categoryChartData = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count], index) => ({
      name,
      value: totalItems === 0 ? 0 : Math.round((count / totalItems) * 100),
      color: categoryPalette[index % categoryPalette.length],
    }))

  let receiptsRange: Array<{
    amount: number
    receipt_date: string
    status: string
  }> = []

  if (userId) {
    const { data: receiptsData, error: receiptsError } = await supabase
      .from("receipts")
      .select("amount, receipt_date, status")
      .eq("user_id", userId)
      .gte("receipt_date", format(chartStart, "yyyy-MM-dd"))
      .lte("receipt_date", format(chartEnd, "yyyy-MM-dd"))

    if (receiptsError) throw new Error(receiptsError.message)
    receiptsRange = (receiptsData ?? []).map((receipt) => ({
      amount: Number(receipt.amount ?? 0),
      receipt_date: receipt.receipt_date,
      status: receipt.status ?? "Pending",
    }))
  }

  const totalsByMonth = new Map<string, number>()
  const lastFourMonths = Array.from({ length: 4 }, (_, index) =>
    startOfMonth(subMonths(now, 3 - index))
  )
  lastFourMonths.forEach((date) => totalsByMonth.set(format(date, "yyyy-MM"), 0))
  receiptsRange.forEach((receipt) => {
    const key = format(parseISO(receipt.receipt_date), "yyyy-MM")
    if (!totalsByMonth.has(key)) return
    totalsByMonth.set(key, totalsByMonth.get(key)! + Number(receipt.amount || 0))
  })

  const monthlySpend = totalsByMonth.get(format(monthStart, "yyyy-MM")) ?? 0
  const prevMonthSpend = totalsByMonth.get(format(prevMonthStart, "yyyy-MM")) ?? 0
  const monthlySpendChange =
    prevMonthSpend > 0
      ? Number((((monthlySpend - prevMonthSpend) / prevMonthSpend) * 100).toFixed(2))
      : null

  const stockChartData = lastFourMonths.map((date, index) => ({
    month: format(date, "MMM"),
    value: totalsByMonth.get(format(date, "yyyy-MM")) ?? 0,
    highlight: index === lastFourMonths.length - 1,
  }))
  const stockChartRange = `${format(lastFourMonths[0], "MMM yyyy")} - ${format(
    lastFourMonths[lastFourMonths.length - 1],
    "MMM yyyy"
  )}`

  let stockValue = 0
  let stockValuePrev = 0
  const { data: stocktakeRows, error: stocktakeError } = await supabase
    .from("monthly_stocktake_rows")
    .select("month_start, qty_end, cost")
    .order("month_start", { ascending: false })
    .limit(240)

  if (stocktakeError) throw new Error(stocktakeError.message)

  if (stocktakeRows && stocktakeRows.length > 0) {
    const latestMonth = stocktakeRows[0].month_start
    const prevMonth = stocktakeRows.find((row) => row.month_start !== latestMonth)?.month_start

    const sumForMonth = (month: string | null) =>
      (stocktakeRows ?? [])
        .filter((row) => row.month_start === month)
        .reduce((sum, row) => {
          const qty = parseNumber(row.qty_end) ?? 0
          const cost = parseNumber(row.cost) ?? 0
          return sum + qty * cost
        }, 0)

    stockValue = sumForMonth(latestMonth)
    if (prevMonth) {
      stockValuePrev = sumForMonth(prevMonth)
    }
  }

  const stockValueChange =
    stockValuePrev > 0
      ? Number((((stockValue - stockValuePrev) / stockValuePrev) * 100).toFixed(2))
      : null

  const { data: latestCountDate, error: latestCountError } = await supabase
    .from("stock_counts")
    .select("count_date")
    .order("count_date", { ascending: false })
    .limit(1)

  if (latestCountError) throw new Error(latestCountError.message)

  const latestDate = latestCountDate?.[0]?.count_date ?? null
  let latestCounts: any[] = []

  if (latestDate) {
    const { data: countRows, error: countsError } = await supabase
      .from("stock_counts")
      .select(
        "id, item_id, count_date, raw_value, qty_numeric, item:inventory_items(name, unit, reorder_level, category:inventory_categories(name))"
      )
      .eq("count_date", latestDate)

    if (countsError) throw new Error(countsError.message)
    latestCounts = countRows ?? []
  }

  const countItemIds = new Set(latestCounts.map((row) => row.item_id))
  const missingCounts = items.filter((item: any) => !countItemIds.has(item.id))

  const lowStockItems = latestCounts
    .map((row) => {
      const current = parseCountValue(row.qty_numeric, row.raw_value)
      if (current == null) return null
      const threshold = row.item?.reorder_level ?? null
      if (current <= 0 || (threshold != null && current <= Number(threshold))) {
        return {
          id: row.item_id,
          name: row.item?.name ?? "Unknown item",
          current,
          threshold: Number(threshold ?? 0),
          unit: row.item?.unit ?? "pcs",
          category: row.item?.category?.name ?? "Uncategorized",
        }
      }
      return null
    })
    .filter(Boolean) as Array<{
    id: string
    name: string
    current: number
    threshold: number
    unit: string
    category: string
  }>

  const { count: pendingReceiptsCount } = userId
    ? await supabase
        .from("receipts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "Pending")
    : { count: 0 }

  const completedCounts = latestCounts.length
  let pendingCounts = 0
  let inProgressCounts = 0
  if (!latestDate) {
    pendingCounts = totalItems
  } else {
    const daysSinceLatest = differenceInCalendarDays(
      new Date(),
      parseISO(latestDate)
    )
    if (daysSinceLatest >= 3) {
      pendingCounts = missingCounts.length
      inProgressCounts = 0
    } else {
      inProgressCounts = missingCounts.length
      pendingCounts = 0
    }
  }
  const completionRate =
    totalItems > 0 ? Math.round((completedCounts / totalItems) * 100) : 0

  const { data: recentReceipts } = userId
    ? await supabase
        .from("receipts")
        .select("id, vendor, amount, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3)
    : { data: [] }

  const { data: recentCounts } = await supabase
    .from("stock_counts")
    .select("id, raw_value, created_at, item:inventory_items(name)")
    .order("created_at", { ascending: false })
    .limit(3)

  const activities = [
    ...(lowStockItems.slice(0, 1).map((item) => ({
      id: `low-${item.id}`,
      type: "low_stock" as const,
      title: "Low Stock Alert",
      description: `${item.name} below threshold - ${item.current} ${item.unit}`,
      time: "Just now",
      createdAt: now,
    })) ?? []),
    ...(recentCounts ?? []).map((row) => ({
      id: `count-${row.id}`,
      type: "stock_update" as const,
      title: "Stock Updated",
      description: `${row.item?.name ?? "Item"} count ${row.raw_value ?? "—"}`,
      time: row.created_at
        ? formatDistanceToNow(new Date(row.created_at), { addSuffix: true })
        : "Just now",
      createdAt: row.created_at ? new Date(row.created_at) : now,
    })),
    ...(recentReceipts ?? []).map((row) => ({
      id: `receipt-${row.id}`,
      type: "report" as const,
      title: "Receipt Logged",
      description: `${row.vendor ?? "Shoper"} • KES ${Number(row.amount ?? 0).toLocaleString()}`,
      time: row.created_at
        ? formatDistanceToNow(new Date(row.created_at), { addSuffix: true })
        : "Just now",
      createdAt: row.created_at ? new Date(row.created_at) : now,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map(({ createdAt, ...rest }) => rest)

  const calendarStartLabel = format(calendarStart, "yyyy-MM-dd")
  const calendarEndLabel = format(calendarEnd, "yyyy-MM-dd")

  let calendarReceipts: string[] = []
  if (userId) {
    const { data: receiptRows, error: receiptError } = await supabase
      .from("receipts")
      .select("receipt_date")
      .eq("user_id", userId)
      .gte("receipt_date", calendarStartLabel)
      .lte("receipt_date", calendarEndLabel)

    if (receiptError) throw new Error(receiptError.message)
    calendarReceipts = (receiptRows ?? []).map((row) => row.receipt_date)
  }

  const { data: countRows, error: countRangeError } = await supabase
    .from("stock_counts")
    .select("count_date")
    .gte("count_date", calendarStartLabel)
    .lte("count_date", calendarEndLabel)

  if (countRangeError) throw new Error(countRangeError.message)

  const calendarCounts = (countRows ?? []).map((row) => String(row.count_date))

  let reminders: ReminderRow[] = []
  if (userId) {
    const { data: reminderRows, error: reminderError } = await supabase
      .from("reminders")
      .select("id, title, notes, start_at, recurrence, color")
      .eq("user_id", userId)
      .order("start_at", { ascending: true })

    if (reminderError) throw new Error(reminderError.message)
    reminders = (reminderRows ?? []) as ReminderRow[]
  }

  const reminderOccurrences = reminders.flatMap((reminder) =>
    buildOccurrences(reminder, calendarStart, calendarEnd).map((date) => ({
      reminder,
      date,
    }))
  )

  const calendarEvents = [
    ...calendarReceipts.map((date) => ({
      date,
      colorClass: "bg-chart-2",
    })),
    ...calendarCounts.map((date) => ({
      date,
      colorClass: "bg-chart-1",
    })),
    ...reminderOccurrences.map((entry) => ({
      date: format(entry.date, "yyyy-MM-dd"),
      colorClass:
        colorClassMap[entry.reminder.color ?? "chart-1"] ?? "bg-chart-1",
    })),
  ]

  const reminderWindowStart = startOfDay(now)
  const reminderWindowEnd = endOfDay(addDays(now, 13))
  const upcomingReminderOccurrences = reminders
    .flatMap((reminder) =>
      buildOccurrences(reminder, reminderWindowStart, reminderWindowEnd).map(
        (date) => ({
          reminder,
          date,
        })
      )
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const reminderTasks = upcomingReminderOccurrences.slice(0, 4).map((entry) => {
    const recurrenceKey = entry.reminder.recurrence ?? "none"
    const label = recurrenceLabels[recurrenceKey] ?? "Reminder"
    const timeLabel = format(entry.date, "EEE • h:mm a")
    return {
      id: `reminder-${entry.reminder.id}-${entry.date.toISOString()}`,
      title: entry.reminder.title,
      type: label,
      time: timeLabel,
      color: colorClassMap[entry.reminder.color ?? "chart-1"] ?? "bg-chart-1",
    }
  })

  const upcomingTasks = [
    ...reminderTasks,
    ...(lowStockItems.length > 0
      ? [
          {
            id: "restock",
            title: `Restock ${lowStockItems[0].name}`,
            type: "Inventory",
            time: "Today",
            color: "bg-chart-3",
          },
        ]
      : []),
    ...((inProgressCounts + pendingCounts) > 0
      ? [
          {
            id: "count",
            title: "Complete stock counts",
            type: "Inventory",
            time: "This week",
            color: "bg-chart-1",
          },
        ]
      : []),
    ...(pendingReceiptsCount && pendingReceiptsCount > 0
      ? [
          {
            id: "receipts",
            title: "Review pending receipts",
            type: "Admin",
            time: "This week",
            color: "bg-chart-2",
          },
        ]
      : []),
  ].slice(0, 5)

  return (
    <AppShell
      title="Dashboard"
      subtitle={`Hi ${displayName}, here's your stock overview.`}
    >
      <div className="p-4 md:p-6 space-y-6">
        {/* Welcome Section - Mobile */}
        <div className="md:hidden">
          <h1 className="text-xl font-semibold text-foreground">
            Hi, {displayName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {displayRole} overview for today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Items"
            value={totalItems.toLocaleString()}
            changeLabel="Active items"
            trend="neutral"
            icon={<Package className="h-5 w-5 text-chart-1" />}
          />
          <StatCard
            title="Stock Value"
            value={`KES ${Math.round(stockValue).toLocaleString()}`}
            change={stockValueChange ?? undefined}
            changeLabel={stockValueChange == null ? "Latest valuation" : "vs last month"}
            trend={stockValueChange == null ? "neutral" : stockValueChange >= 0 ? "up" : "down"}
            icon={<DollarSign className="h-5 w-5 text-chart-2" />}
          />
          <StatCard
            title="Monthly Spend"
            value={`KES ${Math.round(monthlySpend).toLocaleString()}`}
            change={monthlySpendChange ?? undefined}
            changeLabel={monthlySpendChange == null ? "Current month" : "vs last month"}
            trend={monthlySpendChange == null ? "neutral" : monthlySpendChange >= 0 ? "up" : "down"}
            icon={<TrendingUp className="h-5 w-5 text-chart-5" />}
          />
          <StatCard
            title="Low Stock Items"
            value={lowStockItems.length.toLocaleString()}
            changeLabel={lowStockItems.length ? "Requires attention" : "All stocked"}
            trend="neutral"
            icon={<AlertTriangle className="h-5 w-5 text-chart-3" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            <StockChart
              data={stockChartData}
              rangeLabel={stockChartRange}
              totalLabel={`KES ${Math.round(stockChartData.reduce((sum, row) => sum + row.value, 0)).toLocaleString()}`}
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
          </div>

          {/* Right Column - Sidebar Content */}
          <div className="space-y-6">
            <CalendarWidget
              todayLabel={`Today, ${format(now, "d MMMM")}`}
              events={calendarEvents}
              upcomingTasks={upcomingTasks}
              initialWeekStart={startOfWeek(now, { weekStartsOn: 1 })}
            />
            <LowStockAlert items={lowStockItems} />
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
