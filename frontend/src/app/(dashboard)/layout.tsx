"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-emerald-100 bg-white flex flex-col">
        <div className="p-6 shrink-0">
          <Link
            href="/"
            className="text-emerald-900 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
          >
            LearnJapanese
          </Link>
        </div>

        <div className="flex-1 flex flex-col p-4 space-y-4">
          <Button
            asChild
            className="w-full rounded-xl h-11 font-bold bg-emerald-800 hover:bg-emerald-900 text-white"
          >
            <Link href="/videos/new" className="flex items-center justify-center gap-2">
              <span className="text-lg leading-none">+</span>
              New video
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full border-emerald-100 text-emerald-900 hover:bg-emerald-50 rounded-xl h-11 font-bold"
          >
            <Link href="/conversations/123">Conversations (for demo)</Link>
          </Button>

          <div className="flex-1 mt-4">
            <h2 className="text-xs font-bold text-emerald-800/50 uppercase tracking-widest mb-3 px-2">
              Videos
            </h2>
            <div className="space-y-1">
              <p className="text-sm text-emerald-900/40 px-2 py-2 italic font-medium">
                No videos yet
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area - render the actual page (dashboard, videos, etc.) */}
      <main className="flex-1 overflow-auto bg-background p-12">
        {children}
      </main>
    </div>
  );
}