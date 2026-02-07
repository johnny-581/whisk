"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { useEffect, useState } from "react";

interface VideoDetailProps {
  videoId: string;
}

/** Matches backend Vocab: japanese_vocab, pronunciation, english_translation, timestamp, jlpt_level */
interface VocabItem {
  japanese_vocab: string;
  pronunciation: string;
  english_translation: string;
  timestamp?: string;
  jlpt_level?: number;
}

interface VideoInfo {
  title: string;
  video_url: string;
  duration: string;
  tags: string[];
  summary: string;
  vocab: VocabItem[];
}

const YOUTUBE_WATCH_URL = "https://www.youtube.com/watch?v=";
const YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/";

// Placeholder until we have a conversations-by-video API
const MOCK_CONVERSATIONS = [
  { id: "1", label: "Saturday, Jan 31 at 4:00 PM" },
  { id: "2", label: "Friday, Jan 30 at 8:32 PM" },
  { id: "3", label: "Friday, Jan 30 at 8:32 PM" },
  { id: "4", label: "Friday, Jan 30 at 8:32 PM" },
];

export function VideoDetail({ videoId }: VideoDetailProps) {
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideoInfo = async () => {
      try {
        setLoading(true);
        setError(null);
  
        // 1️⃣ Try DB first
        console.log("video id:", videoId)
        const dbRes = await fetch(`/api/db/${videoId}`);
  
        if (dbRes.ok) {
          const dbData = await dbRes.json();
  
          setInfo({
            title: dbData.title ?? "Untitled video",
            video_url: dbData.video_url ?? `${YOUTUBE_WATCH_URL}${videoId}`,
            duration: dbData.duration ?? "",
            tags: Array.isArray(dbData.tags) ? dbData.tags : [],
            summary: dbData.summary ?? "",
            vocab: Array.isArray(dbData.vocab) ? dbData.vocab : [],
          });
  
          return; // ✅ STOP — skip analysis
        }
  
        // 2️⃣ Not in DB → run analysis
        const res = await fetch("/api/video-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            video_url: `${YOUTUBE_WATCH_URL}${videoId}`,
            user_level: 4,
          }),
        });
  
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to analyze video");
        }
  
        const data = await res.json();
  
        setInfo({
          title: data.title ?? "Untitled video",
          video_url: data.video_url ?? `${YOUTUBE_WATCH_URL}${videoId}`,
          duration: data.duration ?? "",
          tags: Array.isArray(data.tags) ? data.tags : [],
          summary: data.summary ?? "",
          vocab: Array.isArray(data.vocab) ? data.vocab : [],
        });
  
        // 3️⃣ (Optional but recommended) Save to DB
        // await fetch("/api/videos", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(data),
        // });
  
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
  
    fetchVideoInfo();
  }, [videoId]);
  

  if (error) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-600">{error}</p>
        <Button variant="secondary" onClick={() => window.history.back()}>
          ← Back
        </Button>
      </div>
    );
  }

  const title = info?.title ?? "";
  const videoUrl = info?.video_url ?? `${YOUTUBE_WATCH_URL}${videoId}`;
  const tags = info?.tags ?? [];
  const vocab = info?.vocab ?? [];
  const summary = info?.summary ?? "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-[#1A2421] leading-tight">
          {loading ? "Loading…" : title || "Untitled video"}
        </h1>

        <p className="text-sm text-muted-foreground break-all">{videoUrl}</p>

        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}

          <Link href={`/conversations/${videoId}`} className="ml-auto">
            <Button
              variant="secondary"
              className="rounded-xl border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              icon={EqualizerIcon}
            >
              AI Practice
            </Button>
          </Link>
        </div>
      </header>

      {/* Main: video + vocab */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* VIDEO */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-video">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                Loading…
              </div>
            ) : (
              <>
                <iframe
                  src={`${YOUTUBE_EMBED_URL}${videoId}`}
                  title={title}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />

                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded bg-black/60 px-2 py-1.5 text-xs text-white hover:bg-black/80"
                  >
                    <YoutubeIcon />
                    Watch on Youtube
                  </a>

                  <button
                    type="button"
                    className="rounded bg-black/60 p-1.5 text-white hover:bg-black/80"
                    aria-label="Share"
                  >
                    <ShareIcon />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* VOCAB CARD */}
        <Card className="rounded-xl h-full flex flex-col p-0">
          <div className="pb-2 shrink-0 p-6">
            <h3 className="text-base font-semibold">Vocab</h3>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            {loading ? (
              <p className="text-sm text-neutral-600">Extracting vocabulary…</p>
            ) : vocab.length === 0 ? (
              <p className="text-sm text-neutral-600">No vocabulary yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-emerald-100 text-left text-neutral-600 font-medium">
                      <th className="pb-2 pr-4">Vocab</th>
                      <th className="pb-2 pr-4">Pronunciation</th>
                      <th className="pb-2">Translation</th>
                    </tr>
                  </thead>

                  <tbody>
                    {vocab.map((v, idx) => (
                      <tr key={idx} className="border-b border-emerald-50/80">
                        <td className="py-2 pr-4 font-medium text-[#1A2421]">
                          {v.japanese_vocab}
                        </td>
                        <td className="py-2 pr-4 text-neutral-600">
                          {v.pronunciation}
                        </td>
                        <td className="py-2 text-neutral-600">
                          {v.english_translation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Summary */}
      {summary && (
        <p className="text-sm text-muted-foreground max-w-2xl">{summary}</p>
      )}

      {/* Conversations */}
      <Card className="rounded-xl">
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Your conversations</h3>
          <ul className="divide-y divide-emerald-50">
            {MOCK_CONVERSATIONS.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/conversations/${c.id}`}
                  className="flex items-center justify-between py-3 text-sm text-[#1A2421] hover:text-emerald-700"
                >
                  <span>{c.label}</span>
                  <span className="text-neutral-600">
                    <ArrowRightIcon />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}

/* Icons unchanged below */

function EqualizerIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="20" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="4" />
      <line x1="12" y1="20" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="4" />
      <line x1="20" y1="20" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="4" />
      <line x1="2" y1="14" x2="6" y2="14" />
      <line x1="10" y1="12" x2="14" y2="12" />
      <line x1="18" y1="16" x2="22" y2="16" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
