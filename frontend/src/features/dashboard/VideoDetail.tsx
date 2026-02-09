"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { useEffect, useState } from "react";
import { useUserStore, useVideosStore } from "@/lib/store";

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
  const jlptLevel = useUserStore((state) => state.jlptLevel);
  const upsertVideo = useVideosStore((s) => s.upsertVideo);

  useEffect(() => {
    const fetchVideoInfo = async () => {
      try {
        setLoading(true);
        setError(null);

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
          return;
        }

        const res = await fetch("/api/video-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            video_url: `${YOUTUBE_WATCH_URL}${videoId}`,
            user_level: jlptLevel,
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

        upsertVideo({
          id: data.id ?? videoId,
          video_id: data.video_id ?? videoId,
          title: data.title ?? "Untitled video",
        });

        await fetch("/api/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchVideoInfo();
  }, [videoId, jlptLevel, upsertVideo]);

  if (error) {
    return (
      <div className="p-8 space-y-4">
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
    /* ADDED: 
       - p-8: Large padding for a professional dashboard feel
       - max-w-7xl: Prevents content from stretching too wide on 4K screens
       - mx-auto: Keeps the container centered
    */
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#1A2421] tracking-tight">
              {loading ? "Loading…" : title || "Untitled video"}
            </h1>
            <p className="text-sm text-muted-foreground break-all opacity-70">
              {videoUrl}
            </p>
          </div>

          {/* AI Practice Button - Now fully compliant with button.tsx */}
          <Link href={`/conversations/${videoId}`} passHref>
            <Button variant="primary" size="large">
              AI Practice
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-8 lg:h-[50vh] min-h-[400px]">
        {/* VIDEO PLAYER */}
        <div className="flex-[2] min-w-0">
          <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black shadow-lg border border-mint-100">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-neutral-900">
                <span className="animate-pulse">Loading Video...</span>
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
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-black/70 backdrop-blur-md px-3 py-2 text-xs text-white hover:bg-black/90 transition-colors pointer-events-auto"
                  >
                    <YoutubeIcon />
                    Watch on Youtube
                  </a>
                </div>
              </>
            )}
          </div>
        </div>

        {/* VOCAB CARD */}
        <Card className="flex-1 min-w-0 flex flex-col shadow-sm border-mint-100 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-mint-100 bg-white sticky top-0 z-10">
            <h3 className="text-lg font-bold text-neutral-900">
              Vocabulary List
            </h3>
          </div>

          {/* Changed: Added overflow-x-auto and overflow-y-auto to allow both scroll directions */}
          <div className="flex-1 overflow-auto p-5 pt-0">
            {loading ? (
              <div className="py-10 text-center space-y-2">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full" />
                <p className="text-sm text-neutral-500">Analyzing speech...</p>
              </div>
            ) : vocab.length === 0 ? (
              <p className="py-10 text-center text-sm text-neutral-400">
                No vocabulary extracted.
              </p>
            ) : (
              /* Changed: Added w-max to force the table to expand to the width of its longest text */
              <table className="w-max min-w-full text-sm">
                <thead className="sticky top-0 bg-white z-20">
                  <tr className="text-left text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                    {/* Added whitespace-nowrap to headers to prevent them from breaking */}
                    <th className="py-3 pr-8 whitespace-nowrap">Word</th>
                    <th className="py-3 pr-8 whitespace-nowrap">Reading</th>
                    <th className="py-3 whitespace-nowrap">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50/50">
                  {vocab.map((v, idx) => (
                    <tr
                      key={idx}
                      className="group hover:bg-emerald-50/30 transition-colors"
                    >
                      {/* Added whitespace-nowrap to cells so they don't wrap onto new lines */}
                      <td className="py-3 pr-8 font-bold text-neutral-900 whitespace-nowrap">
                        {v.japanese_vocab}
                      </td>
                      <td className="py-3 pr-8 text-mint-800 font-medium whitespace-nowrap">
                        {v.pronunciation}
                      </td>
                      <td className="py-3 text-neutral-400 whitespace-nowrap">
                        {v.english_translation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* Footer Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {summary && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">
              Summary
            </h3>
            <p className="text-base text-neutral-700 leading-relaxed bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm">
              {summary}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400">
            Past Conversations
          </h3>
          <Card className="rounded-2xl border-emerald-50 shadow-sm overflow-hidden">
            <ul className="divide-y divide-emerald-50">
              {MOCK_CONVERSATIONS.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/conversations/${c.id}`}
                    className="flex items-center justify-between px-5 py-4 text-sm font-medium text-emerald-950 hover:bg-emerald-50 transition-colors group"
                  >
                    <span>{c.label}</span>
                    <span className="text-emerald-300 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1">
                      <ArrowRightIcon />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
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
