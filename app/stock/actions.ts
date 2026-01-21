"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createItem(formData: FormData) {
  const name = String(formData.get("name") || "").trim()
  const categoryName = String(formData.get("category") || "").trim()
  const unit = String(formData.get("unit") || "").trim() || "pcs"
  const reorderLevelValue = String(formData.get("reorderLevel") || "").trim()

  if (!name) {
    return { ok: false, message: "Item name is required." }
  }

  if (!categoryName) {
    return { ok: false, message: "Category is required." }
  }

  const supabase = await createClient()

  let categoryId: string | null = null
  const { data: existingCategory, error: categoryFetchError } = await supabase
    .from("inventory_categories")
    .select("id")
    .eq("name", categoryName)
    .maybeSingle()

  if (categoryFetchError) {
    return { ok: false, message: categoryFetchError.message }
  }

  if (existingCategory?.id) {
    categoryId = existingCategory.id
  } else {
    const { data: newCategory, error: categoryInsertError } = await supabase
      .from("inventory_categories")
      .insert({ name: categoryName })
      .select("id")
      .single()

    if (categoryInsertError) {
      return { ok: false, message: categoryInsertError.message }
    }

    categoryId = newCategory.id
  }

  const reorderLevel = reorderLevelValue ? Number(reorderLevelValue) : null
  const { error: itemError } = await supabase.from("inventory_items").insert({
    name,
    unit,
    reorder_level: Number.isFinite(reorderLevel) ? reorderLevel : null,
    category_id: categoryId,
  })

  if (itemError) {
    return { ok: false, message: itemError.message }
  }

  revalidatePath("/stock")
  return { ok: true }
}

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") || "").trim()

  if (!name) {
    return { ok: false, message: "Category name is required." }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("inventory_categories").insert({ name })

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/stock")
  revalidatePath("/reports")
  return { ok: true }
}

export async function updateCategory(formData: FormData) {
  const id = String(formData.get("id") || "").trim()
  const name = String(formData.get("name") || "").trim()

  if (!id || !name) {
    return { ok: false, message: "Category name is required." }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("inventory_categories")
    .update({ name })
    .eq("id", id)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/stock")
  revalidatePath("/reports")
  return { ok: true }
}

export async function deleteCategory(formData: FormData) {
  const id = String(formData.get("id") || "").trim()

  if (!id) {
    return { ok: false, message: "Missing category ID." }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("inventory_categories").delete().eq("id", id)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/stock")
  revalidatePath("/reports")
  return { ok: true }
}

export async function createStockCount(formData: FormData) {
  const itemId = String(formData.get("itemId") || "").trim()
  const countDate = String(formData.get("countDate") || "").trim()
  const rawValue = String(formData.get("rawValue") || "").trim()
  const qtyNumericValue = String(formData.get("qtyNumeric") || "").trim()
  const qtyUnit = String(formData.get("qtyUnit") || "").trim() || null

  if (!itemId || !countDate || !rawValue) {
    return { ok: false, message: "Item, date, and raw value are required." }
  }

  const qtyNumeric = qtyNumericValue ? Number(qtyNumericValue) : null

  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) {
    return { ok: false, message: userError.message }
  }
  if (!userData.user?.id) {
    return { ok: false, message: "You must be signed in to schedule reminders." }
  }

  const { error } = await supabase.from("stock_counts").insert({
    item_id: itemId,
    count_date: countDate,
    raw_value: rawValue,
    qty_numeric: Number.isFinite(qtyNumeric) ? qtyNumeric : null,
    qty_unit: qtyUnit,
    created_by: userData.user?.id ?? null,
    source: "app_entry",
  })

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/stock")
  return { ok: true }
}

export async function updateStockCount(formData: FormData) {
  const id = String(formData.get("id") || "").trim()
  const countDate = String(formData.get("countDate") || "").trim()
  const rawValue = String(formData.get("rawValue") || "").trim()
  const qtyNumericValue = String(formData.get("qtyNumeric") || "").trim()
  const qtyUnit = String(formData.get("qtyUnit") || "").trim() || null

  if (!id || !countDate || !rawValue) {
    return { ok: false, message: "Date and raw value are required." }
  }

  const qtyNumeric = qtyNumericValue ? Number(qtyNumericValue) : null

  const supabase = await createClient()
  const { error } = await supabase
    .from("stock_counts")
    .update({
      count_date: countDate,
      raw_value: rawValue,
      qty_numeric: Number.isFinite(qtyNumeric) ? qtyNumeric : null,
      qty_unit: qtyUnit,
      source: "app_entry",
    })
    .eq("id", id)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/stock")
  return { ok: true }
}

export async function deleteStockCount(formData: FormData) {
  const id = String(formData.get("id") || "").trim()

  if (!id) {
    return { ok: false, message: "Missing stock count ID." }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("stock_counts").delete().eq("id", id)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/stock")
  return { ok: true }
}

export async function updateItem(formData: FormData) {
  const id = String(formData.get("id") || "").trim()
  const name = String(formData.get("name") || "").trim()
  const categoryName = String(formData.get("category") || "").trim()
  const unit = String(formData.get("unit") || "").trim() || "pcs"
  const reorderLevelValue = String(formData.get("reorderLevel") || "").trim()

  if (!id || !name) {
    return { ok: false, message: "Item name is required." }
  }

  if (!categoryName) {
    return { ok: false, message: "Category is required." }
  }

  const supabase = await createClient()

  let categoryId: string | null = null
  const { data: existingCategory, error: categoryFetchError } = await supabase
    .from("inventory_categories")
    .select("id")
    .eq("name", categoryName)
    .maybeSingle()

  if (categoryFetchError) {
    return { ok: false, message: categoryFetchError.message }
  }

  if (existingCategory?.id) {
    categoryId = existingCategory.id
  } else {
    const { data: newCategory, error: categoryInsertError } = await supabase
      .from("inventory_categories")
      .insert({ name: categoryName })
      .select("id")
      .single()

    if (categoryInsertError) {
      return { ok: false, message: categoryInsertError.message }
    }

    categoryId = newCategory.id
  }

  const reorderLevel = reorderLevelValue ? Number(reorderLevelValue) : null
  const { error } = await supabase
    .from("inventory_items")
    .update({
      name,
      unit,
      reorder_level: Number.isFinite(reorderLevel) ? reorderLevel : null,
      category_id: categoryId,
    })
    .eq("id", id)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/stock")
  return { ok: true }
}

export async function deleteItem(formData: FormData) {
  const id = String(formData.get("id") || "").trim()

  if (!id) {
    return { ok: false, message: "Missing item ID." }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("inventory_items")
    .update({ is_active: false })
    .eq("id", id)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/stock")
  return { ok: true }
}

export async function createReminder(formData: FormData) {
  const title = String(formData.get("title") || "").trim()
  const notes = String(formData.get("notes") || "").trim()
  const date = String(formData.get("date") || "").trim()
  const time = String(formData.get("time") || "").trim() || "09:00"
  const recurrence = String(formData.get("recurrence") || "none").trim()
  const color = String(formData.get("color") || "chart-1").trim()

  if (!title) {
    return { ok: false, message: "Reminder title is required." }
  }
  if (!date) {
    return { ok: false, message: "Reminder date is required." }
  }

  const startAt = new Date(`${date}T${time}`)
  if (Number.isNaN(startAt.getTime())) {
    return { ok: false, message: "Invalid date or time." }
  }

  const allowedRecurrence = new Set([
    "none",
    "weekly",
    "biweekly",
    "monthly",
    "quarterly",
  ])
  const safeRecurrence = allowedRecurrence.has(recurrence)
    ? recurrence
    : "none"

  const allowedColors = new Set([
    "chart-1",
    "chart-2",
    "chart-3",
    "chart-4",
    "chart-5",
  ])
  const safeColor = allowedColors.has(color) ? color : "chart-1"

  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) {
    return { ok: false, message: userError.message }
  }

  const { error } = await supabase.from("reminders").insert({
    title,
    notes: notes || null,
    start_at: startAt.toISOString(),
    recurrence: safeRecurrence,
    color: safeColor,
    user_id: userData.user.id,
  })

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/stock")
  revalidatePath("/dashboard")
  return { ok: true }
}
