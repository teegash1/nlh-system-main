import { NextResponse } from "next/server"
import { format, startOfWeek, subWeeks } from "date-fns"

import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
  }

  const reportDate = format(new Date(), "yyyy-MM-dd")
  const periodStart = subWeeks(new Date(), 8)
  const periodEnd = new Date()

  const meta = {
    reportTitle: "Usage Trends Report",
    periodLabel: `${format(periodStart, "MMM d")} - ${format(periodEnd, "MMM d, yyyy")}`,
    periodStart: format(periodStart, "yyyy-MM-dd"),
    periodEnd: format(periodEnd, "yyyy-MM-dd"),
    reportDate,
  }

  const { data: moves, error: movesError } = await supabase
    .from("stock_moves")
    .select("item_id, quantity, occurred_at, item:inventory_items(name, category:inventory_categories(name))")
    .eq("move_type", "out")
    .gte("occurred_at", periodStart.toISOString())
    .order("occurred_at", { ascending: true })

  if (movesError) {
    return NextResponse.json({ ok: false, message: movesError.message }, { status: 500 })
  }

  const weeklyTotals = new Map<string, number>()
  const itemTotals = new Map<string, { name: string; category: string; total: number }>()
  let totalUsage = 0

  for (const move of moves ?? []) {
    const qty = Number(move.quantity ?? 0)
    totalUsage += qty
    const weekStart = startOfWeek(new Date(move.occurred_at), { weekStartsOn: 1 })
    const label = format(weekStart, "MMM d")
    weeklyTotals.set(label, (weeklyTotals.get(label) ?? 0) + qty)

    const itemName = move.item?.name ?? "Unknown"
    const itemCategory = move.item?.category?.name ?? "Uncategorized"
    const existing = itemTotals.get(move.item_id)
    if (existing) {
      existing.total += qty
    } else {
      itemTotals.set(move.item_id, { name: itemName, category: itemCategory, total: qty })
    }
  }

  const weeklyUsage = Array.from(weeklyTotals.entries()).map(([weekLabel, total]) => ({
    weekLabel,
    total,
  }))

  const topItems = Array.from(itemTotals.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  const summary = {
    totalUsage,
    topItem: topItems[0]?.name ?? null,
  }

  return NextResponse.json({
    ok: true,
    data: {
      meta,
      summary,
      weeklyUsage,
      topItems,
    },
  })
}
