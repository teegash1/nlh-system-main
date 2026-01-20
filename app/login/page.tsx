import Link from "next/link"
import { Lock, ShieldCheck, Sparkles } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const highlights = [
  {
    title: "Stewardship-ready security",
    description: "Role-based access and audit trails for every stock move.",
    icon: ShieldCheck,
  },
  {
    title: "Faster approvals",
    description: "Route requests to the right leaders in seconds.",
    icon: Sparkles,
  },
  {
    title: "Protected access",
    description: "Device checks and secure sessions across teams.",
    icon: Lock,
  },
]

const quickStats = [
  {
    label: "Inventory accuracy",
    value: "98.6%",
    detail: "last 30 days",
  },
  {
    label: "Active ministries",
    value: "14",
    detail: "serving weekly",
  },
]

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.14),_transparent_45%),_radial-gradient(circle_at_bottom,_rgba(52,211,153,0.12),_transparent_40%)]" />
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-chart-5/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-chart-1/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="order-2 space-y-6 lg:order-1">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Nobles Lighthouse System
              </p>
              <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Sign in to steward every item with confidence.
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Track inventory, approve requests, and keep ministry operations aligned across
                teams.
              </p>
            </div>

            <div className="grid gap-3">
              {highlights.map((highlight) => {
                const Icon = highlight.icon
                return (
                  <div
                    key={highlight.title}
                    className="flex items-start gap-3 rounded-xl border border-border bg-secondary/40 p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <Icon className="h-5 w-5 text-chart-1" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{highlight.title}</p>
                      <p className="text-xs text-muted-foreground">{highlight.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {quickStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-border bg-secondary/30 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="glass order-1 border-border/70 shadow-[0_20px_60px_rgba(0,0,0,0.35)] lg:order-2">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Welcome back</CardTitle>
              <CardDescription className="text-muted-foreground">
                Enter your credentials to continue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Work Email
                  </Label>
                  <Input
                    id="email"
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
                <Button
                  type="submit"
                  className="w-full bg-accent text-foreground hover:bg-accent/80 border border-border premium-btn"
                >
                  Sign in
                </Button>
              </form>

              <Separator className="bg-border/70" />

              <div className="text-center text-xs text-muted-foreground">
                New to the system?{" "}
                <Link
                  href="/signup"
                  className="text-chart-2 transition-colors hover:text-chart-2/80"
                >
                  Create an account
                </Link>
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <p className="text-xs text-muted-foreground">
                Need help?{" "}
                <Link
                  href="/help"
                  className="text-chart-1 transition-colors hover:text-chart-1/80"
                >
                  Visit support
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
