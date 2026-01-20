"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function signup(formData: FormData) {
  const email = String(formData.get("email") || "").trim()
  const password = String(formData.get("password") || "")
  const fullName = String(formData.get("fullName") || "").trim()
  const confirmPassword = String(formData.get("confirmPassword") || "")

  if (!email || !password) {
    redirect(
      `/signup?error=${encodeURIComponent("Email and password are required.")}`
    )
  }

  if (password !== confirmPassword) {
    redirect(
      `/signup?error=${encodeURIComponent("Passwords do not match.")}`
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role: "viewer" },
    },
  })
  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  if (data.user && data.session) {
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({ id: data.user.id, full_name: fullName, role: "viewer" })

    if (profileError) {
      redirect(
        `/login?message=${encodeURIComponent(
          "Account created. Please sign in."
        )}`
      )
    }
  }

  if (!data.session) {
    redirect(
      `/login?message=${encodeURIComponent(
        "Check your email to confirm your account."
      )}`
    )
  }

  redirect("/stock")
}
