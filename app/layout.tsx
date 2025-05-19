import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import "@/app/globals.css"
import { cn } from "@/lib/utils"
import { Providers } from "@/components/providers"
import { Header } from "@/components/header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Honda Customer Service AI",
  description: "AI-powered customer service assistant for Honda",
  metadataBase: new URL("https://honda-ai-chatbot.vercel.app"),
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen font-sans antialiased", inter.className)}>
        <Providers attribute="class" defaultTheme="light">
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex flex-col flex-1 bg-muted/40">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
