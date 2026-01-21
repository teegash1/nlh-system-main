"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

const parseBoolean = (value: FormDataEntryValue | null) => {
  if (value == null) return false
  return value === "true" || value === "on" || value === "1"
}

export async function updateProfile(formData: FormData) {
  const fullName = String(formData.get("fullName") || "").trim()
  const churchName = String(formData.get("churchName") || "").trim()

  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) return { ok: false, message: userError.message }
  if (!userData.user) return { ok: false, message: "You must be signed in." }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName || null,
      church_name: churchName || null,
    })
    .eq("id", userData.user.id)

  if (error) return { ok: false, message: error.message }

  revalidatePath("/settings")
  revalidatePath("/dashboard")
  return { ok: true }
}

export async function updateEmail(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase()
  if (!email) return { ok: false, message: "Email is required." }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ email })

  if (error) return { ok: false, message: error.message }

  revalidatePath("/settings")
  return { ok: true, message: "Check your inbox to confirm the new email." }
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") || "")
  if (password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { ok: false, message: error.message }

  return { ok: true }
}

export async function updatePreferences(formData: FormData) {
  const lowStock = parseBoolean(formData.get("lowStockAlerts"))
  const weeklyReports = parseBoolean(formData.get("weeklyReports"))
  const systemUpdates = parseBoolean(formData.get("systemUpdates"))

  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) return { ok: false, message: userError.message }
  if (!userData.user) return { ok: false, message: "You must be signed in." }

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userData.user.id,
      low_stock_alerts: lowStock,
      weekly_reports: weeklyReports,
      system_updates: systemUpdates,
    },
    { onConflict: "user_id" }
  )

  if (error) return { ok: false, message: error.message }

  revalidatePath("/settings")
  return { ok: true }
}

export async function updateAppearance(formData: FormData) {
  const theme = String(formData.get("theme") || "system")

  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) return { ok: false, message: userError.message }
  if (!userData.user) return { ok: false, message: "You must be signed in." }

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userData.user.id,
      theme,
    },
    { onConflict: "user_id" }
  )

  if (error) return { ok: false, message: error.message }

  revalidatePath("/settings")
  return { ok: true }
}

export async function markBackup(formData: FormData) {
  const timestamp = String(formData.get("timestamp") || "").trim()
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) return { ok: false, message: userError.message }
  if (!userData.user) return { ok: false, message: "You must be signed in." }

  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userData.user.id,
      last_backup_at: timestamp || new Date().toISOString(),
    },
    { onConflict: "user_id" }
  )

  if (error) return { ok: false, message: error.message }

  revalidatePath("/settings")
  return { ok: true }
}

export async function updateAvatar(formData: FormData) {
  const file = formData.get("avatar") as File | null
  if (!file) return { ok: false, message: "Select an image to upload." }

  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    return { ok: false, message: "Image must be under 2MB." }
  }

  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"])
  if (!allowedTypes.has(file.type)) {
    return { ok: false, message: "Only JPG, PNG, or WEBP images are allowed." }
  }

  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) return { ok: false, message: userError.message }
  if (!userData.user) return { ok: false, message: "You must be signed in." }

  const ext = file.name.split(".").pop() || "png"
  const filePath = `${userData.user.id}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true, contentType: file.type })

  if (uploadError) return { ok: false, message: uploadError.message }

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: data.publicUrl })
    .eq("id", userData.user.id)

  if (profileError) return { ok: false, message: profileError.message }

  revalidatePath("/settings")
  revalidatePath("/dashboard")
  return { ok: true, url: data.publicUrl }
}

export async function importData(formData: FormData) {
  const file = formData.get("file") as File | null
  if (!file) return { ok: false, message: "Select a JSON file to import." }

  const content = await file.text()
  let payload: any
  try {
    payload = JSON.parse(content)
  } catch {
    return { ok: false, message: "Invalid JSON file." }
  }

  const categories = Array.isArray(payload?.categories) ? payload.categories : []
  const items = Array.isArray(payload?.items) ? payload.items : []

  const normalizedCategories = categories
    .map((item: any) => (typeof item === "string" ? item : item?.name))
    .filter((name: string) => Boolean(name))
    .map((name: string) => ({ name }))

  const supabase = await createClient()

  if (normalizedCategories.length > 0) {
    const { error: categoryError } = await supabase
      .from("inventory_categories")
      .upsert(normalizedCategories, { onConflict: "name" })
    if (categoryError) return { ok: false, message: categoryError.message }
  }

  const { data: categoryRows, error: categoryFetchError } = await supabase
    .from("inventory_categories")
    .select("id, name")

  if (categoryFetchError) return { ok: false, message: categoryFetchError.message }

  const categoryMap = new Map(
    (categoryRows ?? []).map((row: any) => [row.name, row.id])
  )

  const itemNames = items.map((item: any) => String(item?.name || "").trim()).filter(Boolean)
  let existingItemNames = new Set<string>()
  if (itemNames.length > 0) {
    const { data: existingItems } = await supabase
      .from("inventory_items")
      .select("name")
      .in("name", itemNames)
    existingItemNames = new Set((existingItems ?? []).map((row: any) => row.name))
  }

  const newItems = items
    .map((item: any) => {
      const name = String(item?.name || "").trim()
      const category = String(item?.category || "").trim()
      if (!name || existingItemNames.has(name)) return null
      return {
        name,
        unit: String(item?.unit || "pcs"),
        reorder_level: item?.reorder_level ?? null,
        category_id: categoryMap.get(category) ?? null,
        is_active: true,
      }
    })
    .filter(Boolean)

  if (newItems.length > 0) {
    const { error: itemError } = await supabase
      .from("inventory_items")
      .insert(newItems as any[])
    if (itemError) return { ok: false, message: itemError.message }
  }

  revalidatePath("/settings")
  revalidatePath("/stock")
  return {
    ok: true,
    message: `Imported ${normalizedCategories.length} categories and ${newItems.length} items.`,
  }
}
