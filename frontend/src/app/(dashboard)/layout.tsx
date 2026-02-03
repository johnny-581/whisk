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
      <aside className="w-64 border-r bg-background flex flex-col">
        {/* App Title */}
        <div className="p-6 border-b">
          <Link href="/" className="text-xl font-bold">
            Learn Japanese!
          </Link>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 flex flex-col p-4 space-y-4">
          {/* Upload New Video Button */}
          <Button asChild className="w-full">
            <Link href="/videos/new">Upload New Video</Link>
          </Button>

          {/* Onboarding Button */}
          <Button asChild variant="outline" className="w-full">
            <Link href="/onboarding">Onboarding (for demo) </Link>
          </Button>

          {/* Conversations Button (remove in future, since it should be on individual video pages) */}
          <Button asChild variant="outline" className="w-full">
            <Link href="/conversations/123">Conversations (for demo)</Link>
          </Button>

          {/* Videos List Section */}
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3 px-2">
              Videos
            </h2>
            <div className="space-y-1">
              {/* Video list will go here - empty for now */}
              <p className="text-xs text-muted-foreground px-2 py-2">
                No videos yet
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
