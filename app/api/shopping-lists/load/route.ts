import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const listId = body?.listId as string | undefined
  if (!listId) {
    return NextResponse.json({ error: "Missing listId" }, { status: 400 })
  }

  const { data: entries, error } = await supabase
    .from("shopping_list_entries")
    .select("item_id, desired_qty, unit_price")
    .eq("list_id", listId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase
    .from("shopping_lists")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("status", "active")
    .neq("id", listId)

  await supabase
    .from("shopping_lists")
    .update({ status: "active", completed_at: null })
    .eq("id", listId)

  await supabase.from("shopping_list_items").delete().gte("desired_qty", 0)

  if (entries && entries.length > 0) {
    const payload = entries.map((entry) => ({
      item_id: entry.item_id,
      desired_qty: Number(entry.desired_qty ?? 0),
      unit_price: entry.unit_price ?? null,
    }))
    const { error: insertError } = await supabase
      .from("shopping_list_items")
      .insert(payload)
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
