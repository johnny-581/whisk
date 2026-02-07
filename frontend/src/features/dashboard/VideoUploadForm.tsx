"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function VideoUploadForm() {
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
      // TODO: Implement actual video upload/processing
      console.log("Processing video:", url);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      router.push(`/videos/${extractVideoId(url)}`);
    } catch (error) {
      console.error("Error uploading video:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button
        variant="secondary"
        onClick={() => router.back()}
        className="mb-4"
      >
        ← Back
      </Button>

      <Card>
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Upload New Video</h2>
            <p className="text-sm text-neutral-600">
              Add a YouTube video to extract vocabulary
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium mb-2">
                YouTube URL
              </label>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <Button type="submit" active={!loading} className="w-full">
              {loading ? "Processing..." : "Extract Vocabulary"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
