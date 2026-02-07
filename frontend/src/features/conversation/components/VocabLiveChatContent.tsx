"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import type { PipecatBaseChildProps } from "@pipecat-ai/voice-ui-kit";
import { UserAudioControl } from "@pipecat-ai/voice-ui-kit";
import { useRTVIClientEvent } from "@pipecat-ai/client-react";
import { RTVIEvent } from "@pipecat-ai/client-js";

import { AgentSpeechBubble } from "./AgentSpeechBubble";
import { ConnectionButton } from "./ConnectionButton";
import { ExitModal } from "./ExitModal";
import { WordTracker } from "./WordTracker";
import conversationBg from "@/assets/conversation-bg.png";

// Types
interface ServerMessage {
  type: string;
  payload?: string;
}

interface UserTranscriptData {
  text: string;
  final?: boolean;
  timestamp: string;
  user_id: string;
}

interface WordInput {
  id?: string;
  word: string;
  difficulty?: string;
  start_time?: string;
}

interface Word extends WordInput {
  active: boolean;
}

interface VocabLiveChatContentProps extends PipecatBaseChildProps {
  initialWords: WordInput[];
  videoId: string;
}

// Content Component (separated for cleaner logic)
export const VocabLiveChatContent = ({
  client,
  handleConnect,
  handleDisconnect,
  initialWords,
  videoId,
}: VocabLiveChatContentProps) => {
  // State Management
  const [words, setWords] = useState<Word[]>(() =>
    initialWords.map((w) => ({ ...w, active: true }))
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingExit, setPendingExit] = useState(false);
  const router = useRouter();

  // Initialize devices on mount
  useEffect(() => {
    client?.initDevices();
  }, [client]);

  useEffect(() => {
    setWords(initialWords.map((w) => ({ ...w, active: true })));
  }, [initialWords]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowExitModal(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Event Handlers
  const handleMessage = useCallback(
    (message: ServerMessage) => {
      if (message.type === "word_detected" && message.payload) {
        const detectedWord = message.payload;
        setWords((prev: Word[]) =>
          prev.map((w) =>
            w.word.toLowerCase() === detectedWord.toLowerCase()
              ? { ...w, active: false }
              : w
          )
        );
      }

      if (message.type === "all_words_completed") {
        setPendingExit(true);
      }
    },
    [handleDisconnect, router, videoId]
  );

  useEffect(() => {
    const allCompleted =
      words.length > 0 && words.every((entry) => entry.active === false);
    if (!allCompleted) return;
    setPendingExit(true);
  }, [handleDisconnect, router, videoId, words]);

  const handleKeepPracticing = () => setShowExitModal(false);

  const handleEndConversation = () => {
    setShowExitModal(false);
    handleDisconnect?.();
    router.replace(`/videos/${videoId}`);
  };

  const normalizeForMatch = (value: string) =>
    value
      .toLowerCase()
      .replace(/[\s\p{P}\p{S}]/gu, "")
      .trim();

  const romanize = (word: string) => {
    const map: Record<string, string> = {
      "りんご": "ringo",
      "あい": "ai",
      "ねこ": "neko",
      "いぬ": "inu",
      "みず": "mizu",
      "やま": "yama",
      "ともだち": "tomodachi",
      "ほん": "hon",
    };
    return map[word] ?? "";
  };

  const variantsForWord = (word: string) => {
    const map: Record<string, string[]> = {
      "りんご": ["りんご", "リンゴ", "林檎", "り ん ご", "ringo", "lingo"],
      "あい": ["あい", "アイ", "愛", "ai"],
      "ねこ": ["ねこ", "ネコ", "猫", "neko"],
      "いぬ": ["いぬ", "イヌ", "犬", "inu"],
      "みず": ["みず", "ミズ", "水", "mizu"],
      "やま": ["やま", "ヤマ", "山", "yama"],
      "ともだち": ["ともだち", "トモダチ", "友達", "tomodachi"],
      "ほん": ["ほん", "ホン", "本", "hon"],
    };
    return map[word] ?? [word];
  };

  const normalizeRomaji = (value: string) =>
    value.toLowerCase().replace(/[^a-z]/g, "");

  const handleUserTranscript = useCallback(
    (data: UserTranscriptData) => {
      const isFinal = data.final ?? true;
      if (!isFinal || !data.text) return;
      const transcript = data.text.trim();
      if (!transcript) return;
      if (process.env.NODE_ENV !== "production") {
        console.debug("[UserTranscript]", transcript);
      }
      setWords((prev) =>
        prev.map((entry) => {
          if (!entry.active) return entry;
          const target = entry.word.trim();
          if (!target) return entry;
          const normalizedTranscript = normalizeForMatch(transcript);
          const normalizedTarget = normalizeForMatch(target);
          const romaji = romanize(target);
          const normalizedRomaji = normalizeRomaji(romaji);
          const normalizedTranscriptRomaji =
            normalizeRomaji(transcript).replace(/l/g, "r");
          const variants = variantsForWord(target);
          const variantMatch = variants.some((variant) => {
            const normalizedVariant = normalizeForMatch(variant);
            if (normalizedTranscript.includes(normalizedVariant)) return true;
            const variantRomaji = normalizeRomaji(variant).replace(/l/g, "r");
            return (
              variantRomaji &&
              normalizedTranscriptRomaji.includes(variantRomaji)
            );
          });
          const matched =
            normalizedTranscript.includes(normalizedTarget) ||
            transcript.includes(target) ||
            variantMatch ||
            (normalizedRomaji &&
              (normalizedTranscriptRomaji.includes(normalizedRomaji) ||
                normalizedTranscriptRomaji.includes(
                  normalizedRomaji.replace(/r/g, "l")
                )));
          return matched ? { ...entry, active: false } : entry;
        })
      );
    },
    []
  );

  const handleButtonClick = useCallback(() => {
    if (isConnected) {
      handleDisconnect?.();
    } else {
      setIsConnecting(true);
      handleConnect?.();
    }
  }, [isConnected, handleConnect, handleDisconnect]);

  // RTVI Event Subscriptions
  useRTVIClientEvent(RTVIEvent.ServerMessage, handleMessage);
  useRTVIClientEvent(RTVIEvent.UserTranscript, handleUserTranscript);

  useRTVIClientEvent(RTVIEvent.Connected, () => {
    setIsConnected(true);
    setIsConnecting(false);
  });

  useRTVIClientEvent(RTVIEvent.BotStoppedSpeaking, () => {
    if (!pendingExit) return;
    handleDisconnect?.();
    router.replace(`/videos/${videoId}`);
  });

  useRTVIClientEvent(RTVIEvent.Disconnected, () => {
    setIsConnected(false);
    setIsConnecting(false);
  });

  // Render
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          alt="Conversation background"
          fill
          priority
          className="bg-[#0f1f1a] object-contain"
          src={conversationBg}
        />
        <div className="absolute inset-0 bg-black/5" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full gap-10 px-10 py-10">
        <aside className="w-[320px] shrink-0 pt-20">
          <WordTracker words={words} />
        </aside>

        <section className="relative flex flex-1 items-stretch">
          <div className="absolute right-8 top-16 w-full max-w-[520px]">
            <AgentSpeechBubble />
          </div>

          <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/70 bg-white/90 px-6 py-3 shadow-xl backdrop-blur">
            <UserAudioControl size="lg" />
            <ConnectionButton
              isConnected={isConnected}
              isConnecting={isConnecting}
              onClick={handleButtonClick}
            />
          </div>
        </section>
      </div>

      {showExitModal && (
        <ExitModal
          onKeepPracticing={handleKeepPracticing}
          onEndConversation={handleEndConversation}
        />
      )}
    </div>
  );
};
