"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function VideoUploadForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement actual video upload/processing
      console.log("Processing video:", url);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate to a video detail page (using a mock ID)
      router.push(`/videos/123`);
    } catch (error) {
      console.error("Error uploading video:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        ← Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Upload New Video</CardTitle>
          <CardDescription>
            Add a YouTube video to extract vocabulary
          </CardDescription>
        </CardHeader>
        <CardContent>
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

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Processing..." : "Extract Vocabulary"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
