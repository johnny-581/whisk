"use client";

import { useEffect, useMemo, useState } from "react";
import type { PipecatBaseChildProps } from "@pipecat-ai/voice-ui-kit";
import {
  ThemeProvider,
  ErrorCard,
  FullScreenContainer,
  PipecatAppBase,
  SpinLoader,
} from "@pipecat-ai/voice-ui-kit";

import { VocabLiveChatContent } from "./components/VocabLiveChatContent";
import { DEFAULT_TRANSPORT, TRANSPORT_CONFIG } from "./config";

const FALLBACK_WORDS = [
  "apple",
  "banana",
  "cherry",
  "date",
  "elderberry",
  "fig",
  "grape",
  "honey",
];

const pickRandom = (words: string[], maxCount: number) => {
  const copy = [...words];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, maxCount);
};

// Main Feature Component with Providers
interface VocabLiveChatProps {
  conversationId?: string;
}

export const VocabLiveChat = ({ conversationId }: VocabLiveChatProps = {}) => {
  const connectParams = TRANSPORT_CONFIG[DEFAULT_TRANSPORT];
  const [initialWords, setInitialWords] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const vocabEndpoint = useMemo(() => {
    const videoId = conversationId ?? "default";
    return `/api/videos/${videoId}/vocab`;
  }, [conversationId]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const loadVocab = async () => {
      setIsInitializing(true);
      setInitError(null);
      const delayMs = 5000 + Math.floor(Math.random() * 5000);
      const delayPromise = new Promise((resolve) =>
        setTimeout(resolve, delayMs)
      );

      try {
        const res = await fetch(vocabEndpoint, {
          method: "GET",
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(await res.text());
        }
        const data = await res.json();
        const vocab = Array.isArray(data?.vocab) ? data.vocab : [];
        const normalized = vocab
          .map((entry: { word?: string } | string) =>
            typeof entry === "string" ? entry : entry.word
          )
          .filter((word: string | undefined): word is string => Boolean(word));

        const picked = pickRandom(
          normalized.length > 0 ? normalized : FALLBACK_WORDS,
          6
        );
        if (isMounted) {
          setInitialWords(picked);
        }
      } catch (error) {
        if (isMounted) {
          setInitError("Failed to load vocab list.");
          setInitialWords(pickRandom(FALLBACK_WORDS, 6));
        }
      } finally {
        await delayPromise;
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
  }, [vocabEndpoint]);

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
              <SpinLoader />
            ) : error ? (
              <ErrorCard>{error}</ErrorCard>
            ) : isInitializing ? (
              <SpinLoader />
            ) : (
              <VocabLiveChatContent
                client={client}
                handleConnect={handleConnect}
                handleDisconnect={handleDisconnect}
                initialWords={initialWords}
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
