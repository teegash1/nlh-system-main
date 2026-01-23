"use client"

import React, { useState, useTransition } from "react"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  trigger: React.ReactNode
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  confirmVariant?: "default" | "destructive" | "secondary" | "outline"
  confirmText?: string
  confirmPlaceholder?: string
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  confirmVariant = "destructive",
  confirmText,
  confirmPlaceholder,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [typedValue, setTypedValue] = useState("")

  const handleConfirm = () => {
    startTransition(async () => {
      await onConfirm()
      setOpen(false)
    })
  }

  const requiresConfirmText = Boolean(confirmText)
  const confirmMatch =
    !requiresConfirmText ||
    typedValue.trim().toLowerCase() === String(confirmText).toLowerCase()

  const iconClasses =
    confirmVariant === "destructive"
      ? "border-destructive/20 bg-destructive/10 text-destructive"
      : "border-border bg-secondary/60 text-foreground"

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setTypedValue("")
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-card border-border sm:max-w-[420px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border",
                iconClasses
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-foreground">{title}</DialogTitle>
              {description && (
                <DialogDescription className="text-muted-foreground">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        {requiresConfirmText && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Type <span className="font-semibold text-foreground">{confirmText}</span> to confirm.
            </p>
            <Input
              value={typedValue}
              onChange={(event) => setTypedValue(event.target.value)}
              placeholder={confirmPlaceholder ?? `Type ${confirmText}`}
              className="border-border bg-background text-foreground"
            />
          </div>
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-border text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            disabled={isPending || !confirmMatch}
            onClick={handleConfirm}
          >
            {isPending ? "Working..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
