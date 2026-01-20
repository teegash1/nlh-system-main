"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

const MAX_RECEIPT_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "application/pdf",
]

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-")
}

export async function createReceipt(formData: FormData) {
  const receiptDate = String(formData.get("receiptDate") || "").trim()
  const vendor = String(formData.get("vendor") || "").trim()
  const category = String(formData.get("category") || "").trim()
  const paymentMethod = String(formData.get("paymentMethod") || "").trim()
  const amountValue = String(formData.get("amount") || "").trim()
  const amountReceivedValue = String(formData.get("amountReceived") || "").trim()
  const reference = String(formData.get("reference") || "").trim()
  const file = formData.get("file") as File | null

  if (
    !receiptDate ||
    !vendor ||
    !category ||
    !paymentMethod ||
    !amountValue ||
    !amountReceivedValue
  ) {
    return { ok: false, message: "Please fill in all required fields." }
  }

  if (!file) {
    return { ok: false, message: "Receipt file is required." }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, message: "Only PDF, JPG, or PNG files are allowed." }
  }

  if (file.size > MAX_RECEIPT_SIZE) {
    return { ok: false, message: "File must be 10MB or less." }
  }

  const amount = Number(amountValue)
  if (!Number.isFinite(amount)) {
    return { ok: false, message: "Amount must be a valid number." }
  }
  const amountReceived = Number(amountReceivedValue)
  if (!Number.isFinite(amountReceived)) {
    return { ok: false, message: "Amount received must be a valid number." }
  }
  const balance = amountReceived - amount

  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) {
    return { ok: false, message: userError.message }
  }

  const userId = userData.user?.id
  if (!userId) {
    return { ok: false, message: "You must be signed in." }
  }

  const timestamp = Date.now()
  const safeName = sanitizeFilename(file.name || "receipt")
  const storagePath = `${userId}/${receiptDate}/${timestamp}-${safeName}`

  const { error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return { ok: false, message: uploadError.message }
  }

  const { error: insertError } = await supabase.from("receipts").insert({
    user_id: userId,
    vendor,
    category,
    amount,
    amount_received: amountReceived,
    balance,
    payment_method: paymentMethod,
    reference: reference || null,
    receipt_date: receiptDate,
    file_path: storagePath,
    status: "Pending",
  })

  if (insertError) {
    return { ok: false, message: insertError.message }
  }

  revalidatePath("/reports")
  return { ok: true }
}

export async function updateReceipt(formData: FormData) {
  const id = String(formData.get("id") || "").trim()
  const receiptDate = String(formData.get("receiptDate") || "").trim()
  const vendor = String(formData.get("vendor") || "").trim()
  const category = String(formData.get("category") || "").trim()
  const paymentMethod = String(formData.get("paymentMethod") || "").trim()
  const amountValue = String(formData.get("amount") || "").trim()
  const amountReceivedValue = String(formData.get("amountReceived") || "").trim()
  const reference = String(formData.get("reference") || "").trim()

  if (
    !id ||
    !receiptDate ||
    !vendor ||
    !category ||
    !paymentMethod ||
    !amountValue ||
    !amountReceivedValue
  ) {
    return { ok: false, message: "Please fill in all required fields." }
  }

  const amount = Number(amountValue)
  if (!Number.isFinite(amount)) {
    return { ok: false, message: "Amount must be a valid number." }
  }
  const amountReceived = Number(amountReceivedValue)
  if (!Number.isFinite(amountReceived)) {
    return { ok: false, message: "Amount received must be a valid number." }
  }
  const balance = amountReceived - amount

  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) {
    return { ok: false, message: userError.message }
  }

  const userId = userData.user?.id
  if (!userId) {
    return { ok: false, message: "You must be signed in." }
  }

  const { error } = await supabase
    .from("receipts")
    .update({
      vendor,
      category,
      amount,
      amount_received: amountReceived,
      balance,
      payment_method: paymentMethod,
      reference: reference || null,
      receipt_date: receiptDate,
    })
    .eq("id", id)
    .eq("user_id", userId)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/reports")
  return { ok: true }
}

export async function updateReceiptStatus(formData: FormData) {
  const id = String(formData.get("id") || "").trim()
  const status = String(formData.get("status") || "").trim()

  if (!id || !status) {
    return { ok: false, message: "Missing receipt or status." }
  }

  if (!["Pending", "Verified", "Flagged"].includes(status)) {
    return { ok: false, message: "Invalid status." }
  }

  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) {
    return { ok: false, message: userError.message }
  }

  const userId = userData.user?.id
  if (!userId) {
    return { ok: false, message: "You must be signed in." }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle()

  if (profileError) {
    return { ok: false, message: profileError.message }
  }

  if (profile?.role !== "admin") {
    return { ok: false, message: "Only admins can update status." }
  }

  const { error } = await supabase.from("receipts").update({ status }).eq("id", id)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/reports")
  return { ok: true }
}

export async function deleteReceipt(formData: FormData) {
  const id = String(formData.get("id") || "").trim()

  if (!id) {
    return { ok: false, message: "Missing receipt ID." }
  }

  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) {
    return { ok: false, message: userError.message }
  }

  const userId = userData.user?.id
  if (!userId) {
    return { ok: false, message: "You must be signed in." }
  }

  const { data: receipt, error: receiptError } = await supabase
    .from("receipts")
    .select("file_path")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle()

  if (receiptError) {
    return { ok: false, message: receiptError.message }
  }

  if (receipt?.file_path) {
    const { error: storageError } = await supabase.storage
      .from("receipts")
      .remove([receipt.file_path])

    if (storageError) {
      return { ok: false, message: storageError.message }
    }
  }

  const { error } = await supabase.from("receipts").delete().eq("id", id).eq("user_id", userId)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/reports")
  return { ok: true }
}
