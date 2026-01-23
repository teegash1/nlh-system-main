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
    .select(
      "item_id, item_name, category, unit, current_qty, desired_qty, unit_price, status"
    )
    .eq("list_id", listId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: sourceList } = await supabase
    .from("shopping_lists")
    .select("title, status")
    .eq("id", listId)
    .maybeSingle()

  const title = sourceList?.title
    ? `${sourceList.title} • Loaded`
    : `Shopping List • ${new Date().toLocaleDateString("en-KE", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`

  await supabase
    .from("shopping_lists")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("status", "active")

  const { data: created, error: createError } = await supabase
    .from("shopping_lists")
    .insert({ title, status: "active", completed_at: null })
    .select("id")
    .single()

  if (createError || !created?.id) {
    return NextResponse.json(
      { error: createError?.message ?? "Unable to create list" },
      { status: 500 }
    )
  }

  await supabase.from("shopping_list_items").delete().gte("desired_qty", 0)

  if (entries && entries.length > 0) {
    const payload = entries.map((entry) => ({
      item_id: entry.item_id,
      desired_qty: Number(entry.desired_qty ?? 0),
      unit_price: entry.unit_price ?? null,
      excluded: false,
    }))
    const { error: insertError } = await supabase
      .from("shopping_list_items")
      .insert(payload)
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    const entryPayload = entries.map((entry) => ({
      list_id: created.id,
      item_id: entry.item_id,
      item_name: entry.item_name ?? null,
      category: entry.category ?? null,
      unit: entry.unit ?? null,
      current_qty: entry.current_qty ?? 0,
      desired_qty: Number(entry.desired_qty ?? 0),
      unit_price: entry.unit_price ?? null,
      status: entry.status ?? "Low stock",
    }))

    await supabase.from("shopping_list_entries").delete().eq("list_id", created.id)
    if (entryPayload.length > 0) {
      await supabase.from("shopping_list_entries").insert(entryPayload)
    }
  }

  return NextResponse.json({ ok: true, activeListId: created.id })
}
