"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Book,
  CalendarCheck,
  FileQuestion,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
  Package,
  Phone,
  ShieldCheck,
  TrendingUp,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const quickLinks = [
  {
    label: "Open Stock Taking",
    description: "Add items, counts, and reorder levels.",
    href: "/stock",
    icon: Package,
  },
  {
    label: "Upload Receipts",
    description: "Track expenses and balances.",
    href: "/reports",
    icon: FileText,
  },
  {
    label: "View Analytics",
    description: "Trends, spend, and inventory insights.",
    href: "/analytics",
    icon: TrendingUp,
  },
]

const guides = [
  {
    id: "getting-started",
    title: "Getting Started",
    summary: "Set up your categories, add items, and log your first stocktake.",
    icon: Book,
    tags: ["Setup", "Basics"],
    steps: [
      "Create categories in Reports → Manage Categories.",
      "Add inventory items with units and reorder thresholds.",
      "Log your first stock count to populate the weekly matrix.",
      "Review the Reorder Watch card for items needing attention.",
    ],
    links: [
      { label: "Go to Stock Taking", href: "/stock" },
      { label: "Manage Categories", href: "/reports" },
    ],
  },
  {
    id: "receipts",
    title: "Receipts & Expenses",
    summary: "Capture shopping funds, expenses, and the running balance.",
    icon: FileText,
    tags: ["Finance", "Receipts"],
    steps: [
      "Enter amount received and the amount spent for each shopping trip.",
      "Attach the receipt file to keep an audit trail.",
      "Balance remaining is auto-calculated and used in the next purchase.",
      "Use Receipt Archive to verify and track status.",
    ],
    links: [
      { label: "Upload Receipt", href: "/reports" },
    ],
  },
  {
    id: "stock-taking",
    title: "Stock Taking",
    summary: "Maintain accurate counts, weekly snapshots, and reorder readiness.",
    icon: CalendarCheck,
    tags: ["Inventory"],
    steps: [
      "Use New Count to log stock for each item.",
      "Weekly Stocktake Matrix compares the last four counts.",
      "Missing Counts shows items without a recent count.",
      "Export weekly snapshots as PDF/CSV for reporting.",
    ],
    links: [
      { label: "Stock Taking Dashboard", href: "/stock" },
    ],
  },
  {
    id: "reports-analytics",
    title: "Reports & Analytics",
    summary: "Generate reports and track trends across inventory and spend.",
    icon: TrendingUp,
    tags: ["Reports", "Export"],
    steps: [
      "Use Monthly Expense Report for spend by category and custom ranges.",
      "Weekly Stock Report summarizes latest counts and status.",
      "Analytics page shows trends in spend, stock value, and usage.",
      "Export PDFs for leadership updates.",
    ],
    links: [
      { label: "Open Reports", href: "/reports" },
      { label: "Open Analytics", href: "/analytics" },
    ],
  },
  {
    id: "roles",
    title: "Roles & Permissions",
    summary: "Define who can update receipts, approve changes, and view reports.",
    icon: ShieldCheck,
    tags: ["Security", "Team"],
    steps: [
      "Admins can update receipt status and manage categories.",
      "Viewers can upload receipts and see reports assigned to them.",
      "Use Team page to understand access levels.",
    ],
    links: [
      { label: "Open Team", href: "/team" },
    ],
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    summary: "Fix common issues and ensure data is syncing correctly.",
    icon: HelpCircle,
    tags: ["Support"],
    steps: [
      "If a receipt is missing, confirm upload status and file type.",
      "If counts look wrong, recheck the raw count and numeric value.",
      "If categories do not appear, refresh after saving new categories.",
      "Use logout/login to refresh session if data seems stale.",
    ],
    links: [
      { label: "Contact Support", href: "#support" },
    ],
  },
]

const faqs = [
  {
    question: "How do I keep a running balance for receipts?",
    answer:
      "Enter the amount received for each trip. The system auto-adds the previous balance and subtracts the amount spent to keep a running balance.",
  },
  {
    question: "Why is an item showing as low stock?",
    answer:
      "Low stock appears when the latest numeric count is at or below the reorder threshold.",
  },
  {
    question: "Can I export reports for leadership?",
    answer:
      "Yes. Reports can be exported as premium PDF or CSV from the Reports page.",
  },
  {
    question: "Where do I manage categories?",
    answer:
      "Use Manage Categories in the Reports page. Categories sync to Stock Taking and Receipts.",
  },
]

export function HelpCenter() {
  const [query, setQuery] = useState("")
  const normalized = query.trim().toLowerCase()

  const filteredGuides = useMemo(() => {
    if (!normalized) return guides
    return guides.filter((guide) => {
      const haystack = [
        guide.title,
        guide.summary,
        guide.steps.join(" "),
        guide.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(normalized)
    })
  }, [normalized])

  const filteredFaqs = useMemo(() => {
    if (!normalized) return faqs
    return faqs.filter((faq) => {
      return (
        faq.question.toLowerCase().includes(normalized) ||
        faq.answer.toLowerCase().includes(normalized)
      )
    })
  }, [normalized])

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              How can we help you?
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Search our knowledge base or browse the guides below.
            </p>
            <div className="relative">
              <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help articles..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <Card key={link.label} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/50 border border-border">
                <link.icon className="h-5 w-5 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{link.label}</p>
                <p className="text-xs text-muted-foreground">{link.description}</p>
              </div>
              <Button asChild size="sm" variant="outline" className="border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent">
                <Link href={link.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGuides.map((guide) => (
          <Card
            key={guide.id}
            id={guide.id}
            className="bg-card border-border hover:border-accent transition-colors"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/50 border border-border">
                  <guide.icon className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">
                    {guide.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {guide.summary}
                  </CardDescription>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {guide.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px] uppercase tracking-wider">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="space-y-2 text-xs text-muted-foreground list-decimal list-inside">
                {guide.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="flex flex-wrap gap-2">
                {guide.links.map((link) => (
                  <Button
                    key={link.label}
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border" id="faq">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Frequently Asked Questions
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Quick answers to common questions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
              No results found. Try another search term.
            </div>
          ) : (
            filteredFaqs.map((faq) => (
              <div key={faq.question} className="rounded-lg border border-border bg-secondary/30 p-4">
                <h4 className="text-sm font-medium text-foreground mb-2">
                  {faq.question}
                </h4>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="support">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Contact Support
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Reach the team for urgent assistance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-1/20">
                <Mail className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Email Support</p>
                <a className="text-xs text-muted-foreground hover:text-foreground" href="mailto:support@nobles.org">
                  support@nobles.org
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-2/20">
                <Phone className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Phone Support</p>
                <a className="text-xs text-muted-foreground hover:text-foreground" href="tel:+254700000000">
                  +254 700 000 000
                </a>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-full border-border text-muted-foreground hover:text-foreground hover:bg-accent premium-btn bg-transparent"
            >
              <Link href="mailto:support@nobles.org">
                <MessageCircle className="mr-2 h-4 w-4" />
                Start Live Chat
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Reference Library
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Guides and documentation by topic.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {guides.map((guide) => (
              <Button
                key={guide.id}
                asChild
                variant="outline"
                className="w-full justify-between border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
              >
                <Link href={`#${guide.id}`}>
                  <span className="flex items-center gap-2">
                    <guide.icon className="h-4 w-4" />
                    {guide.title}
                  </span>
                  <FileQuestion className="h-4 w-4" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
