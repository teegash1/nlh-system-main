import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Book,
  MessageCircle,
  Video,
  FileQuestion,
  ChevronRight,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Loading from "./loading"

const helpTopics = [
  {
    id: "1",
    title: "Getting Started",
    description: "Learn the basics of using Nobles Lighthouse System",
    icon: Book,
    articles: 5,
    color: "chart-1",
  },
  {
    id: "2",
    title: "Stock Management",
    description: "How to add, edit, and track inventory items",
    icon: FileQuestion,
    articles: 12,
    color: "chart-2",
  },
  {
    id: "3",
    title: "Reports & Analytics",
    description: "Generate and understand stock reports",
    icon: Video,
    articles: 8,
    color: "chart-3",
  },
  {
    id: "4",
    title: "Team & Permissions",
    description: "Managing users and access levels",
    icon: MessageCircle,
    articles: 6,
    color: "chart-5",
  },
]

const faqs = [
  {
    question: "How do I add a new stock item?",
    answer: "Navigate to Stock Taking, click 'Add Item', and fill in the required details.",
  },
  {
    question: "Can I export my inventory data?",
    answer: "Yes! Use the 'Export Report' button on the Stock Taking page to download PDF or CSV files.",
  },
  {
    question: "How do I set up low stock alerts?",
    answer: "Go to Settings > Notifications and enable 'Low Stock Alerts'. You can customize thresholds per item.",
  },
  {
    question: "Who can access the system?",
    answer: "Administrators can invite team members via the Team page. Each member can have different permission levels.",
  },
]

export default function HelpPage() {
  return (
    <AppShell title="Help & Support" subtitle="Find answers and get assistance">
      <div className="p-4 md:p-6 space-y-6">
        {/* Page Header - Mobile */}
        <div className="md:hidden">
          <h1 className="text-xl font-semibold text-foreground">Help & Support</h1>
          <p className="text-sm text-muted-foreground">
            How can we help you today?
          </p>
        </div>

        {/* Search */}
        <Suspense fallback={<Loading />}>
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="text-center max-w-xl mx-auto">
                <h2 className="text-lg font-semibold text-foreground mb-2">How can we help you?</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Search our knowledge base or browse topics below
                </p>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for help articles..."
                    className="pl-10 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </Suspense>

        {/* Help Topics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {helpTopics.map((topic) => (
            <Card
              key={topic.id}
              className="bg-card border-border hover:border-accent transition-colors cursor-pointer"
            >
              <CardContent className="p-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-${topic.color}/20 mb-3`}>
                  <topic.icon className={`h-6 w-6 text-${topic.color}`} />
                </div>
                <h3 className="text-sm font-medium text-foreground">{topic.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{topic.description}</p>
                <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                  <span>{topic.articles} articles</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Frequently Asked Questions
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Quick answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-secondary/30 border border-border"
                >
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    {faq.question}
                  </h4>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">
                Contact Support
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Get in touch with our support team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-1/20">
                  <Mail className="h-5 w-5 text-chart-1" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Email Support</p>
                  <p className="text-xs text-muted-foreground">support@nobles.org</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-chart-2/20">
                  <Phone className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Phone Support</p>
                  <p className="text-xs text-muted-foreground">+254 700 000 000</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full border-border text-muted-foreground hover:text-foreground hover:bg-accent premium-btn bg-transparent"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Start Live Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">
                Resources
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Additional learning materials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-between border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
              >
                <span className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Video Tutorials
                </span>
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
              >
                <span className="flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  User Guide PDF
                </span>
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full justify-between border-border text-muted-foreground hover:text-foreground hover:bg-accent bg-transparent"
              >
                <span className="flex items-center gap-2">
                  <FileQuestion className="h-4 w-4" />
                  Release Notes
                </span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
