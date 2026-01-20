import { NextResponse } from "next/server"
import { startOfWeek, endOfWeek, format, parseISO } from "date-fns"

import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

const getNumericCount = (rawValue: string | null, qtyNumeric: number | null) => {
  if (typeof qtyNumeric === "number" && Number.isFinite(qtyNumeric)) {
    return Number(qtyNumeric)
  }
  const raw = String(rawValue ?? "").trim().toLowerCase()
  if (!raw) return null
  if (raw === "nil" || raw === "none") return 0
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw)
  return null
}

export async function GET() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
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
    reportTitle: "Weekly Stock Report",
    periodLabel: latestDate
      ? `${format(startOfWeek(parseISO(latestDate), { weekStartsOn: 1 }), "MMM d")} - ${format(
          endOfWeek(parseISO(latestDate), { weekStartsOn: 1 }),
          "MMM d, yyyy"
        )}`
      : null,
    periodStart: latestDate
      ? format(startOfWeek(parseISO(latestDate), { weekStartsOn: 1 }), "yyyy-MM-dd")
      : null,
    periodEnd: latestDate
      ? format(endOfWeek(parseISO(latestDate), { weekStartsOn: 1 }), "yyyy-MM-dd")
      : null,
    reportDate,
  }

  const { data: items, error: itemsError } = await supabase
    .from("inventory_items")
    .select("id, name, unit, reorder_level, category:inventory_categories(name)")
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
    qty_unit: string | null
  }> = []

  if (latestDate && itemIds.length > 0) {
    const { data: countRows, error: countsError } = await supabase
      .from("stock_counts")
      .select("item_id, raw_value, qty_numeric, qty_unit")
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

  let countedItems = 0
  let lowStockItems = 0
  let outOfStockItems = 0

  const rows = (items ?? []).map((item: any) => {
    const count = countMap.get(item.id)
    if (count) countedItems += 1
    const numericCount = getNumericCount(count?.raw_value ?? null, count?.qty_numeric ?? null)

    let status = "in-stock"
    if (numericCount == null) {
      status = "low-stock"
      lowStockItems += 1
    } else if (numericCount <= 0) {
      status = "out-of-stock"
      outOfStockItems += 1
    } else if (
      item.reorder_level != null &&
      numericCount <= Number(item.reorder_level)
    ) {
      status = "low-stock"
      lowStockItems += 1
    }

    return {
      item: item.name,
      category: item.category?.name ?? "Uncategorized",
      unit: item.unit ?? "pcs",
      reorderLevel: item.reorder_level ?? null,
      rawValue: count?.raw_value ?? "—",
      qtyNumeric: numericCount,
      status,
    }
  })

  const summary = {
    totalItems: itemIds.length,
    countedItems,
    lowStockItems,
    outOfStockItems,
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
