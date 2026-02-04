"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { WordCard } from "@/components/ui/WordCard";

interface VideoDetailProps {
  videoId: string;
}

interface Word {
  word: string;
  start_time: string;
}

export function VideoDetail({ videoId }: VideoDetailProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideoInfo = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/vocab-extract", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ video_id: videoId }),
        });

        if (!res.ok) {
          throw new Error(await res.text());
        }

        const data = await res.json();

        setTitle(data.title ?? "Untitled video");
        setDuration(data.duration ?? "");
        setWords(data.vocab ?? []);
      } catch (error) {
        console.error("Failed to fetch video info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoInfo();
  }, [videoId]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        ← Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{loading ? "Loading…" : title}</CardTitle>
          <CardDescription>
            Video details and extracted vocabulary
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Video Info */}
          <div>
            <h3 className="font-semibold mb-2">Video Information</h3>
            <p className="text-sm text-muted-foreground">
              Put summary here
            </p>
            <p className="text-sm text-muted-foreground">
              Duration: {duration || "—"}
            </p>
          </div>

          {/* Vocabulary */}
          <div>
            <h3 className="font-semibold mb-2">Extracted Vocabulary</h3>

            {loading ? (
              <p className="text-sm text-muted-foreground">
                Extracting vocabulary…
              </p>
            ) : words.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No vocabulary found.
              </p>
            ) : (
              <div className="space-y-2">
                {words.map((w, idx) => (
                  <WordCard
                    key={idx}
                    word={w.word}
                    start_time={w.start_time}
                  />
                ))}
              </div>
            )}
          </div>

          <Button asChild className="w-full">
            <Link href={`/conversations/${videoId}`}>
              Practice with this Video
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
