"use client"

import { useEffect, useMemo, useState } from "react"
import { Download, X } from "lucide-react"

import { Button } from "@/components/ui/button"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [installing, setInstalling] = useState(false)

  const isStandalone = useMemo(() => {
    if (typeof window === "undefined") return false
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone
    )
  }, [])

  useEffect(() => {
    if (isStandalone) return

    const handler = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => {
      window.removeEventListener("beforeinstallprompt", handler)
    }
  }, [isStandalone])

  useEffect(() => {
    if (!visible) return
    const timeout = window.setTimeout(() => {
      setVisible(false)
    }, 10000)
    return () => window.clearTimeout(timeout)
  }, [visible])

  if (!visible || dismissed || !deferredPrompt) return null

  const handleInstall = async () => {
    try {
      setInstalling(true)
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
    } finally {
      setDeferredPrompt(null)
      setVisible(false)
      setInstalling(false)
    }
  }

  return (
    <div className="fixed right-4 top-4 z-50">
      <div className="relative w-[min(92vw,320px)] rounded-2xl border border-border/70 bg-background/85 p-3 shadow-xl backdrop-blur">
        <button
          type="button"
          onClick={() => {
            setDismissed(true)
            setVisible(false)
          }}
          className="absolute right-2 top-2 rounded-full border border-border/60 bg-background/70 p-1 text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-3 w-3" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-2/15 text-chart-2">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              Download app
            </p>
            <p className="text-[11px] text-muted-foreground">
              Install Nobles Lighthouse for quick access.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleInstall}
          className="mt-3 w-full premium-btn"
          disabled={installing}
        >
          {installing ? "Installing..." : "Install"}
        </Button>
      </div>
    </div>
  )
}
