"use client";

import { useEffect, useMemo, useState } from "react";
import type { APIRequest } from "@pipecat-ai/client-js";
import type { PipecatBaseChildProps } from "@pipecat-ai/voice-ui-kit";
import {
  ThemeProvider,
  ErrorCard,
  FullScreenContainer,
  PipecatAppBase,
} from "@pipecat-ai/voice-ui-kit";

import { VocabLiveChatContent } from "./components/VocabLiveChatContent";
import { DEFAULT_TRANSPORT, TRANSPORT_CONFIG } from "./config";
import { useUserStore } from "@/lib/store";

const FALLBACK_WORDS = [
  "りんご",
  "あい",
  "ねこ",
  "いぬ",
  "みず",
  "やま",
  "ともだち",
  "ほん",
];

const MIN_VOCAB = 6;
const MAX_VOCAB = 10;
const DEFAULT_USER_LEVEL = "N3";

interface VocabWord {
  id?: string;
  word: string;
  difficulty?: string;
  start_time?: string;
}

const pickRandomRange = <T,>(
  items: T[],
  minCount: number,
  maxCount: number
): T[] => {
  if (!items.length) return [];
  const upper = Math.min(maxCount, items.length);
  if (upper <= minCount) {
    return items.slice(0, upper);
  }

  const count =
    minCount + Math.floor(Math.random() * Math.max(1, upper - minCount + 1));
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
};

const normalizeLevel = (level: string) => {
  const upper = (level || "").toUpperCase();
  return ["N1", "N2", "N3", "N4", "N5"].includes(upper) ? upper : "N3";
};

const normalizeWord = (
  entry: unknown,
  level: string,
  index: number
): VocabWord | null => {
  if (typeof entry === "string") {
    const trimmed = entry.trim();
    return trimmed
      ? {
          id: `word-${index}-${trimmed}`,
          word: trimmed,
          difficulty: level,
        }
      : null;
  }

  if (typeof entry === "object" && entry) {
    const obj = entry as Record<string, unknown>;
    const word = typeof obj.word === "string" ? obj.word.trim() : "";
    if (!word) return null;
    const difficulty =
      typeof obj.difficulty === "string"
        ? normalizeLevel(obj.difficulty)
        : level;

    return {
      id: typeof obj.id === "string" ? obj.id : `word-${index}-${word}`,
      word,
      difficulty,
      start_time:
        typeof obj.start_time === "string" ? obj.start_time : undefined,
    };
  }

  return null;
};

// Main Feature Component with Providers
interface VocabLiveChatProps {
  conversationId?: string;
}

export const VocabLiveChat = ({ conversationId }: VocabLiveChatProps = {}) => {
  const videoId = conversationId ?? "default";
  const [initialWords, setInitialWords] = useState<VocabWord[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [userLevel, setUserLevel] = useState<string>(DEFAULT_USER_LEVEL);
  const [connectParams, setConnectParams] = useState<APIRequest>(
    TRANSPORT_CONFIG[DEFAULT_TRANSPORT]
  );
  const jlptLevel = useUserStore((state) => state.jlptLevel);

  const vocabEndpoint = useMemo(() => {
    return `/api/videos/${videoId}/vocab`;
  }, [videoId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (jlptLevel && Number.isFinite(jlptLevel)) {
      setUserLevel(normalizeLevel(`N${jlptLevel}`));
      return;
    }

    const storedLevel = window.localStorage.getItem("userLevel");
    if (storedLevel) {
      setUserLevel(normalizeLevel(storedLevel));
    }
  }, [jlptLevel]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const loadVocab = async () => {
      setIsInitializing(true);
      setInitError(null);
      const level = normalizeLevel(userLevel);
      try {
        const res = await fetch(`${vocabEndpoint}?level=${level}`, {
          method: "GET",
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(await res.text());
        }
        const data = await res.json();
        const vocab = Array.isArray(data?.vocab) ? data.vocab : [];
        const normalized: VocabWord[] = vocab
          .map((entry: unknown, idx: number) =>
            normalizeWord(entry, level, idx)
          )
          .filter(
            (entry: VocabWord | null): entry is VocabWord => Boolean(entry)
          );

        const fallbackWords: VocabWord[] = FALLBACK_WORDS.map(
          (word: string, idx: number) => ({
            id: `fallback-${idx}-${word}`,
            word,
            difficulty: level,
          })
        );

        const picked: VocabWord[] =
          normalized.length > 0
            ? pickRandomRange<VocabWord>(normalized, MIN_VOCAB, MAX_VOCAB)
            : pickRandomRange<VocabWord>(fallbackWords, MIN_VOCAB, MAX_VOCAB);

        if (isMounted) {
          setInitialWords(picked);
        }
      } catch (error) {
        const fallbackWords: VocabWord[] = FALLBACK_WORDS.map(
          (word: string, idx: number) => ({
            id: `fallback-${idx}-${word}`,
            word,
            difficulty: normalizeLevel(userLevel),
          })
        );
        if (isMounted) {
          setInitError("Failed to load vocab list.");
          setInitialWords(
            pickRandomRange<VocabWord>(fallbackWords, MIN_VOCAB, MAX_VOCAB)
          );
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    loadVocab();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [vocabEndpoint, userLevel]);

  useEffect(() => {
    const baseConfig = TRANSPORT_CONFIG[DEFAULT_TRANSPORT];
    const baseRequestData =
      (baseConfig.requestData as Record<string, unknown> | undefined) ?? {};
    setConnectParams({
      ...baseConfig,
      requestData: {
        ...baseRequestData,
        videoId,
        userLevel,
        vocab: initialWords.map(
          ({ id, word, difficulty, start_time }: VocabWord) => ({
            id: id ?? null,
            word,
            difficulty: difficulty ?? null,
            start_time: start_time ?? null,
          })
        ),
      },
    });
  }, [initialWords, userLevel, videoId]);

  return (
    <ThemeProvider defaultTheme="terminal" disableStorage>
      <FullScreenContainer>
        <PipecatAppBase
          connectParams={connectParams}
          transportType={DEFAULT_TRANSPORT}
        >
          {({
            client,
            handleConnect,
            handleDisconnect,
            error,
          }: PipecatBaseChildProps) =>
            !client ? (
              <div className="flex min-h-screen w-full items-center justify-center bg-[#0f1f1a] text-white/80">
                <p>Preparing conversation...</p>
              </div>
            ) : error ? (
              <ErrorCard>{error}</ErrorCard>
            ) : (
              <VocabLiveChatContent
                client={client}
                handleConnect={handleConnect}
                handleDisconnect={handleDisconnect}
                initialWords={initialWords}
                videoId={videoId}
              />
            )
          }
        </PipecatAppBase>
        {initError && (
          <div className="pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-sm">
            {initError}
          </div>
        )}
      </FullScreenContainer>
    </ThemeProvider>
  );
};
