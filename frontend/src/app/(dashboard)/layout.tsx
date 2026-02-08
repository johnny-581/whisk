"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVideosStore } from "@/lib/store";

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
      <aside className="w-72 border-r border-emerald-100 bg-white flex flex-col">
        {/* Logo */}
        <div className="p-6 shrink-0">
          <Link
            href="/"
            className="text-emerald-900 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
          >
            whisk
          </Link>
        </div>

        <div className="flex-1 flex flex-col p-4 space-y-4">
          <Link href="/videos/new">
            <Button className="w-full rounded-xl h-11 font-bold bg-emerald-800 hover:bg-emerald-900 text-white">
              <span className="text-lg leading-none">+</span>
              New video
            </Button>
          </Link>

          {/* Video list */}
          <div className="flex-1 overflow-y-auto px-4 mt-6">
            <h2 className="text-xs font-bold text-emerald-800/50 uppercase tracking-widest mb-3">
              Videos
            </h2>

            <div className="space-y-3">
              {videos.length === 0 ? (
                <p className="text-sm text-emerald-900/40 italic font-medium">
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

                    <div className="mt-3 h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-emerald-300 rounded-full" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto bg-mint-50 p-12">{children}</main>
    </div>
  );
}
