import { NextResponse } from "next/server"
import { format, parseISO } from "date-fns"

import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const parseNumericText = (value: string | null) => {
  const raw = String(value ?? "").trim().toLowerCase()
  if (!raw) return null
  if (raw === "nil" || raw === "none") return 0
  const match = raw.match(/-?\d+(\.\d+)?/)
  return match ? Number(match[0]) : null
}

const getNumericCount = (rawValue: string | null, qtyNumeric: number | null) => {
  if (typeof qtyNumeric === "number" && Number.isFinite(qtyNumeric)) {
    return Number(qtyNumeric)
  }
  return parseNumericText(rawValue)
}

export async function GET() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
  }

  const { data: latestMonth, error: monthError } = await supabase
    .from("monthly_stocktake_rows")
    .select("month_start")
    .order("month_start", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (monthError) {
    return NextResponse.json({ ok: false, message: monthError.message }, { status: 500 })
  }

  if (latestMonth?.month_start) {
    const monthStart = latestMonth.month_start
    const { data: monthlyRows, error: monthlyError } = await supabase
      .from("monthly_stocktake_rows")
      .select(
        "item_id, qty_end, cost, item:inventory_items(name, unit, category:inventory_categories(name))"
      )
      .eq("month_start", monthStart)

    if (monthlyError) {
      return NextResponse.json({ ok: false, message: monthlyError.message }, { status: 500 })
    }

    let totalValue = 0
    let valuedItems = 0

    const rows = (monthlyRows ?? []).map((row: any) => {
      const qty = parseNumericText(row.qty_end)
      const unitCost = parseNumericText(row.cost)
      const value = qty != null && unitCost != null ? qty * unitCost : null
      if (value != null) {
        totalValue += value
        valuedItems += 1
      }
      return {
        item: row.item?.name ?? "Unknown item",
        category: row.item?.category?.name ?? "Uncategorized",
        unit: row.item?.unit ?? "pcs",
        quantity: qty,
        unitCost,
        value,
      }
    })

    const meta = {
      reportTitle: "Inventory Valuation",
      periodLabel: `As of ${format(parseISO(monthStart), "MMM d, yyyy")}`,
      periodStart: monthStart,
      periodEnd: monthStart,
      reportDate: format(new Date(), "yyyy-MM-dd"),
    }

    return NextResponse.json({
      ok: true,
      data: {
        meta,
        summary: {
          totalItems: rows.length,
          valuedItems,
          totalValue,
        },
        rows,
      },
    })
  }

  const { data: latestRow, error: latestError } = await supabase
    .from("stock_counts")
    .select("count_date")
    .order("count_date", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestError) {
    return NextResponse.json({ ok: false, message: latestError.message }, { status: 500 })
  }

  const latestDate = latestRow?.count_date ?? null
  const reportDate = format(new Date(), "yyyy-MM-dd")

  const meta = {
    reportTitle: "Inventory Valuation",
    periodLabel: latestDate ? `As of ${format(parseISO(latestDate), "MMM d, yyyy")}` : null,
    periodStart: latestDate ?? null,
    periodEnd: latestDate ?? null,
    reportDate,
  }

  const { data: items, error: itemsError } = await supabase
    .from("inventory_items")
    .select("id, name, unit, category:inventory_categories(name)")
    .eq("is_active", true)
    .order("name")

  if (itemsError) {
    return NextResponse.json({ ok: false, message: itemsError.message }, { status: 500 })
  }

  const itemIds = (items ?? []).map((item) => item.id)
  let counts: Array<{
    item_id: string
    raw_value: string
    qty_numeric: number | null
  }> = []

  if (latestDate && itemIds.length > 0) {
    const { data: countRows, error: countsError } = await supabase
      .from("stock_counts")
      .select("item_id, raw_value, qty_numeric")
      .eq("count_date", latestDate)
      .in("item_id", itemIds)

    if (countsError) {
      return NextResponse.json({ ok: false, message: countsError.message }, { status: 500 })
    }

    counts = countRows ?? []
  }

  const countMap = new Map<string, typeof counts[number]>()
  counts.forEach((count) => {
    countMap.set(count.item_id, count)
  })

  let costRows: Array<{ item_id: string; unit_cost: number | null }> = []
  if (itemIds.length > 0) {
    const { data: costs, error: costsError } = await supabase
      .from("stock_moves")
      .select("item_id, unit_cost, occurred_at")
      .eq("move_type", "in")
      .not("unit_cost", "is", null)
      .in("item_id", itemIds)
      .order("occurred_at", { ascending: false })
      .limit(1000)

    if (costsError) {
      return NextResponse.json({ ok: false, message: costsError.message }, { status: 500 })
    }

    costRows = costs ?? []
  }

  const costMap = new Map<string, number>()
  costRows.forEach((row) => {
    if (!costMap.has(row.item_id)) {
      costMap.set(row.item_id, Number(row.unit_cost))
    }
  })

  let totalValue = 0
  let valuedItems = 0

  const rows = (items ?? []).map((item: any) => {
    const count = countMap.get(item.id)
    const qty = getNumericCount(count?.raw_value ?? null, count?.qty_numeric ?? null)
    const unitCost = costMap.get(item.id) ?? null
    const value = qty != null && unitCost != null ? qty * unitCost : null
    if (value != null) {
      totalValue += value
      valuedItems += 1
    }
    return {
      item: item.name,
      category: item.category?.name ?? "Uncategorized",
      unit: item.unit ?? "pcs",
      quantity: qty,
      unitCost,
      value,
    }
  })

  const summary = {
    totalItems: itemIds.length,
    valuedItems,
    totalValue,
  }

  return NextResponse.json({
    ok: true,
    data: {
      meta,
      summary,
      rows,
    },
  })
}
