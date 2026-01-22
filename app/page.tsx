import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  LineChart,
  Package,
  Receipt,
  ShieldCheck,
  Sparkles,
  Users2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PwaInstallButton } from "@/components/landing/pwa-install-button"
import BounceCards from "@/components/landing/bounce-cards"

const highlights = [
  {
    title: "Receipt vault",
    description: "Attach expenditure receipts and surface them by date.",
    icon: Receipt,
  },
  {
    title: "Inventory intelligence",
    description: "Track stock counts, thresholds, and trends in one place.",
    icon: LineChart,
  },
  {
    title: "Ministry-ready governance",
    description: "Roles, approvals, and audit trails built for stewardship.",
    icon: ShieldCheck,
  },
]

const featureBlocks = [
  {
    title: "Real-time stock takes",
    description:
      "Capture weekly counts with raw notes so teams see exactly what was recorded.",
    icon: Package,
  },
  {
    title: "Smart alerts",
    description:
      "Low-stock notifications and automated reminders keep operations steady.",
    icon: Bell,
  },
  {
    title: "Leadership reporting",
    description:
      "Generate monthly spend summaries and compliance-ready exports.",
    icon: BarChart3,
  },
  {
    title: "Team coordination",
    description:
      "Assign stewards, track responsibilities, and keep everyone aligned.",
    icon: Users2,
  },
]

const workflow = [
  {
    step: "01",
    title: "Capture counts",
    description: "Record raw stocktake notes and receipts in seconds.",
  },
  {
    step: "02",
    title: "Review & approve",
    description: "Route updates to ministry leaders for quick approvals.",
  },
  {
    step: "03",
    title: "Report & plan",
    description: "Export insights for budgeting and ministry planning.",
  },
]

const bounceImages = [
  "https://source.unsplash.com/600x600/?stockroom,shelves",
  "https://source.unsplash.com/600x600/?paper,rolls,storage",
  "https://source.unsplash.com/600x600/?warehouse,inventory",
  "https://source.unsplash.com/600x600/?receipt,shopping,list",
  "https://source.unsplash.com/600x600/?storage,boxes,labels",
]

const bounceTransforms = [
  "rotate(5deg) translate(-150px)",
  "rotate(0deg) translate(-70px)",
  "rotate(-5deg)",
  "rotate(5deg) translate(70px)",
  "rotate(-5deg) translate(150px)",
]

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <PwaInstallButton />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.18),_transparent_45%),_radial-gradient(circle_at_bottom,_rgba(52,211,153,0.12),_transparent_40%)]" />
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-chart-5/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-12 h-80 w-80 rounded-full bg-chart-2/15 blur-3xl" />

      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary/40">
              <img
                src="/fav.png"
                alt="Nobles Lighthouse System"
                className="h-6 w-6 rounded-sm"
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-sm font-semibold">Nobles Lighthouse</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Stock System
              </span>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-xs font-medium text-muted-foreground lg:flex">
            <Link href="#features" className="hover:text-foreground">
              Features
            </Link>
            <Link href="#workflow" className="hover:text-foreground">
              Workflow
            </Link>
            <Link href="#security" className="hover:text-foreground">
              Governance
            </Link>
            <Link href="#cta" className="hover:text-foreground">
              Get Started
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="sm" className="premium-btn">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-20 md:pt-28">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-6">
              <Badge className="w-fit bg-secondary/60 text-muted-foreground border-border">
                Trusted stewardship for ministry inventory
              </Badge>
              <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                A premium stock system for churches that run with excellence.
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg">
                Nobles Lighthouse System brings stock takes, expenditures, and
                approvals into one elegant workspace. Every item, every receipt,
                and every update stays clear and accountable.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="premium-btn">
                  <Link href="/signup">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">Login</Link>
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Accuracy uplift", value: "99.99%" },
                  { label: "Weekly reports", value: "1-click" },
                  { label: "Receipt tracing", value: "Instant" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border bg-secondary/30 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex justify-center lg:justify-end">
                <BounceCards
                  className="w-full max-w-[520px]"
                  images={bounceImages}
                  containerWidth={520}
                  containerHeight={260}
                  animationDelay={1.4}
                  animationStagger={0.09}
                  easeType="elastic.out(1, 0.5)"
                  transformStyles={bounceTransforms}
                  enableHover
                />
              </div>
              {highlights.map((item) => {
                const Icon = item.icon
                return (
                  <Card key={item.title} className="glass border-border/70">
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-secondary/60">
                        <Icon className="h-5 w-5 text-chart-2" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 pb-20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Core capabilities
              </p>
              <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                Everything your storekeepers need, nothing they do not.
              </h2>
            </div>
            <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
              <Sparkles className="h-4 w-4 text-chart-2" />
              Premium experiences included
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {featureBlocks.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="border-border bg-card/80">
                  <CardHeader className="space-y-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                      <Icon className="h-5 w-5 text-chart-1" />
                    </div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {feature.description}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        <section id="workflow" className="mx-auto max-w-6xl px-4 pb-20">
          <div className="rounded-3xl border border-border bg-secondary/20 p-6 md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Simple workflow
                </p>
                <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                  Designed for smooth weekly handoffs.
                </h2>
              </div>
              <Button asChild variant="outline">
                <Link href="/signup">Start a free setup</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {workflow.map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-border bg-background/60 p-5"
                >
                  <p className="text-xs text-muted-foreground">Step {item.step}</p>
                  <p className="mt-2 text-lg font-semibold">{item.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="security" className="mx-auto max-w-6xl px-4 pb-20">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-3xl border border-border bg-card/80 p-6 md:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <ShieldCheck className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Governance
                  </p>
                  <h3 className="text-xl font-semibold">
                    Built for leaders who need trust & transparency.
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Role-based access, approval routing, and activity history help
                leadership teams stay confident in every update.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                "Steward-level access and approvals",
                "Signed activity trails for audits",
                "Secure receipt storage and exports",
                "Multi-campus reporting in one view",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/30 p-4 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-chart-2" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cta" className="mx-auto max-w-6xl px-4 pb-24">
          <div className="glass rounded-3xl border border-border/70 p-8 md:p-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Ready to begin?
                </p>
                <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                  Launch your ministry inventory command center.
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Start with your first stocktake and expand as your teams
                  grow.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="premium-btn">
                  <Link href="/signup">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
