import StockClient, { type StockRow } from "@/components/stock/StockClient"
import { createClient } from "@/lib/supabase/server"

export default async function StockPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("inventory_items")
    .select(
      `
      id,
      name,
      unit,
      reorder_level,
      category:inventory_categories(name),
      snap:vw_stock_latest_date_snapshot(latest_date, raw_value, qty_numeric, qty_unit)
    `
    )
    .eq("is_active", true)
    .order("name")

  if (error) throw new Error(error.message)

  const globalLatest =
    (data?.find((row: any) => row.snap?.latest_date)?.snap?.latest_date as
      | string
      | undefined) ?? null

  const rows: StockRow[] = (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    category: row.category?.name ?? "Uncategorized",
    unit: row.unit ?? "pcs",
    reorder_level: row.reorder_level ?? null,
    asOf: globalLatest,
    displayValue: row.snap?.raw_value ?? "—",
  }))

  return <StockClient initialData={rows} />
}
