"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

function extractVideoId(url: string): string {
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
}

export default function DashboardPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="flex items-center justify-center min-h-[60vh]">
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
    </div>
  );
}
