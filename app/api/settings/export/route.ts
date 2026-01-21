import { NextResponse } from "next/server"
import * as XLSX from "xlsx"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError || !userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [categoriesRes, itemsRes, countsRes, receiptsRes, remindersRes, settingsRes] =
    await Promise.all([
    supabase.from("inventory_categories").select("id, name, created_at"),
    supabase
      .from("inventory_items")
      .select("id, name, unit, reorder_level, category_id, created_at, is_active")
      .eq("is_active", true),
    supabase
      .from("stock_counts")
      .select("id, item_id, count_date, raw_value, qty_numeric, qty_unit, created_at"),
    supabase
      .from("receipts")
      .select("id, vendor, category, amount, payment_method, receipt_date, status, created_at")
      .eq("user_id", userData.user.id),
    supabase
      .from("reminders")
      .select("id, title, notes, start_at, recurrence, color, created_at")
      .eq("user_id", userData.user.id),
    supabase
      .from("user_settings")
      .select("low_stock_alerts, weekly_reports, system_updates, theme, last_backup_at, updated_at")
      .eq("user_id", userData.user.id)
      .maybeSingle(),
  ])

  if (categoriesRes.error) {
    return NextResponse.json({ error: categoriesRes.error.message }, { status: 500 })
  }
  if (itemsRes.error) {
    return NextResponse.json({ error: itemsRes.error.message }, { status: 500 })
  }
  if (countsRes.error) {
    return NextResponse.json({ error: countsRes.error.message }, { status: 500 })
  }
  if (receiptsRes.error) {
    return NextResponse.json({ error: receiptsRes.error.message }, { status: 500 })
  }
  if (remindersRes.error) {
    return NextResponse.json({ error: remindersRes.error.message }, { status: 500 })
  }
  if (settingsRes.error) {
    return NextResponse.json({ error: settingsRes.error.message }, { status: 500 })
  }

  const payload = {
    exported_at: new Date().toISOString(),
    categories: categoriesRes.data ?? [],
    items: itemsRes.data ?? [],
    counts: countsRes.data ?? [],
    receipts: receiptsRes.data ?? [],
    reminders: remindersRes.data ?? [],
    preferences: settingsRes.data ?? null,
  }

  const { searchParams } = new URL(request.url)
  const format = searchParams.get("format") ?? "json"

  if (format === "xlsx") {
    const workbook = XLSX.utils.book_new()
    const addSheet = (name: string, data: any[]) => {
      const worksheet = XLSX.utils.json_to_sheet(data)
      XLSX.utils.book_append_sheet(workbook, worksheet, name)
    }

    addSheet("Categories", payload.categories)
    addSheet("Items", payload.items)
    addSheet("Stock Counts", payload.counts)
    addSheet("Receipts", payload.receipts)
    addSheet("Reminders", payload.reminders)
    addSheet("Preferences", payload.preferences ? [payload.preferences] : [])

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
    const filename = `nlh-backup-${new Date().toISOString().slice(0, 10)}.xlsx`
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  }

  const filename = `nlh-backup-${new Date().toISOString().slice(0, 10)}.json`
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
