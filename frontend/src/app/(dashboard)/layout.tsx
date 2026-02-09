"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVideosStore } from "@/lib/store";
import whisk from "@/assets/whisk.png";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const videos = useVideosStore((s) => s.videos);
  const setVideos = useVideosStore((s) => s.setVideos);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/videos", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch videos");
        const data = await res.json();
        const videosArray = Array.isArray(data) ? data : [];
        setVideos(videosArray);
        if (videosArray.length > 0) {
          router.push(`/videos/${videosArray[0].video_id}`);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchVideos();
  }, [setVideos]);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-mint-100 bg-white flex flex-col">
  {/* Logo */}
  <div className="p-6 shrink-0">
    <Link href="/dashboard" className="flex items-center gap-2">
        <img src={whisk.src} alt="Whisk logo" className="h-8 w-8" />
        <span className="text-mint-800 font-bold text-xl tracking-tight">
            whisk
        </span>
    </Link>
  </div>

  {/* Main Sidebar Content Area */}
  <div className="flex-1 flex flex-col pt-4"> {/* Removed global p-4 */}
    
    {/* Button Container - Now matches the video list padding */}
 <div className="px-4 mb-4">
  <Link href="/videos/new" passHref>
    <Button 
      variant="primary"   // Matches your ButtonVariant type
      size="large"        // Matches your ButtonSize type (replaces h-11)
      className="w-full font-bold" // Layout-specific styling
    >
      New video
    </Button>
  </Link>
</div>

    {/* Video list */}
    <div className="flex-1 overflow-y-auto px-4 mt-6">
      <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-8">
        Videos
      </h2>

      <div className="space-y-3 pb-4">
        {videos.length === 0 ? (
          <p className="text-sm text-mint-400 font-medium px-2">
            No videos yet
          </p>
        ) : (
          videos.map((video) => (
            <button
              key={video.id ?? video.video_id}
              onClick={() => router.push(`/videos/${video.video_id}`)}
              className="w-full text-left rounded-2xl bg-emerald-50 hover:bg-emerald-100 transition-colors p-4 shadow-sm"
            >
              <p className="font-medium text-emerald-900 truncate">
                {video.title}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  </div>
</aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-mint-50">
        {children}
      </main>
    </div>
  );
}