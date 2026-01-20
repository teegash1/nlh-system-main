import StockClient, { type StockRow } from "@/components/stock/StockClient"
import { createClient } from "@/lib/supabase/server"

type InventoryItemRow = {
  id: string
  name: string
  unit: string | null
  reorder_level: number | null
  category?: { name?: string | null } | null
}

type StockMoveRow = {
  item_id: string
  move_type: "in" | "out" | "adjust"
  quantity: number | null
  unit_cost: number | null
}

export default async function StockPage() {
  const supabase = await createClient()

  const { data: itemsData, error: itemsError } = await supabase
    .from("inventory_items")
    .select("id, name, unit, reorder_level, category:inventory_categories(name)")
    .eq("is_active", true)
    .order("name")

  if (itemsError) {
    throw new Error(itemsError.message)
  }

  const items = (itemsData ?? []) as InventoryItemRow[]
  const itemIds = items.map((item) => item.id)

  let moves: StockMoveRow[] = []
  if (itemIds.length > 0) {
    const { data: movesData, error: movesError } = await supabase
      .from("stock_moves")
      .select("item_id, move_type, quantity, unit_cost")
      .in("item_id", itemIds)

    if (movesError) {
      throw new Error(movesError.message)
    }

    moves = (movesData ?? []) as StockMoveRow[]
  }

  const byItem = new Map<string, { stock: number; totalValue: number }>()
  for (const id of itemIds) {
    byItem.set(id, { stock: 0, totalValue: 0 })
  }

  for (const move of moves) {
    const row = byItem.get(move.item_id)
    if (!row) continue

    const qty = Number(move.quantity || 0)
    const cost = Number(move.unit_cost || 0)

    if (move.move_type === "in") {
      row.stock += qty
      row.totalValue += qty * cost
    } else if (move.move_type === "out") {
      row.stock -= qty
      row.totalValue -= qty * cost
    } else {
      row.stock += qty
    }
  }

  const viewModel: StockRow[] = items.map((item) => {
    const agg = byItem.get(item.id) ?? { stock: 0, totalValue: 0 }

    return {
      id: item.id,
      name: item.name,
      category: item.category?.name ?? "Uncategorized",
      unit: item.unit ?? "pcs",
      reorder_level:
        typeof item.reorder_level === "number" ? item.reorder_level : null,
      stock: agg.stock,
      totalValue: Number(agg.totalValue.toFixed(2)),
    }
  })

  return <StockClient initialData={viewModel} />
}
