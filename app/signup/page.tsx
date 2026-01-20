import Link from "next/link"
import { BadgeCheck, Church, Users } from "lucide-react"

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
import { AuthSuccessDialog } from "@/components/auth/auth-success-dialog"
import { signup } from "./actions"

type SearchParams = Record<string, string | string[] | undefined>

function resolveParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

const onboarding = [
  {
    title: "Set your ministry profile",
    description: "Add your church name and team details in minutes.",
    icon: Church,
  },
  {
    title: "Invite trusted stewards",
    description: "Grant access to the teams that track stock daily.",
    icon: Users,
  },
  {
    title: "Activate smart approvals",
    description: "Configure requests and auto-alerts in one place.",
    icon: BadgeCheck,
  },
]

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>
}) {
  const params = (await searchParams) ?? {}
  const error = resolveParam(params.error)
  const message = resolveParam(params.message)

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(167,139,250,0.18),_transparent_45%),_radial-gradient(circle_at_bottom,_rgba(96,165,250,0.12),_transparent_40%)]" />
      <div className="pointer-events-none absolute -left-28 top-12 h-72 w-72 rounded-full bg-chart-4/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-chart-2/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="order-2 space-y-6 lg:order-1">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Create your account
              </p>
              <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Build a clearer, calmer inventory workflow.
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Get your ministry teams aligned with real-time stock visibility, approvals,
                and alerts.
              </p>
            </div>

            <div className="grid gap-3">
              {onboarding.map((step) => {
                const Icon = step.icon
                return (
                  <div
                    key={step.title}
                    className="flex items-start gap-3 rounded-xl border border-border bg-secondary/40 p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <Icon className="h-5 w-5 text-chart-2" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="rounded-2xl border border-border bg-secondary/30 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                What you get
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  "Multi-campus inventory visibility",
                  "Real-time low stock alerts",
                  "Role-specific approval flows",
                  "Export-ready monthly reports",
                ].map((item) => (
                  <div key={item} className="text-xs text-muted-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Card className="glass order-1 border-border/70 shadow-[0_20px_60px_rgba(0,0,0,0.35)] lg:order-2">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Create your account</CardTitle>
              <CardDescription className="text-muted-foreground">
                Set up your team space in less than two minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {error && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
                  {error}
                </div>
              )}
              <form action={signup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name" className="text-foreground">
                    Full Name
                  </Label>
                  <Input
                    id="full-name"
                    name="fullName"
                    type="text"
                    placeholder="Your name"
                    autoComplete="name"
                    required
                    className="bg-secondary/40 border-border text-foreground"
                  />
                </div>
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                  <Label htmlFor="church" className="text-foreground">
                    Church Name
                  </Label>
                  <Input
                    id="church"
                    name="church"
                    type="text"
                    placeholder="Nobles Lighthouse"
                    autoComplete="organization"
                    required
                    className="bg-secondary/40 border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="role" className="text-foreground">
                    Role
                  </Label>
                  <Input
                    id="role"
                    name="role"
                    type="text"
                    placeholder="Stock Steward"
                    autoComplete="organization-title"
                    className="bg-secondary/40 border-border text-foreground"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    required
                    className="bg-secondary/40 border-border text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-foreground">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                    className="bg-secondary/40 border-border text-foreground"
                  />
                </div>
                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-border bg-secondary/40"
                    required
                  />
                  I agree to the stewardship guidelines and terms of service.
                </label>
                <Button
                  type="submit"
                  className="w-full bg-accent text-foreground hover:bg-accent/80 border border-border premium-btn"
                >
                  Create account
                </Button>
              </form>

              <Separator className="bg-border/70" />

              <div className="text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-chart-2 transition-colors hover:text-chart-2/80"
                >
                  Sign in
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
      <AuthSuccessDialog
        message={message}
        title="Account created"
        actionLabel="Continue"
      />
    </div>
  )
}
