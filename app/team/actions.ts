"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

const normalizeRole = (role: string) => {
  const normalized = role.trim().toLowerCase()
  if (normalized === "admin" || normalized === "administrator") return "admin"
  if (normalized === "manager" || normalized === "stock_manager") return "manager"
  if (normalized === "viewer") return "viewer"
  return "viewer"
}

const requireAdmin = async () => {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) return { ok: false, message: userError.message }
  const user = userData.user
  if (!user) return { ok: false, message: "You must be signed in." }
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()
  if (profileError) return { ok: false, message: profileError.message }
  if (profile?.role !== "admin") {
    return { ok: false, message: "Admin access required." }
  }
  return { ok: true, userId: user.id }
}

export async function inviteMember(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase()
  const fullName = String(formData.get("fullName") || "").trim()
  const role = normalizeRole(String(formData.get("role") || "viewer"))

  if (!email) {
    return { ok: false, message: "Email address is required." }
  }

  const guard = await requireAdmin()
  if (!guard.ok) return guard

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: {
      full_name: fullName,
      role,
    },
  })

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/team")
  return { ok: true }
}

export async function updateMemberRole(formData: FormData) {
  const userId = String(formData.get("userId") || "").trim()
  const role = normalizeRole(String(formData.get("role") || "viewer"))

  if (!userId) {
    return { ok: false, message: "Missing member ID." }
  }

  const guard = await requireAdmin()
  if (!guard.ok) return guard

  const admin = createAdminClient()
  const { error } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", userId)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/team")
  return { ok: true }
}

export async function removeMember(formData: FormData) {
  const userId = String(formData.get("userId") || "").trim()
  if (!userId) {
    return { ok: false, message: "Missing member ID." }
  }

  const guard = await requireAdmin()
  if (!guard.ok) return guard

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.deleteUser(userId)

  if (error) {
    return { ok: false, message: error.message }
  }

  revalidatePath("/team")
  return { ok: true }
}
