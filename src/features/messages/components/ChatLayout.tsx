"use client"

import { Header } from "@/components/layout/Header"
import type { ReactNode } from "react"

interface ChatLayoutProps {
  children: ReactNode
}

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-hidden container mx-auto max-w-7xl px-4">{children}</main>
      {/* <Footer /> */}
    </div>
  )
}
