"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const extractVideoId = (url: string): string => {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new Error("Invalid YouTube URL");
    }
    const hostname = parsed.hostname;
    if (hostname === "www.youtube.com" || hostname === "youtube.com") {
      const videoId = parsed.searchParams.get("v");
      if (videoId) return videoId;
    }
    if (hostname === "youtu.be") {
      const videoId = parsed.pathname.replace("/", "");
      if (videoId) return videoId;
    }
    throw new Error("Invalid YouTube URL");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Processing video:", url);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push(`/videos/${extractVideoId(url)}`);
    } catch (error) {
      console.error("Error uploading video:", error);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Main Content Area - Centered vertically, but content inside is left-aligned */}
      <main className="flex-1 overflow-auto bg-background flex items-center justify-center p-12">
        <div className="w-full max-w-2xl flex flex-col items-start space-y-6">
          <h1 className="text-3xl font-semibold text-[#1A2421] text-left">
  Upload a video and start speaking now.
</h1>
          
          <form onSubmit={handleSubmit} className="w-full flex gap-3">
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-5 py-4 rounded-2xl focus:border-gray-300 focus:ring-0 outline-none transition-all text-gray-600 placeholder:text-gray-300 font-medium bg-white shadow-sm"
              required
            />
            
            <Button
              type="submit"
              disabled={loading}
              className="px-8 h-auto text-lg font-bold rounded-2xl transition-all duration-300 shadow-lg hover:opacity-90 active:scale-[0.98] text-white shrink-0"
              style={{ backgroundColor: "#1D4D3F" }}
            >
              {loading ? "..." : "Continue"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}