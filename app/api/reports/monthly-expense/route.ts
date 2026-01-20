import { NextResponse } from "next/server"
import { startOfMonth, endOfMonth, format, parseISO } from "date-fns"

import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 })
  }

  const userId = userData.user.id
  const { data: latestRow, error: latestError } = await supabase
    .from("receipts")
    .select("receipt_date")
    .eq("user_id", userId)
    .order("receipt_date", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestError) {
    return NextResponse.json({ ok: false, message: latestError.message }, { status: 500 })
  }

  const latestDate = latestRow?.receipt_date ?? null
  const reportDate = format(new Date(), "yyyy-MM-dd")

  const meta = {
    reportTitle: "Monthly Expense Report",
    periodLabel: latestDate
      ? format(parseISO(latestDate), "MMMM yyyy")
      : null,
    periodStart: latestDate
      ? format(startOfMonth(parseISO(latestDate)), "yyyy-MM-dd")
      : null,
    periodEnd: latestDate
      ? format(endOfMonth(parseISO(latestDate)), "yyyy-MM-dd")
      : null,
    reportDate,
  }

  if (!latestDate) {
    return NextResponse.json({
      ok: true,
      data: {
        meta,
        summary: { totalSpend: 0, receiptCount: 0, topCategory: null },
        categories: [],
        receipts: [],
      },
    })
  }

  const monthStart = startOfMonth(parseISO(latestDate))
  const monthEnd = endOfMonth(parseISO(latestDate))

  const { data: receipts, error: receiptsError } = await supabase
    .from("receipts")
    .select("receipt_date, vendor, category, amount, payment_method, status")
    .eq("user_id", userId)
    .gte("receipt_date", format(monthStart, "yyyy-MM-dd"))
    .lte("receipt_date", format(monthEnd, "yyyy-MM-dd"))
    .order("receipt_date", { ascending: true })

  if (receiptsError) {
    return NextResponse.json({ ok: false, message: receiptsError.message }, { status: 500 })
  }

  const categoryTotals = new Map<string, number>()
  let totalSpend = 0

  for (const receipt of receipts ?? []) {
    const amount = Number(receipt.amount ?? 0)
    totalSpend += amount
    const current = categoryTotals.get(receipt.category) ?? 0
    categoryTotals.set(receipt.category, current + amount)
  }

  const categories = Array.from(categoryTotals.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)

  const topCategory = categories[0]?.category ?? null

  const summary = {
    totalSpend,
    receiptCount: receipts?.length ?? 0,
    topCategory,
  }

  const rows = (receipts ?? []).map((receipt) => ({
    date: receipt.receipt_date,
    shoper: receipt.vendor,
    category: receipt.category,
    amount: Number(receipt.amount ?? 0),
    paymentMethod: receipt.payment_method,
    status: receipt.status ?? "Pending",
  }))

  return NextResponse.json({
    ok: true,
    data: {
      meta,
      summary,
      categories,
      receipts: rows,
    },
  })
}
