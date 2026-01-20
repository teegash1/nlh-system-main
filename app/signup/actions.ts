"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function signup(formData: FormData) {
  const email = String(formData.get("email") || "").trim()
  const password = String(formData.get("password") || "")
  const fullName = String(formData.get("fullName") || "").trim()

  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) {
    return { ok: false, message: error.message }
  }

  if (data.user) {
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: data.user.id, full_name: fullName, role: "viewer" })

    if (profileError) {
      return { ok: false, message: profileError.message }
    }
  }

  redirect("/stock")
}
