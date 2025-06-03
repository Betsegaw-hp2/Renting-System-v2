"use client"

import { Header } from "@/components/layout/Header"
import { ChatThread } from "./ChatThread"

export function MessagesPage() {
  // Responsive, minimal, shadcn-styled chat container
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex flex-1 items-center justify-center w-full">

          <ChatThread />
      </main>
    </div>
  )
}