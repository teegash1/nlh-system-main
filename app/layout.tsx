import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ScrollToTop } from "@/components/layout/scroll-to-top"
import { ThemeProvider } from "@/components/theme-provider"

const _inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Nobles Lighthouse System',
  description: 'Church Stock Taking & Monitoring System - A premium inventory management solution for houses of worship',
  generator: 'v0.app',
  keywords: ['inventory', 'stock management', 'church', 'monitoring', 'nobles lighthouse'],
  authors: [{ name: 'Nobles Lighthouse' }],
}

export const viewport: Viewport = {
  themeColor: '#0a0a0b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ScrollToTop />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
