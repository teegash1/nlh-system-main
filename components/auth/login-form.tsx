"use client"

import Link from "next/link"
import { useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function LoginPendingOverlay() {
  const { pending } = useFormStatus()

  if (!pending) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative flex flex-col items-center gap-4">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border border-border/60 bg-gradient-to-br from-chart-1/20 via-transparent to-chart-2/20" />
          <div className="absolute inset-2 rounded-full border border-border/40 bg-secondary/40 animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-chart-1 border-r-chart-2 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            Nobles Lighthouse
          </p>
          <p className="text-xs text-muted-foreground">
            Signing you in...
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span
            className="h-1.5 w-1.5 rounded-full bg-chart-1 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-chart-2 animate-bounce"
            style={{ animationDelay: "120ms" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-chart-3 animate-bounce"
            style={{ animationDelay: "240ms" }}
          />
        </div>
      </div>
    </div>
  )
}

function LoginSubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-accent text-foreground hover:bg-accent/80 border border-border premium-btn"
    >
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  )
}

export function LoginForm({
  action,
  next,
  error,
}: {
  action: (formData: FormData) => Promise<unknown> | void
  next: string
  error?: string | null
}) {
  return (
    <form action={action} className="space-y-4">
      <LoginPendingOverlay />
      <input type="hidden" name="next" value={next} />
      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">
          Work Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@nobles.org"
          autoComplete="email"
          required
          className="bg-secondary/40 border-border text-foreground"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          className="bg-secondary/40 border-border text-foreground"
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border bg-secondary/40"
            defaultChecked
          />
          Remember this device
        </label>
        <Link
          href="/help"
          className="text-chart-1 transition-colors hover:text-chart-1/80"
        >
          Forgot password?
        </Link>
      </div>
      <LoginSubmitButton />
    </form>
  )
}
