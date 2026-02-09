"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    router.push(`/videos/upload?url=${encodeURIComponent(url)}`);
  };

  return (
    /* Added bg-mint-50 here to cover the page area */
    <div className="flex flex-col items-center justify-center h-full px-6 bg-mint-50">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header Text */}
        <div className="text-left">
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
            what do you want to watch?
          </h1>
        </div>

        {/* Separated Input and Button */}
        <form 
          onSubmit={handleUpload}
          className="flex items-center gap-4 w-full"
        >
          <input
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 h-14 pl-4 pr-4 rounded-[12px] border-1 border-white bg-white focus:border-mint-100 outline-none text-lg transition-all placeholder:text-neutral-400"
          />

          <Button
            type="submit"
            size="large"
            active={url.length > 0}
            className="h-14 px-10 shrink-0"
          >
            Start learning
          </Button>
        </form>
      </div>
    </div>
  );
}