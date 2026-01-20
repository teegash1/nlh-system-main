"use client"

import React, { useEffect } from "react"

import { Sidebar } from "./sidebar"
import { MobileNav } from "./mobile-nav"
import { Header } from "./header"

interface AppShellProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function AppShell({ children, title, subtitle }: AppShellProps) {
  useEffect(() => {
    console.log("[v0] AppShell mounted with title:", title)
  }, [title])
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Header title={title} subtitle={subtitle} />
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  )
}
