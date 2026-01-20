import StockClient, { type StockRow } from "@/components/stock/StockClient"
import { createClient } from "@/lib/supabase/server"

export default async function StockPage() {
  const supabase = await createClient()

  const { data: items, error: itemsError } = await supabase
    .from("inventory_items")
    .select(
      `
      id,
      name,
      unit,
      reorder_level,
      category:inventory_categories(name)
    `
    )
    .eq("is_active", true)
    .order("name")

  if (itemsError) throw new Error(itemsError.message)

  const { data: categoriesData, error: categoriesError } = await supabase
    .from("inventory_categories")
    .select("id, name")
    .order("name")

  if (categoriesError) throw new Error(categoriesError.message)

  const itemIds = (items ?? []).map((item: any) => item.id)
  let globalLatest: string | null = null
  const snapshotByItem = new Map<string, any>()

  if (itemIds.length > 0) {
    const { data: snapshots, error: snapshotError } = await supabase
      .from("vw_stock_latest_date_snapshot")
      .select("item_id, latest_date, raw_value, qty_numeric, qty_unit")
      .in("item_id", itemIds)

    if (snapshotError) throw new Error(snapshotError.message)

    for (const row of snapshots ?? []) {
      snapshotByItem.set(row.item_id, row)
      if (row.latest_date) {
        const latestDate = String(row.latest_date)
        if (!globalLatest || latestDate > globalLatest) {
          globalLatest = latestDate
        }
      }
    }
  }

  let countsData: any[] = []
  let weeklyDates: string[] = []
  let weeklyCounts: Array<{
    itemId: string
    countDate: string
    rawValue: string
    qtyNumeric: number | null
    qtyUnit: string | null
  }> = []
  let countedItemIds: string[] = []
  if (globalLatest) {
    const { data: latestCounts, error: countsError } = await supabase
      .from("stock_counts")
      .select("id, item_id, count_date, raw_value, qty_numeric, qty_unit, item:inventory_items(name, unit)")
      .eq("count_date", globalLatest)
      .order("raw_value")

    if (countsError) throw new Error(countsError.message)

    countsData = latestCounts ?? []
  }

  if (itemIds.length > 0) {
    const { data: countedItems, error: countedError } = await supabase
      .from("stock_counts")
      .select("item_id")
      .in("item_id", itemIds)

    if (countedError) throw new Error(countedError.message)

    countedItemIds = Array.from(
      new Set((countedItems ?? []).map((row) => row.item_id))
    )
  }

  if (itemIds.length > 0) {
    const { data: dateRows, error: datesError } = await supabase
      .from("stock_counts")
      .select("count_date")
      .order("count_date", { ascending: false })
      .limit(120)

    if (datesError) throw new Error(datesError.message)

    const uniqueDates: string[] = []
    for (const row of dateRows ?? []) {
      const date = String(row.count_date)
      if (!uniqueDates.includes(date)) {
        uniqueDates.push(date)
      }
      if (uniqueDates.length >= 4) break
    }

    weeklyDates = uniqueDates.slice().reverse()

    if (weeklyDates.length > 0) {
      const { data: weeklyData, error: weeklyError } = await supabase
        .from("stock_counts")
        .select("item_id, count_date, raw_value, qty_numeric, qty_unit")
        .in("item_id", itemIds)
        .in("count_date", weeklyDates)

      if (weeklyError) throw new Error(weeklyError.message)

      weeklyCounts = (weeklyData ?? []).map((row) => ({
        itemId: row.item_id,
        countDate: row.count_date,
        rawValue: row.raw_value,
        qtyNumeric: row.qty_numeric,
        qtyUnit: row.qty_unit,
      }))
    }
  }

  const rows: StockRow[] = (items ?? []).map((row: any) => {
    const snapshot = snapshotByItem.get(row.id)

    return {
      id: row.id,
      name: row.name,
      category: row.category?.name ?? "Uncategorized",
      unit: row.unit ?? "pcs",
      reorder_level: row.reorder_level ?? null,
      asOf: globalLatest,
      displayValue: snapshot?.raw_value ?? "—",
    }
  })

  const categories = (categoriesData ?? []).map((category) => category.name)
  const categoryOptions = (categoriesData ?? []).map((category) => ({
    id: category.id,
    name: category.name,
  }))
  const itemOptions = (items ?? []).map((item: any) => ({
    id: item.id,
    name: item.name,
    unit: item.unit ?? "pcs",
  }))
  const counts = countsData.map((count) => ({
    id: count.id,
    itemId: count.item_id,
    itemName: count.item?.name ?? "Unknown item",
    countDate: count.count_date,
    rawValue: count.raw_value,
    qtyNumeric: count.qty_numeric,
    qtyUnit: count.qty_unit ?? count.item?.unit ?? null,
  }))

  return (
    <StockClient
      initialData={rows}
      categories={categories}
      categoryOptions={categoryOptions}
      items={itemOptions}
      counts={counts}
      weeklyDates={weeklyDates}
      weeklyCounts={weeklyCounts}
      countedItemIds={countedItemIds}
    />
  )
}
