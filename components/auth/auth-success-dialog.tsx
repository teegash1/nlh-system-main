"use client"

import { useEffect, useState } from "react"
import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AuthSuccessDialogProps {
  message?: string | null
  title?: string
  actionLabel?: string
  onAction?: () => void
}

export function AuthSuccessDialog({
  message,
  title = "Account created",
  actionLabel = "Continue",
  onAction,
}: AuthSuccessDialogProps) {
  const [open, setOpen] = useState(Boolean(message))

  useEffect(() => {
    setOpen(Boolean(message))
  }, [message])

  if (!message) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="glass border-border/70 text-foreground">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-chart-2/40 bg-chart-2/10">
              <CheckCircle2 className="h-6 w-6 text-chart-2" />
            </div>
            <div>
              <DialogTitle className="text-xl">{title}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {message}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            className="bg-accent text-foreground hover:bg-accent/80 border border-border premium-btn"
            onClick={() => {
              onAction?.()
              setOpen(false)
            }}
          >
            {actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
